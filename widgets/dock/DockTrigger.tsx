import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import { Variable } from "astal";

export default function DockTrigger({ monitor }: { monitor: Gdk.Monitor }) {
    // Generamos el nombre único del dock asociado a este monitor
    // Debe coincidir con el nombre que le pondremos en Dock.tsx
    const dockName = `dock-${monitor.model}`;

    return (
        <box
            className="dock-trigger"
            valign={Gtk.Align.FILL}
            halign={Gtk.Align.CENTER}
            widthRequest={400} // Ancho suficiente para ser fácil de "atinar"
            onHoverEnter={() => {
                // Al pasar el mouse, mostramos el dock ESPECÍFICO de este monitor
                const dock = App.get_window(dockName);
                if (dock) {
                    dock.visible = true;
                }
            }}
        >
            {/* Visualmente invisible o una pequeña línea indicadora si se desea */}
        </box>
    );
}
