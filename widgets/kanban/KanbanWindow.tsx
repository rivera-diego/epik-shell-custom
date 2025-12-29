import { App, Gdk } from "astal/gtk4";
import PopupWindow from "../common/PopupWindow";
import { Variable } from "astal";
import options from "../../options";
import KanbanColumn from "./KanbanColumn";
import {
    loadKanbanData,
    saveKanbanData,
    generateTaskId,
    type KanbanData,
} from "../../utils/kanban-storage";

export const WINDOW_NAME = "kanban-window";

const { bar } = options;

const layout = Variable.derive(
    [bar.position, bar.start, bar.center, bar.end],
    (pos, start, center, end) => {
        if (start.includes("kanban")) return `${pos}_left`;
        if (center.includes("kanban")) return `${pos}_center`;
        if (end.includes("kanban")) return `${pos}_right`;
        return `${pos}_right`; // Default to right
    },
);

// Estado del Kanban
const kanbanData = Variable<KanbanData>(loadKanbanData());

// Guardar datos automáticamente
function saveData() {
    saveKanbanData(kanbanData.get());
}

// Agregar tarea
function addTask(columnId: keyof KanbanData["columns"], content: string) {
    const data = kanbanData.get();
    const newTask = {
        id: generateTaskId(),
        content,
        createdAt: new Date().toISOString(),
    };

    data.columns[columnId].tasks.push(newTask);
    kanbanData.set({ ...data });
    saveData();
}

// Eliminar tarea
function deleteTask(columnId: keyof KanbanData["columns"], taskId: string) {
    const data = kanbanData.get();
    data.columns[columnId].tasks = data.columns[columnId].tasks.filter(
        (task) => task.id !== taskId
    );
    kanbanData.set({ ...data });
    saveData();
}

// Editar tarea
function editTask(
    columnId: keyof KanbanData["columns"],
    taskId: string,
    newContent: string
) {
    const data = kanbanData.get();
    const task = data.columns[columnId].tasks.find((t) => t.id === taskId);
    if (task) {
        task.content = newContent;
        kanbanData.set({ ...data });
        saveData();
    }
}

// Mover tarea
function moveTask(
    fromColumnId: keyof KanbanData["columns"],
    taskId: string,
    direction: "left" | "right"
) {
    const data = kanbanData.get();
    const columns: Array<keyof KanbanData["columns"]> = ["todo", "in-progress", "done"];
    const currentIndex = columns.indexOf(fromColumnId);

    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const toColumnId = columns[targetIndex];
    const task = data.columns[fromColumnId].tasks.find((t) => t.id === taskId);

    if (task) {
        // Remover de columna actual
        data.columns[fromColumnId].tasks = data.columns[fromColumnId].tasks.filter(
            (t) => t.id !== taskId
        );
        // Agregar a nueva columna
        data.columns[toColumnId].tasks.push(task);
        kanbanData.set({ ...data });
        saveData();
    }
}

function KanbanWindow(_gdkmonitor: Gdk.Monitor) {
    // Derivar las columnas reactivamente
    const todoColumn = kanbanData((data) => data.columns.todo);
    const inProgressColumn = kanbanData((data) => data.columns["in-progress"]);
    const doneColumn = kanbanData((data) => data.columns.done);

    return (
        <PopupWindow
            name={WINDOW_NAME}
            layout={layout.get()}
            animation="popin 80%"
            onDestroy={() => layout.drop()}
        >
            <box
                cssClasses={["window-content", "kanban-container"]}
                hexpand
                vexpand={false}
                spacing={12}
            >
                {/* To Do Column */}
                {todoColumn.as((column) => (
                    <KanbanColumn
                        column={column}
                        onAddTask={(content) => addTask("todo", content)}
                        onDeleteTask={(taskId) => deleteTask("todo", taskId)}
                        onEditTask={(taskId, newContent) => editTask("todo", taskId, newContent)}
                        onMoveTask={(taskId, direction) => moveTask("todo", taskId, direction)}
                        canMoveLeft={false}
                        canMoveRight={true}
                        showAddButton={true}
                    />
                ))}

                {/* In Progress Column */}
                {inProgressColumn.as((column) => (
                    <KanbanColumn
                        column={column}
                        onAddTask={(content) => addTask("in-progress", content)}
                        onDeleteTask={(taskId) => deleteTask("in-progress", taskId)}
                        onEditTask={(taskId, newContent) => editTask("in-progress", taskId, newContent)}
                        onMoveTask={(taskId, direction) => moveTask("in-progress", taskId, direction)}
                        canMoveLeft={true}
                        canMoveRight={true}
                        showAddButton={false}
                    />
                ))}

                {/* Done Column */}
                {doneColumn.as((column) => (
                    <KanbanColumn
                        column={column}
                        onAddTask={(content) => addTask("done", content)}
                        onDeleteTask={(taskId) => deleteTask("done", taskId)}
                        onEditTask={(taskId, newContent) => editTask("done", taskId, newContent)}
                        onMoveTask={(taskId, direction) => moveTask("done", taskId, direction)}
                        canMoveLeft={true}
                        canMoveRight={false}
                        showAddButton={false}
                    />
                ))}
            </box>
        </PopupWindow>
    );
}

export default function (_gdkmonitor: Gdk.Monitor) {
    KanbanWindow(_gdkmonitor);

    // Store subscription reference for cleanup
    const layoutSub = layout.subscribe(() => {
        App.remove_window(App.get_window(WINDOW_NAME)!);
        KanbanWindow(_gdkmonitor);
    });

    // Cleanup on window destroy
    const window = App.get_window(WINDOW_NAME);
    if (window) {
        window.connect("destroy", () => {
            layoutSub();
        });
    }
}
