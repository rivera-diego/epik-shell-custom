import PopupWindow from "../common/PopupWindow";
import DarkModeQS from "./buttons/DarkModeQS";
import ColorPickerQS from "./buttons/ColorPickerQS";
import DontDisturbQS from "./buttons/DontDisturbQS";
import MicQS from "./buttons/MicQS";
import VolumeBox from "./VolumeBox";
import { FlowBox } from "../common/FlowBox";
import { Gtk, App, Gdk } from "astal/gtk4";
import { WINDOW_NAME as POWERMENU_WINDOW } from "../powermenu/PowerMenu";
import { bind, Binding, GObject, Variable } from "astal";
import options from "../../options";
import { toggleWallpaperPicker } from "../wallpaperpicker/WallpaperPicker";
import SpeakerPage from "./pages/SpeakerPage";

export const WINDOW_NAME = "quicksettings";
export const qsPage = Variable("main");
const { bar } = options;

const layout = Variable.derive(
  [bar.position, bar.start, bar.center, bar.end],
  (pos, start, center, end) => {
    if (start.includes("quicksetting")) return `${pos}_left`;
    if (center.includes("quicksetting")) return `${pos}_center`;
    if (end.includes("quicksetting")) return `${pos}_right`;

    return `${pos}_center`;
  },
);

function QSButtons() {
  return (
    <FlowBox
      maxChildrenPerLine={3}
      activateOnSingleClick={false}
      homogeneous
      rowSpacing={6}
      columnSpacing={6}
    >
      <DarkModeQS />
      <ColorPickerQS />
      <MicQS />
      <DontDisturbQS />
    </FlowBox>
  );
}

function Header() {
  return (
    <box hexpand={false} cssClasses={["header"]} spacing={6}>
      <label label={"Quick Setting"} hexpand xalign={0} />
      <button
        onClicked={() => {
          App.toggle_window(WINDOW_NAME);
          toggleWallpaperPicker();
        }}
        iconName={"preferences-desktop-wallpaper-symbolic"}
      />
      {/* Battery button removed - AstalBattery not available */}
      <button
        cssClasses={["powermenu"]}
        onClicked={() => {
          App.toggle_window(WINDOW_NAME);
          App.toggle_window(POWERMENU_WINDOW);
        }}
      >
        <image
          iconName={"system-shutdown-symbolic"}
          iconSize={Gtk.IconSize.NORMAL}
        />
      </button>
    </box>
  );
}

function ArrowButton<T extends GObject.Object>({
  icon,
  title,
  subtitle,
  onClicked,
  onArrowClicked,
  connection: [gobject, property],
}: {
  icon: string | Binding<string>;
  title: string;
  subtitle: string | Binding<string>;
  onClicked: () => void;
  onArrowClicked: () => void;
  connection: [T, keyof T];
}) {
  return (
    <box
      cssClasses={bind(gobject, property).as((p) => {
        const classes = ["arrow-button"];
        p && classes.push("active");
        return classes;
      })}
    >
      <button onClicked={onClicked}>
        <box halign={Gtk.Align.START} spacing={6}>
          <image iconName={icon} iconSize={Gtk.IconSize.LARGE} />
          <box vertical hexpand>
            <label xalign={0} label={title} cssClasses={["title"]} />
            <label xalign={0} label={subtitle} cssClasses={["subtitle"]} />
          </box>
        </box>
      </button>
      <button iconName={"go-next-symbolic"} onClicked={onArrowClicked} />
    </box>
  );
}



function MainPage() {
  return (
    <box cssClasses={["qs-page"]} name={"main"} vertical spacing={6}>
      <Header />
      <Gtk.Separator />
      <QSButtons />
      <VolumeBox />
    </box>
  );
}

function QSWindow(_gdkmonitor: Gdk.Monitor) {
  return (
    <PopupWindow
      name={WINDOW_NAME}
      layout={layout.get()}
      animation="slide top"
      onDestroy={() => layout.drop()}
    >
      <box
        cssClasses={["window-content", "qs-container"]}
        hexpand={false}
        vexpand={false}
        vertical
      >
        <stack
          visibleChildName={qsPage()}
          transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
        >
          <MainPage />
          <SpeakerPage />
        </stack>
      </box>
    </PopupWindow>
  );
}

export default function (gdkmonitor: Gdk.Monitor) {
  QSWindow(gdkmonitor);

  App.connect("window-toggled", (_, win) => {
    if (win.name == WINDOW_NAME && !win.visible) {
      qsPage.set("main");
    }
  });

  layout.subscribe(() => {
    App.remove_window(App.get_window(WINDOW_NAME)!);
    QSWindow(gdkmonitor);
  });
}
