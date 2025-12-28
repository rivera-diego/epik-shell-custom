import { App } from "astal/gtk4";
import PanelButton from "../common/PanelButton";
import { WINDOW_NAME } from "../kanban/KanbanWindow";

export default function KanbanPanelButton() {
    return (
        <PanelButton
            window={WINDOW_NAME}
            onClicked={() => {
                App.toggle_window(WINDOW_NAME);
            }}
        >
            <label label="󰃭" cssClasses={["nerd-icon"]} />
        </PanelButton>
    );
}
