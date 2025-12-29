import { App, Astal, Gdk, Gtk } from "astal/gtk4";
import DockApps from "./DockApps";
import options from "../../options";
import { WindowProps } from "astal/gtk4/widget";

const { TOP } = Astal.WindowAnchor;

// Popup Dock - Controlled by Trigger
function Dock({ gdkmonitor, ...props }: WindowProps & { gdkmonitor: Gdk.Monitor }) {
  const dockName = `dock-${gdkmonitor.model}`;

  return (
    <window
      visible={false} // Hidden by default, opened by DockTrigger
      name={dockName}
      namespace={"dock"}
      gdkmonitor={gdkmonitor}
      layer={Astal.Layer.OVERLAY} // Overlay to sit on top of bar gap
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP}
      application={App}
      onHoverLeave={() => {
        // Al salir del dock, lo cerramos
        const dock = App.get_window(dockName);
        if (dock) dock.visible = false;
      }}
      {...props}
    >
      <box cssClasses={["dock-container"]}>
        <DockApps />
      </box>
    </window>
  );
}

// Cleanup Dock.tsx - Remove unused logic
export default function (gdkmonitor: Gdk.Monitor) {
  <Dock gdkmonitor={gdkmonitor} />;
}
