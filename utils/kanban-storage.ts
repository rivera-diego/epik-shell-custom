import { GLib } from "astal";
import Gio from "gi://Gio";

const HOME = GLib.get_home_dir();
const CONFIG_DIR = `${HOME}/.config/epik-shell`;
const KANBAN_FILE = `${CONFIG_DIR}/kanban-data.json`;

export interface KanbanTask {
    id: string;
    content: string;
    createdAt: string;
}

export interface KanbanColumn {
    id: string;
    title: string;
    tasks: KanbanTask[];
}

export interface KanbanData {
    columns: {
        todo: KanbanColumn;
        "in-progress": KanbanColumn;
        done: KanbanColumn;
    };
}

// Datos por defecto
function createDefaultData(): KanbanData {
    return {
        columns: {
            todo: {
                id: "todo",
                title: "To Do",
                tasks: [],
            },
            "in-progress": {
                id: "in-progress",
                title: "In Progress",
                tasks: [],
            },
            done: {
                id: "done",
                title: "Done",
                tasks: [],
            },
        },
    };
}

// Cargar datos desde JSON
export function loadKanbanData(): KanbanData {
    try {
        const file = Gio.File.new_for_path(KANBAN_FILE);

        if (!file.query_exists(null)) {
            // Si no existe, crear con datos por defecto
            const defaultData = createDefaultData();
            saveKanbanData(defaultData);
            return defaultData;
        }

        const [success, contents] = file.load_contents(null);
        if (!success) {
            console.error("Failed to load kanban data");
            return createDefaultData();
        }

        const decoder = new TextDecoder("utf-8");
        const jsonString = decoder.decode(contents);
        return JSON.parse(jsonString) as KanbanData;
    } catch (error) {
        console.error("Error loading kanban data:", error);
        return createDefaultData();
    }
}

// Guardar datos a JSON
export function saveKanbanData(data: KanbanData): void {
    try {
        // Asegurar que el directorio existe
        const configDir = Gio.File.new_for_path(CONFIG_DIR);
        if (!configDir.query_exists(null)) {
            configDir.make_directory_with_parents(null);
        }

        const jsonString = JSON.stringify(data, null, 2);
        const file = Gio.File.new_for_path(KANBAN_FILE);

        file.replace_contents(
            jsonString,
            null,
            false,
            Gio.FileCreateFlags.REPLACE_DESTINATION,
            null
        );
    } catch (error) {
        console.error("Error saving kanban data:", error);
    }
}

// Generar ID único para tareas
export function generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
