import { bind } from "astal";
import { App, Gtk } from "astal/gtk4";
import { ram } from "./SystemData";

export default function SysInfoPanelButton() {
    return (
        <button
            cssClasses={["panel-button", "sysinfo"]}
            onClicked={() => App.toggle_window("sysinfo-popup")}
        >
            <box spacing={8}>
                <label label="" cssClasses={["sysinfo-label"]} />
                <label label={bind(ram).as(r => r.text)} />
            </box>
        </button>
    );
}
