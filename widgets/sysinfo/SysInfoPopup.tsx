import { App, Gdk, Gtk } from "astal/gtk4";
import { bind, Variable } from "astal";
import { ram, cpu, gpu } from "../bar/SystemData";
import { WindowProps } from "astal/gtk4/widget";
import PopupWindow from "../common/PopupWindow";
import options from "../../options";

export const WINDOW_NAME = "sysinfo-popup";
const { bar } = options;

// Calcular posición basada en la barra
const layout = Variable.derive(
    [bar.position, bar.start, bar.center, bar.end],
    (pos, start, center, end) => {
        // Si está en el end, top_right o bottom_right
        if (end.includes("sysinfo")) return `${pos}_right`;
        if (center.includes("sysinfo")) return `${pos}_center`;
        if (start.includes("sysinfo")) return `${pos}_left`;

        return `${pos}_right`; // Default
    },
);

export default function SysInfoPopup(gdkmonitor: Gdk.Monitor) {
    return (
        <PopupWindow
            name={WINDOW_NAME}
            layout={layout.get()}
            gdkmonitor={gdkmonitor}
        // onClose / onDestroy logic si fuera necesario, PopupWindow ya maneja toggle
        >
            <box
                cssClasses={["sysinfo-popup-content", "window-content"]}
                vertical
                spacing={10}
                widthRequest={220}
            >
                {/* CPU */}
                <box cssClasses={["stat-row"]} spacing={10}>
                    <label label="" className="stat-icon" />
                    <label label="CPU" hexpand halign={Gtk.Align.START} />
                    <label label={bind(cpu).as(c => `${c}%`)} halign={Gtk.Align.END} />
                </box>
                <levelbar
                    value={bind(cpu).as(c => c / 100)}
                    cssClasses={["stat-bar cpu"]}
                />

                <Gtk.Separator cssClasses={["sysinfo-separator"]} />

                {/* RAM */}
                <box cssClasses={["stat-row"]} spacing={10}>
                    <label label="" className="stat-icon" />
                    <label label="RAM" hexpand halign={Gtk.Align.START} />
                    <label label={bind(ram).as(r => `${r.percent}%`)} halign={Gtk.Align.END} />
                </box>
                <label label={bind(ram).as(r => `${r.used}M / ${r.total}M`)} className="stat-detail" halign={Gtk.Align.END} />
                <levelbar
                    value={bind(ram).as(r => r.percent / 100)}
                    cssClasses={["stat-bar ram"]}
                />

                <Gtk.Separator cssClasses={["sysinfo-separator"]} />

                {/* GPU */}
                <box cssClasses={["stat-row"]} spacing={10}>
                    <label label="󰢮" className="stat-icon" />
                    <label label="GPU" hexpand halign={Gtk.Align.START} />
                    <label label={bind(gpu).as(g => `${g.util}%`)} halign={Gtk.Align.END} />
                </box>
                <levelbar
                    value={bind(gpu).as(g => g.util / 100)}
                    cssClasses={["stat-bar gpu"]}
                />
            </box>
        </PopupWindow>
    );
}
