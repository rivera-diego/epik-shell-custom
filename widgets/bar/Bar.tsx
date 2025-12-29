import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import TimePanelButton from "./TimePanelButton";
import WorkspacesPanelButton from "./WorkspacesPanelButton";

import LauncherPanelButton from "./LauncherPanelButton";
import NotifPanelButton from "./NotifPanelButton";
import QSPanelButton from "./QSPanelButton";
import KanbanPanelButton from "./KanbanPanelButton";
import { separatorBetween } from "../../utils";
import options from "../../options";
import { idle } from "astal";
import { windowAnimation } from "../../utils/hyprland";
import { WindowProps } from "astal/gtk4/widget";
import TrayPanelButton from "./TrayPanelButton";

const { bar } = options;
const { start, center, end } = bar;

import DockTrigger from "../dock/DockTrigger";
import MediaPanelButton from "./MediaPanelButton";
import SysInfoPanelButton from "./SysInfoPanelButton";
import KeyboardPanelButton from "./KeyboardPanelButton";

const panelButton = {
  launcher: (m: Gdk.Monitor) => <LauncherPanelButton />,
  workspace: (m: Gdk.Monitor) => <WorkspacesPanelButton />,
  time: (m: Gdk.Monitor) => <TimePanelButton />,
  notification: (m: Gdk.Monitor) => <NotifPanelButton />,
  quicksetting: (m: Gdk.Monitor) => <QSPanelButton />,
  tray: (m: Gdk.Monitor) => <TrayPanelButton />,
  kanban: (m: Gdk.Monitor) => <KanbanPanelButton />,
  docktrigger: (m: Gdk.Monitor) => <DockTrigger monitor={m} />,
  media: (m: Gdk.Monitor) => <MediaPanelButton />,
  sysinfo: (m: Gdk.Monitor) => <SysInfoPanelButton />,
  keyboard: (m: Gdk.Monitor) => <KeyboardPanelButton />,
};

function Start({ monitor }: { monitor: Gdk.Monitor }) {
  return (
    <box halign={Gtk.Align.START} cssClasses={["bar-start"]}>
      {start((s) => [
        ...separatorBetween(
          s.map((s) => panelButton[s](monitor)),
          Gtk.Orientation.VERTICAL,
        ),
      ])}
    </box>
  );
}

function Center({ monitor }: { monitor: Gdk.Monitor }) {
  return (
    <box cssClasses={["bar-center"]}>
      {center((c) =>
        separatorBetween(
          c.map((w) => panelButton[w](monitor)),
          Gtk.Orientation.VERTICAL,
        ),
      )}
    </box>
  );
}

function End({ monitor }: { monitor: Gdk.Monitor }) {
  return (
    <box halign={Gtk.Align.END} cssClasses={["bar-end"]}>
      {end((e) =>
        separatorBetween(
          e.map((w) => panelButton[w](monitor)),
          Gtk.Orientation.VERTICAL,
        ),
      )}
    </box>
  );
}

type BarProps = WindowProps & {
  gdkmonitor: Gdk.Monitor;
  animation: string;
};
function Bar({ gdkmonitor, ...props }: BarProps) {
  const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;
  const anc = bar.position.get() == "top" ? TOP : BOTTOM;

  return (
    <window
      visible
      setup={(self) => {
        // problem when change bar size via margin/padding live
        // https://github.com/wmww/gtk4-layer-shell/issues/60
        self.set_default_size(1, 1);
      }}
      name={"bar"}
      namespace={"bar"}
      gdkmonitor={gdkmonitor}
      anchor={anc | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      application={App}
      {...props}
    >
      <centerbox cssClasses={["bar-container", !bar.separator.get() ? "split" : ""]}>
        <Start monitor={gdkmonitor} />
        <Center monitor={gdkmonitor} />
        <End monitor={gdkmonitor} />
      </centerbox>
    </window>
  );
}

export default function (gdkmonitor: Gdk.Monitor) {
  <Bar gdkmonitor={gdkmonitor} animation="slide top" />;

  // Store subscription reference for cleanup
  const positionSub = bar.position.subscribe(() => {
    App.toggle_window("bar");
    const barWindow = App.get_window("bar")!;
    barWindow.set_child(null);
    App.remove_window(App.get_window("bar")!);
    idle(() => {
      <Bar gdkmonitor={gdkmonitor} animation="slide top" />;
      windowAnimation();
    });
  });

  // Cleanup on window destroy
  const window = App.get_window("bar");
  if (window) {
    window.connect("destroy", () => {
      positionSub();
    });
  }
}
