import { App } from "astal/gtk4";
import PanelButton from "../common/PanelButton";
import { WINDOW_NAME } from "../quicksettings/QSWindow";
import AstalWp from "gi://AstalWp";
import { bind, Variable } from "astal";

function VolumeIcon() {
  const wp = AstalWp.get_default();
  const speaker = wp?.audio.defaultSpeaker!;

  const volumeIcon = Variable.derive(
    [bind(speaker, "volume"), bind(speaker, "mute")],
    (volume, muted) => {
      if (muted) return "󰸈"; // Mute
      if (volume <= 0.33) return ""; // Low (0-33%)
      if (volume <= 1.0) return "󰝝"; // Medium (34-100%)
      return ""; // High (>100%, hasta 175%)
    }
  );

  return (
    <label
      cssClasses={["nerd-icon"]}
      label={volumeIcon()}
      onDestroy={() => volumeIcon.drop()}
    />
  );
}

export default function QSPanelButton() {
  const wp = AstalWp.get_default();

  return (
    <PanelButton
      window={WINDOW_NAME}
      onClicked={() => {
        App.toggle_window(WINDOW_NAME);
      }}
    >
      <box spacing={6}>
        <VolumeIcon />
        <image
          visible={wp?.defaultMicrophone && bind(wp.default_microphone, "mute")}
          iconName="microphone-disabled-symbolic"
        />
      </box>
    </PanelButton>
  );
}
