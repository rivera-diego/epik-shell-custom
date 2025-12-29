// @ts-nocheck
import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import Wp from "gi://AstalWp";
import { timeout, Variable, bind } from "astal";

export default function OSD(monitor: Gdk.Monitor) {
    const { RIGHT } = Astal.WindowAnchor;
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
            anchor={RIGHT}
            marginRight={20}
            visible={bind(visible)}
        >
            <box cssClasses={["osd-container"]} vertical spacing={10}>
                <image
                    iconName={bind(speaker, "volume").as(v => {
                        if (speaker.mute) return "audio-volume-muted-symbolic";
                        if (speaker.mute || v === 0) return "audio-volume-muted-symbolic";
                        if (v < 0.5) return "audio-volume-low-symbolic";
                        if (v < 1.0) return "audio-volume-medium-symbolic";
                        return "audio-volume-high-symbolic"; // v >= 1.0 (100%+)
                    })}
                    cssClasses={["osd-icon"]}
                />
                <label
                    label={bind(speaker, "volume").as(v => `${Math.round(v * 100)}%`)}
                    cssClasses={["osd-label"]}
                    xalign={0.5}
                />
                <levelbar
                    cssClasses={["osd-bar"]}
                    orientation={Gtk.Orientation.VERTICAL}
                    inverted={true}
                    value={bind(speaker, "volume").as(v => v / 2)}
                />
            </box>
        </window>
    );
}
