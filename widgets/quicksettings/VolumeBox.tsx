import { bind, Variable } from "astal";
import { Gtk } from "astal/gtk4";
import AstalWp from "gi://AstalWp";
import { qsPage } from "./QSWindow";

export default function VolumeBox() {
  const speaker = AstalWp.get_default()?.audio!.defaultSpeaker!;

  // Derive icon from both volume and mute state
  const volumeIcon = Variable.derive(
    [bind(speaker, "volume"), bind(speaker, "mute")],
    (volume, muted) => {
      if (muted) return "󰸈"; // Mute
      if (volume <= 0.33) return ""; // Low (0-33%)
      if (volume <= 1.0) return ""; // Medium (34-100%)
      if (volume > 1.0) return ""; // High (>100%, hasta 175%)
    }
  );

  return (
    <box
      cssClasses={["qs-box", "volume-box"]}
      valign={Gtk.Align.CENTER}
      spacing={10}
      onDestroy={() => volumeIcon.drop()}
    >
      <label
        cssClasses={["nerd-icon"]}
        valign={Gtk.Align.CENTER}
        label={volumeIcon()}
      />
      <slider
        onChangeValue={(self) => {
          speaker.volume = self.value;
        }}
        min={0}
        max={1.75}
        value={bind(speaker, "volume")}
        hexpand
      />
      <button
        iconName={"go-next-symbolic"}
        onClicked={() => qsPage.set("speaker")}
      />
    </box>
  );
}
