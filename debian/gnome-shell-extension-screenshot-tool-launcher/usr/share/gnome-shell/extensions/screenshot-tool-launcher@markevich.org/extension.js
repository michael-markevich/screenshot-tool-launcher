import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

Gio._promisify(Gio.File.prototype, 'load_bytes_async');
Gio._promisify(Gio.OutputStream.prototype, 'write_bytes_async');
Gio._promisify(Gio.OutputStream.prototype, 'close_async');
Gio._promisify(Gio.Subprocess.prototype, 'wait_check_async');

export default class ScreenshotToolLauncherExtension extends Extension {
    enable() {
        this._log = this.getLogger();
        this._settings = this.getSettings();
        this._pendingNotification = null;
        this._lastRecordingFile = null;
        this._screenshotSource = null;

        Main.screenshotUI.connectObject(
            'screenshot-taken', (_ui, file) => {
                this._onScreenshotTaken(file);
            },
            'notify::screencast-in-progress', ui => {
                if (!ui.screencast_in_progress) {
                    const path = Main.screenshotUI._screencastPath;
                    if (path)
                        this._lastRecordingFile = Gio.File.new_for_path(path);
                }
            },
            this);

        Main.messageTray.connectObject(
            'source-added', (_tray, source) => this._onSourceAdded(source),
            this);

        for (const source of Main.messageTray.getSources())
            this._onSourceAdded(source);

        this._log.log('enabled');
    }

    disable() {
        Main.screenshotUI.disconnectObject(this);
        Main.messageTray.disconnectObject(this);

        if (this._screenshotSource)
            this._screenshotSource.disconnectObject(this);

        this._screenshotSource = null;
        this._pendingNotification = null;
        this._lastRecordingFile = null;
        this._settings = null;
        this._log.log('disabled');
        this._log = null;
    }

    _isScreenshotSource(source) {
        const icon = source.icon;
        if (!(icon instanceof Gio.ThemedIcon))
            return false;
        return icon.get_names().some(n => n.startsWith('screenshot'));
    }

    _onSourceAdded(source) {
        if (!this._isScreenshotSource(source))
            return;

        if (this._screenshotSource === source)
            return;

        if (this._screenshotSource)
            this._screenshotSource.disconnectObject(this);

        this._screenshotSource = source;

        source.connectObject(
            'notification-added', (_source, notification) => {
                this._onNotificationAdded(notification);
            },
            'destroy', () => {
                this._screenshotSource = null;
            },
            this);
    }

    _onNotificationAdded(notification) {
        if (this._lastRecordingFile) {
            const file = this._lastRecordingFile;
            this._lastRecordingFile = null;
            const command = this._settings.get_string('recording-command');
            const label =
                this._settings.get_string('recording-button-label');

            if (command && label) {
                notification.addAction(label, () => {
                    this._runCommand(command, file, false).catch(e => {
                        this._log.error(`Command failed: ${e.message}`);
                    });
                });
            }
            return;
        }

        // For screenshots, the notification fires before screenshot-taken.
        // Stash it so _onScreenshotTaken can add the action.
        this._pendingNotification = notification;
    }

    _onScreenshotTaken(file) {
        const notification = this._pendingNotification;
        this._pendingNotification = null;

        if (!notification)
            return;

        const command = this._settings.get_string('command');
        const label = this._settings.get_string('button-label');
        const pipeMode = this._settings.get_boolean('pipe-mode');

        if (!command || !label)
            return;

        notification.addAction(label, () => {
            this._runCommand(command, file, pipeMode).catch(e => {
                this._log.error(`Command failed: ${e.message}`);
            });
        });
    }

    async _runCommand(commandTemplate, file, pipeMode) {
        const filePath = file.get_path();
        let commandStr;

        if (commandTemplate.includes('{file}'))
            commandStr = commandTemplate.replaceAll(
                '{file}', GLib.shell_quote(filePath));
        else
            commandStr = `${commandTemplate} ${GLib.shell_quote(filePath)}`;

        const [, argv] = GLib.shell_parse_argv(commandStr);

        const flags = pipeMode
            ? Gio.SubprocessFlags.STDIN_PIPE
            : Gio.SubprocessFlags.NONE;

        const subprocess = new Gio.Subprocess({argv, flags});
        subprocess.init(null);

        if (pipeMode) {
            const [bytes] = await file.load_bytes_async(null);
            const stdin = subprocess.get_stdin_pipe();
            await stdin.write_bytes_async(bytes, GLib.PRIORITY_DEFAULT, null);
            await stdin.close_async(GLib.PRIORITY_DEFAULT, null);
        }

        await subprocess.wait_check_async(null);
    }
}
