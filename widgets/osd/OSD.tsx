// @ts-nocheck
import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import Wp from "gi://AstalWp";
import { timeout, Variable, bind } from "astal";

export default function OSD(monitor: Gdk.Monitor) {
    const { BOTTOM } = Astal.WindowAnchor;
    const audio = Wp.get_default()?.audio;
    const speaker = audio?.defaultSpeaker;

    if (!speaker) {
        console.warn("OSD: No speaker found, widget won't display");
        return null;
    }

    const visible = Variable(false);
    let hideTimer: number | null = null;

    const showOSD = () => {
        visible.set(true);
        if (hideTimer) {
            clearTimeout(hideTimer);
        }
        hideTimer = setTimeout(() => visible.set(false), 2000);
    };

    // Conectar a las señales del speaker usando GObject
    speaker.connect("notify::volume", showOSD);
    speaker.connect("notify::mute", showOSD);

    return (
        <window
            name="OSD"
            namespace="osd"
            gdkmonitor={monitor}
            layer={Astal.Layer.OVERLAY}
            anchor={BOTTOM}
            margin={100}
            visible={bind(visible)}
        >
            <box cssClasses={["osd-container"]} vertical>
                <box className="osd-content" spacing={10}>
                    <image
                        iconName={bind(speaker, "volumeIcon")}
                        cssClasses={["osd-icon"]}
                    />
                    <label
                        label={bind(speaker, "volume").as(v => `${Math.round(v * 100)}%`)}
                        cssClasses={["osd-label"]}
                    />
                </box>
                <levelbar
                    cssClasses={["osd-bar"]}
                    value={bind(speaker, "volume")}
                />
            </box>
        </window>
    );
}
