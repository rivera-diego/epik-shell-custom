import { Gtk } from "astal/gtk4";
import { Variable } from "astal";
import KanbanCard from "./KanbanCard";
import type { KanbanTask, KanbanColumn as KanbanColumnType } from "../../utils/kanban-storage";

interface KanbanColumnProps {
    column: KanbanColumnType;
    onAddTask: (content: string) => void;
    onDeleteTask: (taskId: string) => void;
    onEditTask: (taskId: string, newContent: string) => void;
    onMoveTask: (taskId: string, direction: "left" | "right") => void;
    canMoveLeft: boolean;
    canMoveRight: boolean;
    showAddButton?: boolean;
}

export default function KanbanColumn({
    column,
    onAddTask,
    onDeleteTask,
    onEditTask,
    onMoveTask,
    canMoveLeft,
    canMoveRight,
    showAddButton = false,
}: KanbanColumnProps) {
    const isAddingTask = Variable(false);
    const newTaskContent = Variable("");

    return (
        <box
            cssClasses={["kanban-column"]}
            vertical
            spacing={8}
            hexpand
        >
            {/* Header */}
            <box cssClasses={["column-header"]} spacing={8}>
                <label
                    label={column.title}
                    cssClasses={["column-title"]}
                    hexpand
                    xalign={0}
                />
                <label
                    label={`${column.tasks.length}`}
                    cssClasses={["task-count"]}
                />
            </box>

            {/* Tasks list */}
            <box
                vexpand
                cssClasses={["tasks-container"]}
                vertical
            >
                <box vertical spacing={6}>
                    {column.tasks.map((task) => (
                        <KanbanCard
                            task={task}
                            onDelete={() => onDeleteTask(task.id)}
                            onEdit={(newContent) => onEditTask(task.id, newContent)}
                            onMoveLeft={canMoveLeft ? () => onMoveTask(task.id, "left") : undefined}
                            onMoveRight={canMoveRight ? () => onMoveTask(task.id, "right") : undefined}
                        />
                    ))}
                </box>
            </box>

            {/* Add task section - only in To Do column */}
            {showAddButton && (
                <box spacing={6} cssClasses={["add-task-section"]}>
                    <entry
                        text={newTaskContent.get()}
                        placeholderText="New task..."
                        hexpand
                        onChanged={(self) => newTaskContent.set(self.text)}
                        onActivate={() => {
                            if (newTaskContent.get().trim()) {
                                onAddTask(newTaskContent.get().trim());
                                newTaskContent.set("");
                            }
                        }}
                    />
                    <button
                        cssClasses={["add-button"]}
                        onClicked={() => {
                            if (newTaskContent.get().trim()) {
                                onAddTask(newTaskContent.get().trim());
                                newTaskContent.set("");
                            }
                        }}
                    >
                        <label label="+" cssClasses={["add-icon"]} />
                    </button>
                </box>
            )}
        </box>
    );
}
