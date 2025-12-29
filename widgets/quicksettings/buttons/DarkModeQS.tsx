import { bind } from "astal";
import options from "../../../options";
import QSButton from "../QSButton";

const THEMES = ["light", "dark", "cyberpunk", "nord", "catppuccin", "gruvbox"];

export default function ThemeToggleQS() {
  const { mode } = options.theme;
  return (
    <QSButton
      // Activo si NO es light (o resaltar siempre que sea custom)
      connection={[mode, null, (v) => v !== "light"]}
      iconName={"color-management-symbolic"}
      label={bind(mode).as(v => v.charAt(0).toUpperCase() + v.slice(1))}
      onClicked={() => {
        const current = mode.get();
        // Fallback si el modo actual no está en la lista (ej. se borró o editó a mano)
        const idx = THEMES.indexOf(current);
        const nextIndex = (idx + 1) % THEMES.length;
        mode.set(THEMES[idx === -1 ? 0 : nextIndex]);
      }}
    />
  );
}
