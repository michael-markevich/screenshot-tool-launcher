import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences}
    from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ScreenshotToolPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const screenshotPage = new Adw.PreferencesPage({
            title: 'Screenshots',
            iconName: 'camera-photo-symbolic',
        });
        window.add(screenshotPage);

        const screenshotGroup = new Adw.PreferencesGroup({
            title: 'Screenshot Settings',
            description: 'Configure the action button on screenshot notifications',
        });
        screenshotPage.add(screenshotGroup);

        const commandRow = new Adw.EntryRow({
            title: 'Command',
            showApplyButton: true,
        });
        commandRow.set_tooltip_text(
            'Use {file} as placeholder for the file path. '
            + 'If omitted, the path is appended as the last argument.');
        settings.bind('command', commandRow,
            'text', Gio.SettingsBindFlags.DEFAULT);
        screenshotGroup.add(commandRow);

        const labelRow = new Adw.EntryRow({
            title: 'Button Label',
            showApplyButton: true,
        });
        settings.bind('button-label', labelRow,
            'text', Gio.SettingsBindFlags.DEFAULT);
        screenshotGroup.add(labelRow);

        const pipeRow = new Adw.SwitchRow({
            title: 'Pipe Mode',
            subtitle: 'Pipe file contents to stdin instead of passing the path',
        });
        settings.bind('pipe-mode', pipeRow,
            'active', Gio.SettingsBindFlags.DEFAULT);
        screenshotGroup.add(pipeRow);

        const recordingPage = new Adw.PreferencesPage({
            title: 'Recordings',
            iconName: 'media-record-symbolic',
        });
        window.add(recordingPage);

        const recordingGroup = new Adw.PreferencesGroup({
            title: 'Recording Settings',
            description:
                'Configure the action button on screen recording notifications',
        });
        recordingPage.add(recordingGroup);

        const recCommandRow = new Adw.EntryRow({
            title: 'Command',
            showApplyButton: true,
        });
        recCommandRow.set_tooltip_text(
            'Use {file} as placeholder for the file path. '
            + 'If omitted, the path is appended as the last argument.');
        settings.bind('recording-command', recCommandRow,
            'text', Gio.SettingsBindFlags.DEFAULT);
        recordingGroup.add(recCommandRow);

        const recLabelRow = new Adw.EntryRow({
            title: 'Button Label',
            showApplyButton: true,
        });
        settings.bind('recording-button-label', recLabelRow,
            'text', Gio.SettingsBindFlags.DEFAULT);
        recordingGroup.add(recLabelRow);

        window.set_default_size(500, 400);
    }
}
