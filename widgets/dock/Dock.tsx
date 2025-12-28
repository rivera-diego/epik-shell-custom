import { Variable } from "astal";
import { App, Astal, Gdk, Gtk, hook } from "astal/gtk4";
import AstalHyprland from "gi://AstalHyprland";
import DockApps from "./DockApps";
import options from "../../options";
import { WindowProps } from "astal/gtk4/widget";
import { windowAnimation } from "../../utils/hyprland";

const hyprland = AstalHyprland.get_default();
const { TOP, BOTTOM } = Astal.WindowAnchor;
const { dock } = options;

const updateVisibility = () => {
  const focusedWs = hyprland.get_focused_workspace();
  if (!focusedWs) return true;

  return (
    hyprland.get_workspace(focusedWs.id)?.get_clients()
      .length <= 0
  );
};

// transparent window to detect hover
function DockHover(
  _gdkmonitor: Gdk.Monitor,
  dockVisible: Variable<boolean>
) {
  const anchor = dock.position.get() == "top" ? TOP : BOTTOM;

  return (
    <window
      visible={dockVisible((v) => !v)}
      name={"dock-hover"}
      namespace={"dock-hover"}
      setup={(self) => {
        hook(self, App, "window-toggled", (_, win) => {
          if (win.name == "dock" && win.visible) {
            self.visible = false;
          }
        });
      }}
      layer={Astal.Layer.TOP}
      anchor={anchor}
      application={App}
      onHoverEnter={() => {
        App.get_window("dock")!.set_visible(true);
      }}
    >
      <box
        cssClasses={["dock-padding"]}
        widthRequest={widthVar()}
        heightRequest={heightVar()}
      >
        placeholder
      </box>
    </window>
  );
}

type DockProps = WindowProps & {
  gdkmonitor: Gdk.Monitor;
  dockVisible: Variable<boolean>;
  animation?: string;
};

function Dock({ gdkmonitor, dockVisible, ...props }: DockProps) {
  const anchor = dock.position.get() == "top" ? TOP : BOTTOM;

  return (
    <window
      visible={dockVisible()}
      name={"dock"}
      namespace={"dock"}
      layer={Astal.Layer.TOP}
      anchor={anchor}
      setup={(self) => {
        hook(self, App, "window-toggled", (_, win) => {
          if (win.name == "dock-hover" && win.visible) {
            self.visible = false;
          }
          if (win.name == "dock") {
            const size = getSize(win);
            heightVar.set(
              getHoverHeight() > size!.height ? size!.height : getHoverHeight(),
            );
            widthVar.set(size!.width);
          }
        });
      }}
      onHoverLeave={() => {
        if (!updateVisibility()) {
          App.get_window("dock-hover")!.set_visible(true);
        }
      }}
      application={App}
      {...props}
    >
      <box>
        <box hexpand />
        <DockApps />
        <box hexpand />
      </box>
    </window>
  );
}

const widthVar = Variable(0);
const heightVar = Variable(0);
const getSize = (win: Gtk.Window) => win.get_child()!.get_preferred_size()[0];
const getHoverHeight = () => {
  const pos = dock.position.get() == "top" ? 0 : 2;
  const hyprlandGapsOut = hyprland
    .message("getoption general:gaps_out")
    .split("\n")[0]
    .split("custom type: ")[1]
    .split(" ")
    .map((e) => parseInt(e));
  return hyprlandGapsOut.length >= 3
    ? hyprlandGapsOut[pos]
    : hyprlandGapsOut[0];
};

function setHoverSize() {
  const dockWindow = App.get_window("dock");
  const size = getSize(dockWindow!);

  widthVar.set(size!.width);
  heightVar.set(
    getHoverHeight() > size!.height ? size!.height : getHoverHeight(),
  );
}

export default function (gdkmonitor: Gdk.Monitor) {
  // Variable LOCAL - se recrea cada vez que se instancia el dock
  const dockVisible = Variable(updateVisibility());

  // Observar cambios de Hyprland y actualizar visibilidad
  dockVisible
    .observe(hyprland, "notify::clients", () => {
      return updateVisibility();
    })
    .observe(hyprland, "notify::focused-workspace", () => {
      return updateVisibility();
    });

  // Crear ventanas pasando la variable local
  <Dock
    gdkmonitor={gdkmonitor}
    dockVisible={dockVisible}
    animation={`slide ${dock.position.get()}`}
  />;

  DockHover(gdkmonitor, dockVisible);
  setHoverSize();

  // Manejar cambios de posición del dock
  dock.position.subscribe(() => {
    dockVisible.drop();
    const dockW = App.get_window("dock")!;
    dockW.set_child(null);
    dockW.destroy();

    <Dock
      gdkmonitor={gdkmonitor}
      dockVisible={dockVisible}
      animation={`slide ${dock.position.get()}`}
    />;

    const dockHover = App.get_window("dock-hover")!;
    dockHover.set_child(null);
    dockHover.destroy();

    setHoverSize();

    dockVisible
      .observe(hyprland, "notify::clients", () => {
        return updateVisibility();
      })
      .observe(hyprland, "notify::focused-workspace", () => {
        return updateVisibility();
      });

    DockHover(gdkmonitor, dockVisible);
    windowAnimation();
  });
}
