import { bind } from "astal";
import { Gtk } from "astal/gtk4";
import AstalMpris from "gi://AstalMpris";
import Pango from "gi://Pango";

export default function MediaPanelButton() {
    const mpris = AstalMpris.get_default();

    return (
        <box
            visible={bind(mpris, "players").as(p => p.length > 0)}
            className="media-panel-button"
        >
            {bind(mpris, "players").as((players) => {
                if (players.length === 0) return <box />;
                const player = players[0];

                const title = bind(player, "title").as((t) => t || "Unknown");
                const artist = bind(player, "artist").as((a) => a || "Unknown");
                const playIcon = bind(player, "playbackStatus").as((s) =>
                    s === AstalMpris.PlaybackStatus.PLAYING
                        ? "media-playback-pause-symbolic"
                        : "media-playback-start-symbolic"
                );

                return (
                    <box className="media-controls-container" spacing={4}>
                        <button
                            className="panel-button media-control"
                            onClicked={() => { if (player.canGoPrevious) player.previous(); }}
                            sensitive={bind(player, "canGoPrevious")}
                            opacity={bind(player, "canGoPrevious").as(can => can ? 1 : 0.5)}
                        >
                            <image iconName="media-skip-backward-symbolic" />
                        </button>

                        <button
                            className="panel-button media-main"
                            onClicked={() => player.play_pause()}
                            tooltipText={bind(player, "title").as(t => `Now Playing: ${t}`)}
                        >
                            <box spacing={8}>
                                <image iconName={playIcon} />
                                <label
                                    label={bind(title).as(t => {
                                        if (t.length > 20) return t.substring(0, 20) + "...";
                                        return t;
                                    })}
                                    ellipsize={Pango.EllipsizeMode.END}
                                    maxWidthChars={20}
                                />
                            </box>
                        </button>

                        <button
                            className="panel-button media-control"
                            onClicked={() => { if (player.canGoNext) player.next(); }}
                            sensitive={bind(player, "canGoNext")}
                            opacity={bind(player, "canGoNext").as(can => can ? 1 : 0.5)}
                        >
                            <image iconName="media-skip-forward-symbolic" />
                        </button>
                    </box>
                );
            })}
        </box>
    );
}
