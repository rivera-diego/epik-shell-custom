# Análisis y Rediseño del Dock - Epik Shell

## 🔍 Análisis del Dock Actual

### Arquitectura

El Dock consiste en **2 ventanas** que trabajan juntas:

#### 1. **DockHover** (Ventana invisible de detección)
- **Ubicación:** `Dock.tsx` línea 26
- **Propósito:** Detectar cuando el ratón pasa por el borde
- **Tamaño:** Pequeño (altura = `gaps_out` de Hyprland)
- **Visibilidad:** `visible={dockVisible((v) => !v)}` → Visible cuando Dock NO visible
- **Funcionalidad:**
  - Detecta `onHoverEnter` → Muestra el Dock real
  - Se oculta cuando Dock se hace visible

#### 2. **Dock** (Ventana real con apps)
- **Ubicación:** `Dock.tsx` línea 67
- **Propósito:** Mostrar aplicaciones, media player, etc.
- **Visibilidad:** `visible={dockVisible()}` → Visible cuando workspace vacío O después de hover
- **Funcionalidad:**
  - Detecta `onHoverLeave` → Muestra DockHover si hay apps abiertas
  - Contiene `<DockApps />` con todas las aplicaciones

---

### Variable Global Compartida (⚠️ PROBLEMA RAÍZ)

```typescript
// Línea 23 - EXPORTED (compartida globalmente)
export const dockVisible = Variable(updateVisibility());
```

**Características:**
- **Global:** Se exporta y es compartida entre TODAS las instancias del Dock
- **Estado inicial:** Calculado por `updateVisibility()`
- **Observers:** Suscrita a eventos de Hyprland (líneas 137-143)
```typescript
dockVisible
  .observe(hyprland, "notify::clients", () => updateVisibility())
  .observe(hyprland, "notify::focused-workspace", () => updateVisibility());
```

---

### Flujo de Visibilidad

```
┌─────────────────────────────────────────┐
│ updateVisibility()                       │
│ ↓                                        │
│ workspace.clients.length <= 0?           │
│   ├─ SÍ  → return true  (Dock visible)  │
│   └─ NO  → return false (Hover visible) │
└─────────────────────────────────────────┘
         │
         ↓
  ┌─────────────────┐
  │ dockVisible.set()│
  └─────────────────┘
         │
         ├──→ Dock.visible = dockVisible()
         └──→ DockHover.visible = !dockVisible()
```

---

## 🐛 Problema Actual

### ¿Por qué se queda "pegado"?

**Escenario:**
1. Monitor 1 activo, Monitor 2 activo
2. `dockVisible` = `false` (hay ventanas abiertas)
3. **Script ejecuta:** `App.get_windows().forEach(win => win.destroy())`
4. **Ventanas se destruyen** pero...
   - `dockVisible` sigue siendo `false` (estado viejo)
   - Las subscripciones `.observe()` se ejecutan en `onDestroy` con `.drop()`
5. **Nuevas ventanas se crean:**
   - Nuevos Dock/DockHover se crean
   - Nuevos `.observe()` se registran
   - **PERO** `dockVisible` no se recalcula, mantiene valor viejo
6. **Resultado:**
   - Si estaba `false` → Dock queda visible (debería estar oculto si hay apps)
   - Si estaba `

true` → DockHover queda visible (debería estar hidden si workspace vacío)

**Diagrama del problema:**

```
ANTES del reset:
  dockVisible = false (hay apps)
  Dock.visible = false
  DockHover.visible = true ✅

DURANTE el reset:
  destroy() → dockVisible.drop() → Pero valor NO se resetea
  dockVisible = false (STALE)

DESPUÉS del reset:
  Nuevas ventanas creadas
  dockVisible = false (sin recalcular)
  Dock.visible = false
  DockHover.visible = true
  
  PROBLEMA: Si ahora NO hay apps, debería ser al revés
```

---

## 🎯 Workspaces Bugeados

Similar al Dock, `WorkspacesPanelButton.tsx` usa:

```typescript
const classNames = Variable.derive(
  [bind(hyprland, "focusedWorkspace"), bind(hyprland, "clients")],
  (fws, _) => { ... }
);
```

Cuando las ventanas se destruyen/recrean, las variables derivadas no se actualizan porque:
1. `Variable.derive` crea subscripciones
2. Al destruir, se cancelan
3. Al recrear, se crean nuevas
4. **PERO** el valor derivado anterior persiste en memoria

---

## 📋 Plan de Rediseño

### Opción 1: Variable Local (⭐ Recomendada)

**Concepto:** Cada instancia del Dock tiene su propia variable de visibilidad.

**Cambios:**
1. Eliminar `export const dockVisible` global
2. Crear variable local dentro de la función `export default`
3. Pasar la variable como prop a `Dock` y `DockHover`

**Ventajas:**
- ✅ Cada monitor tiene estado independiente
- ✅ Al destruir ventana, variable muere con ella
- ✅ Al crear nueva ventana, variable se recalcula desde cero
- ✅ Sin estado compartido = sin bugs de sincronización

**Desventajas:**
- Requiere refactor moderado del código

---

### Opción 2: Reset Explícito al Crear

**Concepto:** Mantener variable global pero forzar recálculo en `setup()`.

**Cambios:**
1. Mantener `dockVisible` global
2. Agregar `setup` hook en ventanas:
```typescript
setup={(self) => {
  // Forzar recálculo al crear
  dockVisible.set(updateVisibility());
}}
```

**Ventajas:**
- ✅ Cambio mínimo
- ✅ Mantiene estructura actual

**Desventajas:**
- ❌ Sigue siendo global (potenciales race conditions)
- ❌ Puede causar parpadeos si múltiples monitores actualizan simultáneamente

---

### Opción 3: Singleton con Reset Method

**Concepto:** Crear un manager del Dock con método `reset()`.

**Cambios:**
1. Crear `DockManager` class
2. Método `reset()` que:
   - Re-calcula `updateVisibility()`
   - Re-registra observers
   - Actualiza todas las instancias

**Ventajas:**
- ✅ Control centralizado
- ✅ Fácil agregar debugging

**Desventajas:**
- ❌ Más complejo
- ❌ Overkill para el problema

---

## 🚀 Implementación Recomendada: Opción 1

### Paso 1: Modificar `Dock.tsx`

**Cambio principal:** Variable local en lugar de global.

```typescript
// ANTES (global):
export const dockVisible = Variable(updateVisibility());

export default function (gdkmonitor: Gdk.Monitor) {
  <Dock gdkmonitor={gdkmonitor} />
  dockVisible.observe(...)
  DockHover(gdkmonitor);
}

// DESPUÉS (local):
export default function (gdkmonitor: Gdk.Monitor) {
  // Variable LOCAL - muere cuando se destruye la ventana
  const dockVisible = Variable(updateVisibility());
  
  <Dock gdkmonitor={gdkmonitor} dockVisible={dockVisible} />
  dockVisible.observe(...)
  DockHover(gdkmonitor, dockVisible);
  
  // Cleanup automático al destruir
  return () => {
    dockVisible.drop();
  };
}
```

### Paso 2: Pasar `dockVisible` como prop

**Modificar signatures:**
```typescript
type DockProps = WindowProps & {
  gdkmonitor: Gdk.Monitor;
  dockVisible: Variable<boolean>;  // NEW
  animation?: string;
};

function DockHover(
  gdkmonitor: Gdk.Monitor,
  dockVisible: Variable<boolean>  // NEW
) { ... }
```

### Paso 3: Workspaces Fix

Similar approach en `WorkspacesPanelButton.tsx`:
- Mover `Variable.derive` dentro del componente
- Agregar cleanup en `onDestroy`

---

## 📊 Comparación de Opciones

| Criterio | Opción 1 (Local) | Opción 2 (Reset) | Opción 3 (Manager) |
|----------|------------------|------------------|---------------------|
| **Complejidad** | Media | Baja | Alta |
| **Confiabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Mantenibilidad** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Cambios req.** | ~50 líneas | ~10 líneas | ~100 líneas |
| **Race conditions** | No | Posible | No |

---

## ⏱️ Estimación de Tiempo

- **Opción 1:** ~30 minutos
- **Opción 2:** ~5 minutos
- **Opción 3:** ~60 minutos

---

## ✅ Recomendación Final

**Implementar Opción 1: Variable Local**

**Razones:**
1. Elimina el problema de raíz (estado compartido)
2. Cada monitor es independiente
3. Cleanup automático con lifecycle
4. Más robusto para futuras features (3+ monitores)
5. Mejor práctica de React/Reactive programming

**¿Proceder con la implementación?**
