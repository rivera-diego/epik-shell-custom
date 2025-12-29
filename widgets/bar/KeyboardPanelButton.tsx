import { Gtk } from "astal/gtk4";
import { Variable, GLib, execAsync, interval } from "astal";

const currentLayout = Variable("--");
let mainKeyboardName = "";

// Obtener el teclado principal y layout actual
async function updateLayout() {
    try {
        const devices = JSON.parse(await execAsync("hyprctl devices -j"));
        const keyboard = devices.keyboards.find((k: any) => k.main) || devices.keyboards[0];

        if (keyboard) {
            mainKeyboardName = keyboard.name;
            const layout = keyboard.active_keymap || keyboard.layout || "??";
            // Convertir a código corto (ej: "Spanish" -> "ES", "English (US)" -> "EN")
            const shortCode = layout.substring(0, 2).toUpperCase();
            currentLayout.set(shortCode);
        }
    } catch (error) {
        console.error("Failed to get keyboard layout:", error);
    }
}

// Actualizar cada 2 segundos
updateLayout();
interval(2000, updateLayout);

async function switchLayout() {
    if (!mainKeyboardName) {
        console.warn("No keyboard found");
        return;
    }

    try {
        await execAsync(`hyprctl switchxkblayout ${mainKeyboardName} next`);
        // Actualizar inmediatamente después del cambio
        setTimeout(updateLayout, 100);
    } catch (error) {
        console.error("Failed to switch layout:", error);
    }
}

export default function KeyboardPanelButton() {
    return (
        <button
            cssClasses={["panel-button", "keyboard"]}
            onClicked={switchLayout}
            tooltipText={currentLayout((l) => `Keyboard Layout: ${l}`)}
        >
            <box spacing={6}>
                <image iconName="input-keyboard-symbolic" />
                <label label={currentLayout()} />
            </box>
        </button>
    );
}
