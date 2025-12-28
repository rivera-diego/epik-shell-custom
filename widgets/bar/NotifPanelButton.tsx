import AstalNotifd from "gi://AstalNotifd";
import PanelButton from "../common/PanelButton";
import { App } from "astal/gtk4";
import { bind, Variable } from "astal";
import AstalApps from "gi://AstalApps";
import { WINDOW_NAME } from "../notification/NotificationWindow";

let notifd: any = null;
try {
  notifd = AstalNotifd.get_default();
} catch (e) {
  console.error("AstalNotifd not available:", e);
}

function NotifIcon() {
  if (!notifd) {
    // Fallback icon when notifd is not available
    // Using direct Unicode character (this format works!)
    return <label label="󰂚" cssClasses={["nerd-icon"]} />;
  }

  const getVisible = () =>
    notifd.dont_disturb ? true : notifd.notifications.length <= 0;

  const visibility = Variable(getVisible())
    .observe(notifd, "notify::dont-disturb", () => {
      return getVisible();
    })
    .observe(notifd, "notify::notifications", () => getVisible());

  return (
    <label
      onDestroy={() => visibility.drop()}
      visible={visibility()}
      cssClasses={["nerd-icon"]}
      // Using direct Unicode characters - bell normal: 󰂚, bell-off: 󰂛
      label={bind(notifd, "dont_disturb").as(
        (dnd) => dnd ? "󰂛" : "󰂚",
      )}
    />
  );
}

export default function NotifPanelButton() {
  if (!notifd) {
    // Fallback button when notifd is not available
    return (
      <PanelButton
        window={WINDOW_NAME}
        onClicked={() => {
          App.toggle_window(WINDOW_NAME);
        }}
      >
        <label label="󰂚" cssClasses={["nerd-icon"]} />
      </PanelButton>
    );
  }

  const apps = new AstalApps.Apps();
  const substitute = {
    "Screen Recorder": "screencast-recorded-symbolic",
    Screenshot: "screenshot-recorded-symbolic",
    Hyprpicker: "color-select-symbolic",
  };

  return (
    <PanelButton
      window={WINDOW_NAME}
      onClicked={() => {
        App.toggle_window(WINDOW_NAME);
      }}
    >
      {bind(notifd, "dontDisturb").as((dnd) =>
        !dnd ? (
          <box spacing={6}>
            {bind(notifd, "notifications").as((n) => {
              if (n.length > 0) {
                return [
                  ...n.slice(0, 3).map((e) => {
                    const getFallback = (appName: string) => {
                      const getApp = apps.fuzzy_query(appName);
                      if (getApp.length != 0) {
                        return getApp[0].get_icon_name();
                      }
                      return "unknown";
                    };
                    const fallback =
                      e.app_icon.trim() === ""
                        ? getFallback(e.app_name)
                        : e.app_icon;
                    const icon = substitute[e.app_name] ?? fallback;
                    return <image iconName={icon} />;
                  }),
                  <label
                    visible={n.length > 3}
                    cssClasses={["circle"]}
                    label={""}
                  />,
                ];
              }
              return <NotifIcon />;
            })}
          </box>
        ) : (
          <NotifIcon />
        ),
      )}
    </PanelButton>
  );
}
