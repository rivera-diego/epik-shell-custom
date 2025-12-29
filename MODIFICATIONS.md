# 🛠️ Modifications Log - Multi-Monitor System Fixes

## 🎯 Core Objectives Achieved
1. **Monitor-Aware Widget System:** Centralized configuration in `options.ts`.
2. **Robust Monitor Detection:** Improved timeout and fallback logic in `app.ts`.
3. **Determinstic Dock Placement:** Fixed critical bug where Dock lacked monitor assignment.
4. **Memory Leak Fixes:** Added comprehensive cleanup for subscriptions across all widgets.

## 📂 File Changes

### `app.ts`
- **Rewrite:** Implemented dynamic widget creation loop.
- **Logic:** Reads `options.widgets` to decide placement (All vs Primary vs Secondary).
- **Resiliency:** Added fallback to use "all detected monitors" if `display_name` is undefined during transition.
- **Debug:** Added verbose logging for widget creation/skipping.

### `options.ts`
- **New Section:** Added `export const widgets` configuration object.
- **Fix:** Updated strings to match actual function names (e.g., `Dock_default`).

### `widgets/dock/Dock.tsx`
- **CRITICAL FIX:** Passed `gdkmonitor={gdkmonitor}` to `<window>`.
- **Cleanup:** Added `dockWindow.connect("destroy", ...)` to cancel `dock.position.subscribe`.
- **State:** Moved `dockVisible` to local scope to prevent state bleeing between instances.

### `widgets/bar/*`
- **Cleanup:** Added cleanup handlers for subscriptions in `Bar.tsx`, `NotifPanelButton.tsx`, `WorkspacesPanelButton.tsx`.

### `toggle-monitor.sh` (External)
- **Integration:** Updated to call `astal reset-monitors` via IPC.
- **Power:** Added `ddcutil` support for physical monitor power control.

## 🐛 Bugs Squashed

| Bug | Cause | Fix |
| :--- | :--- | :--- |
| **"No monitors found"** | Strict filtering during transition | Relaxed filter + Fallback to all detected monitors |
| **Dock on wrong monitor** | Missing `gdkmonitor` prop | Passed prop strictly to window component |
| **Ghost/Default names** | `export default` naming convention | Updated `options.ts` with `_default` suffix |
| **"Window shown after destroyed"** | Uncanceled subscriptions | Added `onDestroy` cleanup to all widgets |
| **Dock stuck/visible** | shared global variable | Moved state to local function scope |

## 📚 Documentation
- Created `MONITOR_CONFIG_GUIDE.md` for easy user configuration.
