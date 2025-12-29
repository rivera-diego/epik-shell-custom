# Sistema de Configuración por Monitor - Guía de Uso

## 📖 Resumen

Epik Shell ahora usa un sistema centralizado para controlar qué widgets aparecen en qué monitores.

**Ubicación:** `options.ts` - Sección `widgets`

---

## 🎯 Configuración Actual

```typescript
export const widgets = {
  allMonitors: [
      // Barra aparece en TODOS los monitores
    
  ],
  
  primaryOnly: [
    "Bar",
    "Dock",              // Solo en monitor principal único (DP-1)
    "DateMenu",
    "Applauncher",
    "NotificationPopup",
    "NotificationWindow",
    "QSWindow",
    "KanbanWindow",
    "PowerMenu",
    "VerificationWindow",
    "DesktopClock",
  ],
  
  secondaryOnly: [

    "Bar",
    "Dock",
    // Vacío - Agregar widgets que SOLO quieras en monitor secundario
  ],
};
```

---

## 🚀 Cómo Funciona

### Monitor Primario (DP-1)
- ✅ **Bar** (porque está en `allMonitors`)
- ✅ **Dock** (porque está en `primaryOnly`)
- ✅ **Todos los popups** (QSWindow, Notifications, etc.)

### Monitor Secundario (HDMI-A-1, cuando está prendido)
- ✅ **Bar** (porque está en `allMonitors`)
- ❌ **NO Dock** (está en `primaryOnly`)
- ❌ **NO Popups** (están en `primaryOnly`)

---

## ➕ Agregar un Nuevo Widget

### Paso 1: Crear tu widget
```tsx
// widgets/weather/Weather.tsx
export default function Weather(monitor: Gdk.Monitor) {
  return <window>...</window>;
}
```

### Paso 2: Agregarlo a windows.ts
```typescript
import Weather from "./widgets/weather/Weather.jsx";

export default [
  Dock,
  Bar,
  Weather,  // ← Agregar aquí
  // ...
];
```

### Paso 3: Configurar en qué monitores aparece (options.ts)

**Opción A: En todos los monitores**
```typescript
allMonitors: [
  "Bar",
  "Weather",  // ← Agregar aquí
],
```

**Opción B: Solo en primario**
```typescript
primaryOnly: [
  "Dock",
  "Weather",  // ← Agregar aquí
  // ...
],
```

**Opción C: Solo en secundario**
```typescript
secondaryOnly: [
  "Weather",  // ← Agregar aquí
],
```

---

## 🔧 Casos de Uso Comunes

### Quiero un reloj en el monitor secundario
```typescript
secondaryOnly: [
  "DesktopClock",  // Mover de primaryOnly a secondaryOnly
],
```

### Quiero notificaciones en ambos monitores
```typescript
allMonitors: [
  "Bar",
  "NotificationPopup",     // Mover aquí
  "NotificationWindow",    // Mover aquí
],
```

### Quiero dock en ambos monitores
```typescript
allMonitors: [
  "Bar",
  "Dock",  // Mover aquí
],
```

---

## 📊 Logs

Al iniciar AGS, verás logs detallados:

```
Creating windows for 2 valid monitors
Monitor 1: DP-1 (Primary)
  ✓ Created Bar (all monitors)
  ✓ Created Dock (primary only)
  ✓ Created QSWindow (primary only)
  ...
Monitor 2: HDMI-A-1 (Secondary)
  ✓ Created Bar (all monitors)
```

---

## ⚠️ Importante

**Los nombres en `options.ts` deben coincidir EXACTAMENTE con los nombres de las funciones en `windows.ts`**

✅ **Correcto:**
- `windows.ts`: `export default function Bar() { ... }`
- `options.ts`: `allMonitors: ["Bar"]`

❌ **Incorrecto:**
- `windows.ts`: `export default function Bar() { ... }`
- `options.ts`: `allMonitors: ["bar"]` ← minúscula, no funcionará

---

## 🐛 Solución de Problemas

**Widget no aparece:**
1. Verifica que el nombre en `options.ts` coincida exactamente
2. Verifica que esté en la lista correcta (allMonitors/primaryOnly/secondaryOnly)
3. Revisa los logs de consola para ver si se creó

**"Skipping invalid monitor":**
- Normal durante transiciones de monitores
- El sistema automáticamente salta monitores en estado inválido

**Widget duplicado:**
- Asegúrate de que NO esté en múltiples listas (allMonitors Y primaryOnly)
- Solo debe estar en UNA lista

---

## ✨ Ventajas del Sistema

1. ✅ **Un solo lugar** - Toda la configuración en `options.ts`
2. ✅ **Fácil de modificar** - Solo editar arrays
3. ✅ **Documentado** - Comentarios claros
4. ✅ **Extensible** - Agregar widgets es trivial
5. ✅ **Logs claros** - Sabes exactamente qué se creó y dónde
