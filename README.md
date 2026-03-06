# Screenshot Tool Launcher

GNOME Shell extension that adds a configurable action button to screenshot and screen recording notifications, allowing you to pass the captured file to an external command.

Supports GNOME Shell 47+.

## Install

### Per-user

```bash
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/screenshot-tool-launcher@markevich.org"
mkdir -p "$EXT_DIR"
cp -r screenshot-tool-launcher@markevich.org/* "$EXT_DIR/"
```

### System-wide

```bash
sudo cp -r screenshot-tool-launcher@markevich.org /usr/share/gnome-shell/extensions/
sudo glib-compile-schemas /usr/share/gnome-shell/extensions/screenshot-tool-launcher@markevich.org/schemas/
sudo cp screenshot-tool-launcher@markevich.org/schemas/org.gnome.shell.extensions.screenshot-tool-launcher.gschema.xml \
  /usr/share/glib-2.0/schemas/
sudo glib-compile-schemas /usr/share/glib-2.0/schemas/
```

Restart GNOME Shell to discover the extension:
- **X11:** Alt+F2, type `r`, Enter
- **Wayland:** Log out and log back in

Then enable:

```bash
gnome-extensions enable screenshot-tool-launcher@markevich.org
```

## Configure

### GUI

Open the preferences window from the Extensions app (gear icon) or the command line:

```bash
gnome-extensions prefs screenshot-tool-launcher@markevich.org
```

### Command line

The `gsettings` examples below require a system-wide schema install. Alternatively, use `dconf` directly or `dconf-editor` (GUI):

```bash
# dconf (no schema install needed)
dconf write /org/gnome/shell/extensions/screenshot-tool-launcher/command "'swappy -f {file}'"

# dconf-editor (GUI)
dconf-editor /org/gnome/shell/extensions/screenshot-tool-launcher/
```

### Screenshot command

```bash
gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  command 'your-command {file}'
```

`{file}` is replaced with the screenshot path. If omitted, the path is appended as the last argument.

Examples:

```bash
# Open in GIMP
gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  command 'gimp {file}'

# Open with default viewer
gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  command 'xdg-open {file}'

# Custom script
gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  command '/path/to/your/script.sh {file}'
```

### Recording command

```bash
gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  recording-command 'your-command {file}'
```

### Button labels

```bash
gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  button-label 'Edit in GIMP'

gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  recording-button-label 'Play Recording'
```

### Pipe mode

Pipes the file contents to the command's stdin instead of passing the file path:

```bash
gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  command 'wl-copy --type image/png'
gsettings set org.gnome.shell.extensions.screenshot-tool-launcher \
  pipe-mode true
```

### View all settings

```bash
gsettings list-recursively org.gnome.shell.extensions.screenshot-tool-launcher
```

### Reset to defaults

```bash
gsettings reset-recursively org.gnome.shell.extensions.screenshot-tool-launcher
```

## Settings reference

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `command` | string | `''` | Command for screenshots. `{file}` = file path. Empty = no button. |
| `button-label` | string | `'Open in Tool'` | Button label on screenshot notifications. |
| `pipe-mode` | boolean | `false` | Pipe file to stdin instead of passing path. |
| `recording-command` | string | `''` | Command for recordings. `{file}` = file path. Empty = no button. |
| `recording-button-label` | string | `'Open Recording'` | Button label on recording notifications. |
