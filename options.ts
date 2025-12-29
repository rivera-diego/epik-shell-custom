import { execAsync, GLib } from "astal";
import { mkOptions, opt } from "./utils/option";
import { gsettings } from "./utils";

const options = mkOptions(
  `${GLib.get_user_config_dir()}/epik-shell/config.json`,
  {
    wallpaper: {
      folder: opt(GLib.get_home_dir(), { cached: true }),
      current: opt(
        await execAsync("swww query")
          .then((out) => out.split("image:")[1].trim())
          .catch(() => ""),
        { cached: true },
      ),
    },
    dock: {
      position: opt("bottom"),
      pinned: opt(["org.gnome.Nautilus", "zen", "com.mitchellh.ghostty"]),
    },
    bar: {
      position: opt("top"),
      separator: opt(true),
      start: opt(["launcher", "workspace", "keyboard"]),
      center: opt(["docktrigger"]),
      end: opt(["media", "sysinfo", "kanban", "time", "tray", "quicksetting", "notification"]),
    },
    desktop_clock: {
      position: opt<
        | "top_left"
        | "top"
        | "top_right"
        | "left"
        | "center"
        | "right"
        | "bottom_left"
        | "bottom"
        | "bottom_right"
      >("top_left"),
    },
    theme: {
      mode: opt(
        gsettings.get_string("color-scheme") == "prefer-light"
          ? "light"
          : "dark",
        { cached: true },
      ),
      bar: {
        bg_color: opt("$bg"),
        opacity: opt(1),
        border_radius: opt(6),
        margin: opt(10),
        padding: opt(0),
        border_width: opt(1),
        border_color: opt("$fg"),
        shadow: {
          offset: opt([0]),
          blur: opt(10),
          spread: opt(0),
          color: opt("$fg"),
          opacity: opt(0.5),
        },
        button: {
          bg_color: opt("$bg"),
          fg_color: opt("$fg"),
          opacity: opt(1),
          border_radius: opt(8),
          border_width: opt(0),
          border_color: opt("$fg"),
          padding: opt([0, 4]),
          shadow: {
            offset: opt([0, 0]),
            blur: opt(0),
            spread: opt(0),
            color: opt("$fg"),
            opacity: opt(1),
          },
        },
      },
      window: {
        opacity: opt(1),
        border_radius: opt(6),
        margin: opt(10),
        padding: opt(10),
        dock_padding: opt(4),
        desktop_clock_padding: opt(4),
        border_width: opt(2),
        border_color: opt("$fg"),
        shadow: {
          offset: opt([6, 6]),
          blur: opt(0),
          spread: opt(0),
          color: opt("$fg"),
          opacity: opt(1),
        },
      },
      light: {
        bg: opt("#0a0e27"),
        fg: opt("#00ff9f"),
        accent: opt("#ff00ff"),
        red: opt("#ff0055"),
        // Paleta Semantica Extendida
        primary: opt("#ff00ff"), // Accent
        secondary: opt("#00ff9f"), // FG
        tertiary: opt("#0055ff"), // Extra
        error: opt("#ff0055"),
        utility: opt("#00ffff"),
      },
      dark: {
        bg: opt("#1a1b26"),
        fg: opt("#c0caf5"),
        accent: opt("#7aa2f7"),
        red: opt("#f7768e"),
        // Paleta Semantica Extendida (Base Tokyo Night)
        primary: opt("#7aa2f7"),    // Blue (Action)
        secondary: opt("#9ece6a"),  // Green (Success/Info)
        tertiary: opt("#bb9af7"),   // Magenta (Aux)
        error: opt("#f7768e"),      // Red (Alert)
        utility: opt("#73daca"),    // Teal (Utility)
      },
      // NUEVOS TEMAS
      cyberpunk: {
        bg: opt("#000b1e"),
        fg: opt("#00ff9f"),
        accent: opt("#ff003c"), // Cyber Red
        red: opt("#ff003c"),
        primary: opt("#fcee0a"),    // Yellow Neon
        secondary: opt("#00ff9f"),  // Green Neon
        tertiary: opt("#05d9e8"),   // Blue Neon
        error: opt("#ff2a6d"),      // Pink Neon
        utility: opt("#d1f7ff"),    // White neon
      },
      nord: {
        bg: opt("#2e3440"),
        fg: opt("#d8dee9"),
        accent: opt("#88c0d0"), // Frost Blue
        red: opt("#bf616a"),
        primary: opt("#81a1c1"),    // Blue
        secondary: opt("#a3be8c"),  // Green
        tertiary: opt("#b48ead"),   // Purple
        error: opt("#bf616a"),      // Red
        utility: opt("#ebcb8b"),    // Yellow
      },
      catppuccin: {
        bg: opt("#1e1e2e"),
        fg: opt("#cdd6f4"),
        accent: opt("#cba6f7"), // Mauve
        red: opt("#f38ba8"),
        primary: opt("#89b4fa"),    // Blue
        secondary: opt("#a6e3a1"),  // Green
        tertiary: opt("#f5c2e7"),   // Pink
        error: opt("#f38ba8"),      // Red
        utility: opt("#94e2d5"),    // Teal
      },
      gruvbox: {
        bg: opt("#282828"),
        fg: opt("#ebdbb2"),
        accent: opt("#d79921"), // Yellow
        red: opt("#cc241d"),
        primary: opt("#d65d0e"),    // Orange
        secondary: opt("#98971a"),  // Green
        tertiary: opt("#b16286"),   // Purple
        error: opt("#fb4934"),      // Red
        utility: opt("#458588"),    // Blue
      },
    },
  },
);

/**
 * Widget Monitor Configuration
 * Control which widgets appear on which monitors
 */
export const widgets = {
  /**
   * Widgets that appear on ALL monitors
   * Example: Bar (you want it on every screen)
   */
  allMonitors: [
    "Bar_default",
    "Dock_default",
  ],

  /**
   * Widgets that ONLY appear on the PRIMARY monitor
   * Example: Dock, popups, notifications (avoid duplicates)
   */
  primaryOnly: [
    "DateMenu_default",
    "Applauncher",
    "NotificationPopup",
    "NotificationWindow_default",
    "QSWindow_default",
    "KanbanWindow_default",
    "VerificationWindow",
    "DesktopClock",
    "SysInfoPopup",
    "OSD",
  ],

  /**
   * Widgets that ONLY appear on SECONDARY monitors
   * Example: Secondary clock, weather widget
   * (Currently empty - add widgets here if you want them only on secondary screens)
   */
  secondaryOnly: [

    // Vacío - Agregar widgets que SOLO quieras en monitor secundario
  ],
};

export default options;
