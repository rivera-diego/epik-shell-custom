# Análisis de Limpieza de Widgets - Epik Shell

## 📊 Resumen Ejecutivo

**Total de widgets:** 34 archivos .tsx  
**Widgets con timers/subscriptions:** 12 archivos  
**Widgets que usan PopupWindow:** 8 archivos  
**Estimación de trabajo:** 1-2 horas

---

## 🎯 Problema Raíz

Cuando ejecutas `astal reset-monitors`, AGS destruye ventanas con `win.destroy()`, pero:

❌ Los componentes **NO cancelan** sus timers/subscriptions  
❌ Los callbacks siguen ejecutándose después de destruir  
❌ Intentan llamar `.show()` en ventanas destruidas  
❌ GTK emite warning: "A window is shown after it has been destroyed"

---

## 📋 Lista Completa de Widgets

### ✅ Widgets Simples (No requieren cleanup)

Estos **NO tienen** timers ni subscriptions complejas:

1. `bar/LauncherPanelButton.tsx` - Solo icono estático
2. `bar/TrayPanelButton.tsx` - Solo muestra tray
3. `bar/TimePanelButton.tsx` - Solo muestra reloj
4. `bar/KanbanPanelButton.tsx` - Solo botón toggle
5. `bar/QSPanelButton.tsx` - Solo iconos de volumen/mic
6. `common/PanelButton.tsx` - Componente base
7. `dock/DockApps.tsx` - Lista de apps
8. `kanban/KanbanCard.tsx` - Tarjeta individual
9. `kanban/KanbanColumn.tsx` - Columna individual
10. `quicksettings/VolumeBox.tsx` - Slider de volumen
11. `quicksettings/QSButton.tsx` - Botón genérico
12. `quicksettings/buttons/*` - Todos los botones QS
13. `quicksettings/pages/SpeakerPage.tsx` - Lista de speakers
14. `notification/Notification.tsx` - Card de notificación
15. `notification/NotificationPopup.tsx` - Popup individual
16. `powermenu/PowerMenu.tsx` - Menú estático
17. `powermenu/VerificationWindow.tsx` - Diálogo confirmación
18. `clock/DesktopClock.tsx` - Reloj de escritorio
19. `wallpaperpicker/WallpaperPicker.tsx` - Selector de wallpaper

**Total simples: 19 widgets** ✅

---

### ⚠️ Widgets con Subscriptions (Requieren Cleanup)

Estos tienen `.subscribe()` o `.observe()` que **necesitan** `.drop()`:

#### 1. **Dock.tsx** (✅ YA ARREGLADO)
- **Subscriptions:**
  - `dockVisible.observe(hyprland, "notify::clients")`
  - `dockVisible.observe(hyprland, "notify::focused-workspace")`
  - `dock.position.subscribe()`
- **Estado:** ✅ Refactorizado con variable local
- **Cleanup:** Automático al destruir ventana

#### 2. **Bar.tsx**
- **Subscription:** `bar.position.subscribe()` (línea 104)
- **Problema:** NO tiene cleanup en `onDestroy`
- **Solución:**
```tsx
export default function(gdkmonitor: Gdk.Monitor) {
  const positionSub = bar.position.subscribe(() => {
    // ... código actual ...
  });
  
  // Agregar cleanup
  return () => {
    positionSub(); // Cancelar subscription
  };
}
```

#### 3. **NotifPanelButton.tsx**
- **Subscriptions:**
  - `Variable.observe(notifd, "notify::dont-disturb")` (línea 26)
  - `Variable.observe(notifd, "notify::notifications")` (línea 29)
- **Problema:** NO tiene cleanup
- **Solución:** La variable debe tener `.drop()` en `onDestroy` del botón

#### 4. **WorkspacesPanelButton.tsx**
- **No tiene subscriptions globales**, usa `Variable.derive`
- **Estado:** ✅ Probablemente OK (deriva se limpia automáticamente)

---

### 🪟 Widgets con PopupWindow (Principal Culpable)

PopupWindow NO tiene timers propios, pero los widgets que lo usan pueden tener timers **internos** que no se cancelan:

#### 5. **DateMenu.tsx**
- **Usa:** PopupWindow
- **Subscription:** `layout.subscribe()` (línea 38)
- **Problema:** NO tiene cleanup
- **Solución:**
```tsx
export default function(gdkmonitor: Gdk.Monitor) {
  const layoutSub = layout.subscribe(() => {
    // ... código actual ...
  });
  
  return () => {
    layoutSub();
  };
}
```

#### 6. **QSWindow.tsx**
- **Usa:** PopupWindow
- **Subscription:** `layout.subscribe()` (línea 160)
- **Problema:** NO tiene cleanup
- **Solución:** Igual que DateMenu

#### 7. **NotificationWindow.tsx**
- **Usa:** PopupWindow
- **Subscription:** `layout.subscribe()` (línea 158)
- **Problema:** NO tiene cleanup
- **Solución:** Igual que DateMenu

#### 8. **KanbanWindow.tsx**
- **Usa:** PopupWindow
- **Subscription:** `layout.subscribe()` (línea 171)
- **Problema:** NO tiene cleanup
- **Solución:** Igual que DateMenu

#### 9-11. **Applauncher, WallpaperPicker, PowerMenu, VerificationWindow**
- **Usan:** PopupWindow
- **Sin subscriptions visibles**
- **Estado:** Probablemente OK

---

## 🔧 Patrón Correcto de Cleanup

### ❌ INCORRECTO (Estado actual):

```tsx
export default function(gdkmonitor: Gdk.Monitor) {
  layout.subscribe(() => {
    // Hacer algo
  });
  
  <PopupWindow>...</PopupWindow>
  
  // NO HAY CLEANUP ❌
}
```

### ✅ CORRECTO (Con cleanup):

```tsx
export default function(gdkmonitor: Gdk.Monitor) {
  // Guardar referencia a la subscription
  const layoutSub = layout.subscribe(() => {
    // Hacer algo
  });
  
  <PopupWindow 
    onDestroy={() => {
      layoutSub(); // Cancelar subscription
    }}
  >
    ...
  </PopupWindow>
  
  // O retornar función de cleanup
  return () => {
    layoutSub();
  };
}
```

### ✅ EJEMPLO BIEN IMPLEMENTADO: Dock.tsx (después del refactor)

```tsx
export default function (gdkmonitor: Gdk.Monitor) {
  // Variable LOCAL (se destruye con el componente)
  const dockVisible = Variable(updateVisibility());
  
  // Subscriptions
  dockVisible
    .observe(hyprland, "notify::clients", () => updateVisibility())
    .observe(hyprland, "notify::focused-workspace", () => updateVisibility());

  // Crear ventanas
  <Dock dockVisible={dockVisible} ... />;
  DockHover(gdkmonitor, dockVisible);
  
  // Al destruir Dock, dockVisible.drop() se llama automáticamente
  // porque está en el onDestroy de la ventana
}
```

---

## 📝 Lista de Tareas Específicas

### Prioridad Alta (Causan los warnings)

- [ ] **DateMenu.tsx** - Agregar cleanup de `layout.subscribe`
- [ ] **QSWindow.tsx** - Agregar cleanup de `layout.subscribe`
- [ ] **NotificationWindow.tsx** - Agregar cleanup de `layout.subscribe`
- [ ] **KanbanWindow.tsx** - Agregar cleanup de `layout.subscribe`

**Estimación:** 15 minutos (4 archivos × 5 min cada uno)

---

### Prioridad Media (Pueden causar memory leaks)

- [ ] **Bar.tsx** - Agregar cleanup de `bar.position.subscribe`
- [ ] **NotifPanelButton.tsx** - Agregar cleanup de observables

**Estimación:** 10 minutos

---

### Prioridad Baja (Verificar)

- [ ] **WorkspacesPanelButton.tsx** - Verificar que `Variable.derive` se limpia
- [ ] **Applauncher.tsx** - Verificar si tiene timers ocultos
- [ ] **WallpaperPicker.tsx** - Verificar si tiene timers ocultos

**Estimación:** 15 minutos

---

## ⏱️ Estimación Total

| Tarea | Tiempo |
|-------|--------|
| Prioridad Alta (4 archivos) | 20 min |
| Prioridad Media (2 archivos) | 10 min |
| Prioridad Baja (3 archivos) | 15 min |
| Testing y ajustes | 15 min |
| **TOTAL** | **60 min** |

---

## 🚀 Plan de Implementación

### Fase 1: Quick Win (20 min)
Arreglar los 4 PopupWindows con `layout.subscribe`:
1. DateMenu.tsx
2. QSWindow.tsx  
3. NotificationWindow.tsx
4. KanbanWindow.tsx

**Resultado esperado:** Eliminar los 3 warnings de "window shown after destroyed"

### Fase 2: Prevención (10 min)
Arreglar subscriptions en:
1. Bar.tsx
2. NotifPanelButton.tsx

**Resultado esperado:** Prevenir memory leaks

### Fase 3: Verificación (15 min)
Revisar y testear los demás componentes

---

## ✅ Recomendación

**Empezar con Fase 1** (20 minutos):
- Son solo 4 archivos
- Patrón idéntico en todos
- Resuelvewarnings inmediatamente
- Puedes verificar el resultado al instante

**¿Procedemos con Fase 1?**

---

## 📌 Notas Adicionales

- **PopupWindow.tsx NO tiene el problema** - Es solo un wrapper
- **El problema está en los widgets que LO USAN** y tienen subscriptions
- **Dock.tsx ya está arreglado** con el refactor de variable local
- **La mayoría de widgets simples están OK** - No necesitan cambios
