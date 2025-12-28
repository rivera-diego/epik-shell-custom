import { Gtk } from "astal/gtk4";
import { Variable } from "astal";
import type { KanbanTask } from "../../utils/kanban-storage";

interface KanbanCardProps {
    task: KanbanTask;
    onDelete: () => void;
    onEdit: (newContent: string) => void;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
}

export default function KanbanCard({
    task,
    onDelete,
    onEdit,
    onMoveLeft,
    onMoveRight,
}: KanbanCardProps) {
    const isEditing = Variable(false);
    const editContent = Variable(task.content);

    return (
        <box
            cssClasses={["kanban-card"]}
            vertical
            spacing={6}
        >
            {/* Contenido de la tarjeta */}
            <box hexpand>
                {isEditing.get() ? (
                    <entry
                        text={editContent.get()}
                        hexpand
                        onChanged={(self) => editContent.set(self.text)}
                        onActivate={() => {
                            onEdit(editContent.get());
                            isEditing.set(false);
                        }}
                        setup={(self) => {
                            self.grab_focus();
                        }}
                    />
                ) : (
                    <label
                        label={task.content}
                        xalign={0}
                        hexpand
                        wrap
                        cssClasses={["task-content"]}
                    />
                )}
            </box>

            {/* Botones de acción */}
            <box spacing={4} halign={Gtk.Align.END}>
                {/* Botón mover izquierda */}
                {onMoveLeft && (
                    <button
                        cssClasses={["icon-button"]}
                        iconName={"go-previous-symbolic"}
                        tooltipText="Move to previous column"
                        onClicked={onMoveLeft}
                    />
                )}

                {/* Botón mover derecha */}
                {onMoveRight && (
                    <button
                        cssClasses={["icon-button"]}
                        iconName={"go-next-symbolic"}
                        tooltipText="Move to next column"
                        onClicked={onMoveRight}
                    />
                )}

                {/* Botón editar */}
                <button
                    cssClasses={["icon-button"]}
                    iconName={"document-edit-symbolic"}
                    tooltipText="Edit task"
                    onClicked={() => {
                        if (isEditing.get()) {
                            onEdit(editContent.get());
                        }
                        isEditing.set(!isEditing.get());
                    }}
                />

                {/* Botón eliminar */}
                <button
                    cssClasses={["icon-button", "delete-button"]}
                    iconName={"edit-delete-symbolic"}
                    tooltipText="Delete task"
                    onClicked={onDelete}
                />
            </box>
        </box>
    );
}
