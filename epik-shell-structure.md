# Estructura del Proyecto Epik-Shell

## 📁 Estructura de Carpetas

```
epik-shell/
├── app.ts                 # Punto de entrada de la aplicación
├── options.ts             # Configuración global (colores, posiciones, etc.)
├── build.js              # Script de compilación
├── tsconfig.json         # Configuración de TypeScript
├── astal.d.ts            # Definiciones de tipos personalizadas
│
├── widgets/              # Componentes de la interfaz
│   ├── bar/             # Componentes de la barra
│   ├── quicksettings/   # Panel de configuración rápida
│   ├── notification/    # Sistema de notificaciones
│   ├── powermenu/       # Menú de apagado
│   ├── applauncher/     # Lanzador de aplicaciones
│   ├── dock/            # Dock de aplicaciones
│   └── ...
│
├── styles/              # Estilos SCSS
│   ├── styles.scss      # Archivo principal que importa todos
│   ├── variables.scss   # Variables de colores y configuración
│   ├── common.scss      # Estilos comunes
│   └── widgets/         # Estilos específicos por widget
│
└── utils/               # Funciones auxiliares
    ├── brightness.ts
    ├── hyprland.ts
    └── ...
```

---

## 🎨 Sistema de Estilos

### **Archivo Principal: [styles/styles.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/styles.scss)**
Este archivo importa todos los estilos del proyecto:

```scss
@use "./common.scss";           // Estilos globales
@use "./widgets/bar.scss";      // Estilos de la barra
@use "./widgets/quicksettings.scss";
@use "./widgets/notification.scss";
// ... más widgets
```

### **Variables de Colores: [styles/variables.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/variables.scss)**
Aquí se definen **todos los colores y configuraciones** del tema:

```scss
// Colores principales
$bg: #282828;           // Color de fondo
$fg: #ebdbb2;           // Color de texto
$accent: #ebdbb2;       // Color de acento
$red: #cc241d;          // Color rojo

// Configuración de la barra
$bar-bg-color: $bg;
$bar-opacity: 1;
$bar-margin: 12px 18px 8px 12px;
$bar-padding: 3px;
$bar-border-radius: 6px;
$bar-border-width: 2px;
$bar-border-color: $fg;

// Configuración de botones
$bar-button-bg-color: $bg;
$bar-button-fg-color: $fg;
$bar-button-padding: 0px 4px;
$bar-button-border-radius: 8px;
```

**Para cambiar colores:** Edita [styles/variables.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/variables.scss) y todos los widgets se actualizarán automáticamente.

### **Estilos Comunes: [styles/common.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/common.scss)**
Define estilos globales como:
- Fuentes (actualmente "Google Sans")
- Clase `.nerd-icon` para iconos de Nerd Font
- Estilos de botones, sliders, separadores
- Clase `.panel-button` para botones de la barra

---

## 🏗️ Cómo Funciona la Barra

### **1. Configuración ([options.ts](file:///home/diego/Enlace%20hacia%20epik-shell/options.ts))**
Define qué widgets aparecen y dónde:

```typescript
bar: {
  position: opt("top"),              // Posición: top/bottom
  separator: opt(true),              // Separadores entre widgets
  start: opt(["launcher", "workspace"]),        // Izquierda
  center: opt(["time", "notification"]),        // Centro
  end: opt([ "tray", "quicksetting"]), // Derecha
}
```

### **2. Registro de Widgets ([widgets/bar/Bar.tsx](file:///home/diego/Enlace%20hacia%20epik-shell/widgets/bar/Bar.tsx))**
Mapea nombres a componentes:

```tsx
const panelButton = {
  launcher: () => <LauncherPanelButton />,
  workspace: () => <WorkspacesPanelButton />,
  time: () => <TimePanelButton />,
  notification: () => <NotifPanelButton />,
  quicksetting: () => <QSPanelButton />,
  tray: () => <TrayPanelButton />,
};
```

### **3. Renderizado de Secciones**
La barra se divide en 3 secciones:

```tsx
function Start() {
  return (
    <box halign={Gtk.Align.START}>
      {start((s) => [
        ...separatorBetween(
          s.map((s) => panelButton[s]()),
          Gtk.Orientation.VERTICAL,
        ),
      ])}
    </box>
  );
}

// Similar para Center() y End()
```

---

## 📦 Tipos de Archivos

### **Widgets ([.tsx](file:///home/diego/Enlace%20hacia%20epik-shell/widgets/bar/Bar.tsx))**
Componentes React/JSX usando Astal GTK4:

```tsx
export default function LauncherPanelButton() {
  return (
    <PanelButton
      window={WINDOW_NAME}
      onClicked={() => App.toggle_window(WINDOW_NAME)}
    >
      <label label="" cssClasses={["nerd-icon"]} />
    </PanelButton>
  );
}
```

### **Estilos ([.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/styles.scss))**
Archivos SCSS que se compilan a CSS:

```scss
.nerd-icon {
  font-family: "FiraCode Nerd Font";
  font-size: 1.3rem;
  color: inherit;
}
```

### **Utilidades ([.ts](file:///home/diego/Enlace%20hacia%20epik-shell/app.ts))**
Funciones auxiliares reutilizables:

```typescript
export function separatorBetween(widgets, orientation) {
  // Lógica para agregar separadores entre widgets
}
```

---

## 🎯 Flujo de Trabajo

### **Para Agregar un Nuevo Widget:**

1. **Crear componente** en `widgets/bar/MiWidget.tsx`
2. **Registrar** en [Bar.tsx](file:///home/diego/Enlace%20hacia%20epik-shell/widgets/bar/Bar.tsx):
   ```tsx
   const panelButton = {
     // ...
     miwidget: () => <MiWidget />,
   };
   ```
3. **Agregar a configuración** en [options.ts](file:///home/diego/Enlace%20hacia%20epik-shell/options.ts):
   ```typescript
   end: opt(["miwidget", "quicksetting"]),
   ```
4. **Crear estilos** (opcional) en `styles/widgets/miwidget.scss`
5. **Importar estilos** en [styles/styles.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/styles.scss):
   ```scss
   @use "./widgets/miwidget.scss";
   ```

### **Para Cambiar Colores del Tema:**

1. Edita [styles/variables.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/variables.scss)
2. Cambia las variables `$bg`, `$fg`, `$accent`
3. Los cambios se aplican automáticamente a todos los widgets

### **Para Cambiar Iconos:**

- **Iconos del sistema:** Usa nombres como `"bluetooth-symbolic"`
- **Nerd Font:** Usa caracteres Unicode directos como `"󰂚"`
- **Clase CSS:** Agrega `cssClasses={["nerd-icon"]}` para Nerd Font

---

## 🔧 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| [app.ts](file:///home/diego/Enlace%20hacia%20epik-shell/app.ts) | Inicializa la aplicación Astal |
| [options.ts](file:///home/diego/Enlace%20hacia%20epik-shell/options.ts) | **Configuración global** (posiciones, widgets activos) |
| [styles/variables.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/variables.scss) | **Colores y tema** |
| [styles/common.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/common.scss) | Estilos globales y clases comunes |
| [widgets/bar/Bar.tsx](file:///home/diego/Enlace%20hacia%20epik-shell/widgets/bar/Bar.tsx) | **Estructura de la barra** |
| [astal.d.ts](file:///home/diego/Enlace%20hacia%20epik-shell/astal.d.ts) | Definiciones de tipos para TypeScript |

---

## 💡 Tips

- **Colores centralizados:** Todo se maneja desde [variables.scss](file:///home/diego/Enlace%20hacia%20epik-shell/styles/variables.scss)
- **Widgets modulares:** Cada widget es independiente
- **Configuración flexible:** Cambia el orden en [options.ts](file:///home/diego/Enlace%20hacia%20epik-shell/options.ts)
- **Nerd Font:** Usa caracteres Unicode directos, no códigos `\uf0f3`
- **Hot reload:** Los cambios en SCSS se aplican automáticamente
