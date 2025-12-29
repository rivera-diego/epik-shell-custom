# Epik Shell - Custom Fork

> [!NOTE]
> This is a customized fork of [Epik Shell](https://github.com/ezerinz/epik-shell) by ezerinz.

A desktop shell based on [Astal](https://github.com/Aylur/Astal/) with custom modifications and enhancements.

## 🎨 Custom Features

This fork includes the following customizations:

### Visual Enhancements
- **Bar Fade Effects**: Gradient fade at bar edges for a modern look
- **Symmetrical Button Gradients**: Panel buttons fade towards the center
- **Removed Focus Ring**: Cleaner button interactions without GTK focus outline

### New Widgets
- **Volume OSD**: On-screen display for volume changes
- **Keyboard Layout Switcher**: Quick keyboard language switching in the bar
- **System Info Panel**: CPU/RAM monitoring widget

### Multi-Monitor Improvements
- Enhanced monitor detection and widget placement
- Configurable per-monitor widget system
- Robust monitor switching support

### Configuration
- Streamlined widget configuration in `options.ts`
- Easy widget enable/disable without code changes
- Optimized for lower RAM usage

## Screenshots

<!-- Add your screenshots or demo video here -->

### Option 1: Screenshots
Upload screenshots to GitHub and use:
```markdown
![Screenshot 1](https://github.com/YOUR-USERNAME/REPO-NAME/assets/...)
![Screenshot 2](https://github.com/YOUR-USERNAME/REPO-NAME/assets/...)
```

### Option 2: Video Demo
Upload a video (MP4/WebM) to GitHub and use:
```markdown
https://github.com/YOUR-USERNAME/REPO-NAME/assets/.../your-video.mp4
```

Or use a GIF:
```markdown
![Demo](https://github.com/YOUR-USERNAME/REPO-NAME/assets/.../demo.gif)
```

---

## Original Credits

- **Original Epik Shell**: [ezerinz/epik-shell](https://github.com/ezerinz/epik-shell)
- **Astal Framework**: [Aylur/Astal](https://github.com/Aylur/Astal/)
- **Widget Inspiration**: [Aylur dotfiles](https://github.com/Aylur/dotfiles)

---

## Dependencies

### Required

- `astal` (`libastal-meta` & `libastal-gjs`) or `aylurs-gtk-shell`
- `dart-sass`
- `esbuild`

### Optional

- `hyprpicker`
- `swappy`
- `wf-recorder`
- `wayshot`
- `slurp`
- `wl-copy`
- `brightnessctl`

```bash
sudo pacman -S libastal-meta libastal-gjs-git dart-sass esbuild hyprpicker swappy wf-recorder wayshot slurp wl-copy brightnessctl
```

---

## Quick Start Guide

1. Clone the repository
   ```bash
   git clone https://github.com/YOUR-USERNAME/epik-shell-fork
   ```
2. Navigate to project directory
   ```bash
   cd epik-shell-fork
   ```
3. Run
   ```bash
   LD_PRELOAD=/usr/lib/libgtk4-layer-shell.so gjs -m build.js
   ```
   You can also use ags:
   ```bash
   ags run --gtk4 -d .
   ```

---

## Configuration

Epik Shell looks for a configuration file in `~/.config/epik-shell/config.json`.

### Widget Configuration

To enable/disable widgets, edit `options.ts`:

```typescript
bar: {
  position: opt("top"),
  separator: opt(true),
  start: opt(["launcher", "workspace"]),
  center: opt(["docktrigger"]),
  end: opt(["media", "sysinfo", "time", "tray", "quicksetting", "notification"]),
},
```

Simply remove widgets from the arrays to disable them and reduce RAM usage.

For detailed configuration options, see the [original documentation](https://github.com/ezerinz/epik-shell).

---

## Themes

### Available Themes

This fork includes 5 built-in themes:
- **Dark** (Tokyo Night) - Default dark theme
- **Light** - Light theme
- **Cyberpunk** - Neon colors with dark background
- **Nord** - Popular Nordic color palette
- **Catppuccin** - Pastel dark theme
- **Gruvbox** - Retro warm colors

### Switching Themes

Edit `~/.config/epik-shell/config.json`:

```json
{
  "theme": {
    "mode": "dark"  // Change to: "light", "cyberpunk", "nord", "catppuccin", or "gruvbox"
  }
}
```

### Creating Custom Themes

To add your own theme, edit `options.ts`:

```typescript
theme: {
  // ... existing themes ...
  
  // Add your custom theme
  myTheme: {
    bg: opt("#1a1b26"),           // Background color
    fg: opt("#c0caf5"),           // Foreground/text color
    accent: opt("#7aa2f7"),       // Accent color (highlights, active states)
    red: opt("#f7768e"),          // Error/warning color
    primary: opt("#7aa2f7"),      // Primary action color
    secondary: opt("#9ece6a"),    // Secondary color
    tertiary: opt("#bb9af7"),     // Tertiary color
    error: opt("#f7768e"),        // Error state color
    utility: opt("#73daca"),      // Utility color
  },
}
```

Then use it in your config:
```json
{
  "theme": {
    "mode": "myTheme"
  }
}
```

### Theme Color Variables

Colors are used throughout the shell:
- `$bg` - Window backgrounds
- `$fg` - Text and borders
- `$accent` - Active workspace, focused elements
- `$error` - Notifications, alerts
- `$primary`, `$secondary`, `$tertiary` - Widget-specific colors

---

## Multi-Monitor Setup

See [MONITOR_CONFIG_GUIDE.md](MONITOR_CONFIG_GUIDE.md) for detailed multi-monitor configuration.

---

## GTK Theme

### Theme Settings

- **Theme:** `adw-gtk3`
- **Icons:** `Colloid`

For GTK theme integration, see the [original documentation](https://github.com/ezerinz/epik-shell#gtk-theme).

---

## License

This project inherits the license from the original [Epik Shell](https://github.com/ezerinz/epik-shell).

---

## Contributing

Feel free to open issues or submit pull requests for improvements!
