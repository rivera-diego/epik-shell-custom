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
      pinned: opt(["firefox", "Alacritty", "org.gnome.Nautilus", "localsend"]),
    },
    bar: {
      position: opt("top"),
      separator: opt(true),
      start: opt(["launcher", "workspace"]),
      center: opt(["time"]),
      end: opt(["tray", "quicksetting", "notification"]),
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
        padding: opt(3),
        border_width: opt(2),
        border_color: opt("$fg"),
        shadow: {
          offset: opt([6, 6]),
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
      },
      dark: {
        bg: opt("#1a1b26"),
        fg: opt("#c0caf5"),
        accent: opt("#7aa2f7"),
        red: opt("#f7768e"),
      },
    },
  },
);

export default options;
