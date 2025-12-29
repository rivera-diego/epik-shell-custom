import { timeout, Variable } from "astal";
import { bind } from "astal";
import { App, Gtk } from "astal/gtk4";
import AstalApps from "gi://AstalApps";
import AstalHyprland from "gi://AstalHyprland";
import AstalMpris from "gi://AstalMpris";
import Pango from "gi://Pango";
import options from "../../options";
import { ButtonProps } from "astal/gtk4/widget";

const hyprland = AstalHyprland.get_default();
const application = new AstalApps.Apps();
const iconTheme = new Gtk.IconTheme({ themeName: App.iconTheme });

type AppButtonProps = ButtonProps & {
  app: AstalApps.Application;
  pinned?: boolean;
  term: string;
  client?: AstalHyprland.Client;
};
function AppButton({
  app,
  onClicked,
  term,
  pinned = false,
  client,
}: AppButtonProps) {
  const substitute = {
    Alacritty: "terminal",
    localsend: "send-to",
    "spotify-client": "org.gnome.Lollypop-spotify",
    "org.gnome.Nautilus": "system-file-manager",
  };

  const iconName = `${substitute[app.iconName] ?? app.iconName}-symbolic`;

  return (
    <button
      onClicked={onClicked}
      cssClasses={bind(hyprland, "focusedClient").as((fcsClient) => {
        const classes = ["app-button"];
        if (!fcsClient || !term || !fcsClient.class) return classes;

        const isFocused = !pinned
          ? client?.address === fcsClient.address
          : fcsClient.class.toLowerCase().includes(term.toLowerCase());

        if (isFocused) classes.push("focused");
        return classes;
      })}
    >
      <overlay>
        <box cssClasses={["box"]} />
        <image
          type="overlay"
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          iconName={`${iconName}`}
          pixelSize={iconTheme.has_icon(`${iconName}`) ? 32 : 38}
        />
        <box
          type="overlay"
          cssClasses={["indicator"]}
          valign={Gtk.Align.END}
          halign={Gtk.Align.CENTER}
          visible={bind(hyprland, "clients").as((clients) => {
            return clients
              .filter((e) => e.class)
              .map((e) => e.class.toLowerCase())
              .includes(term.toLowerCase());
          })}
        />
      </overlay>
    </button>
  );
}

function AppsList() {
  const pinnedApps = Variable.derive([options.dock.pinned], (p) => {
    return p
      .map((term) => ({
        app: application.list.find((e) => e.entry.split(".desktop")[0] == term),
        term,
      }))
      .filter(({ app }) => app);
  });

  return (
    <box spacing={6}>
      {pinnedApps((apps) =>
        apps.map(({ app, term }) => (
          <AppButton
            app={app!}
            term={term}
            pinned={true}
            onClicked={() => {
              for (const client of hyprland.get_clients()) {
                if (client.class && client.class.toLowerCase().includes(term.toLowerCase())) {
                  return client.focus();
                }
              }

              app!.launch();
            }}
          />
        )),
      )}
      {bind(hyprland, "clients").as((clients) =>
        clients
          .reverse()
          .map((client) => {
            for (const appClass of options.dock.pinned.get()) {
              if (client.class && client.class.toLowerCase().includes(appClass.toLowerCase())) {
                return;
              }
            }

            for (const app of application.list) {
              if (
                client.class &&
                app.entry
                  .split(".desktop")[0]
                  .toLowerCase()
                  .match(client.class.toLowerCase())
              ) {
                return (
                  <AppButton
                    app={app}
                    onClicked={() => {
                      client.focus();
                    }}
                    term={client.class}
                    client={client}
                  />
                );
              }
            }
          })
          .filter((item) => item !== undefined),
      )}
    </box>
  );
}

// MediaPlayer removed - moved to Bar


export default function DockApps() {
  const mpris = AstalMpris.get_default();
  return (
    <box cssClasses={["window-content", "dock-container"]} hexpand={false}>
      <AppsList />
      <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
      <AppButton
        app={{ iconName: "user-trash" } as AstalApps.Application}
        onClicked={"nautilus trash:///"}
        term={""}
      />
    </box>
  );
}
