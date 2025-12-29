import { App } from "astal/gtk4";
import windows from "./windows";
import request from "./request";
import initStyles from "./utils/styles";
import initHyprland from "./utils/hyprland";
import { widgets as widgetConfig } from "./options";

initStyles();

// Variable global para acceder a funciones desde request handler
let resetMonitorInterface: () => void;

App.start({
  requestHandler(req, res) {
    // Manejar comandos personalizados
    if (req === "reset-monitors") {
      console.log("Received reset-monitors request from script");
      resetMonitorInterface();
      res("OK");
    } else {
      request(req, res);
    }
  },
  main() {
    initHyprland();

    const cleanupAllWindows = () => {
      const allWindows = App.get_windows();
      console.log(`Destroying ${allWindows.length} windows...`);

      allWindows.forEach(win => {
        try {
          console.log(`Destroying: ${win.name}`);
          win.destroy();
        } catch (e) {
          console.error(`Error destroying ${win.name}:`, e);
        }
      });
    };

    const createAllWindows = (skipInvalid = false) => {
      let monitors = App.get_monitors();

      // Solo filtrar monitores inválidos si se solicita explícitamente (durante reset)
      if (skipInvalid) {
        const validMonitors = monitors.filter(m => m && m.display_name);
        console.log(`Filtering monitors: ${validMonitors.length} valid of ${monitors.length} total`);

        // Si no hay monitores válidos pero hay monitores detectados, usar todos
        // (están en transición, pero existen)
        if (validMonitors.length === 0 && monitors.length > 0) {
          console.warn(`No valid monitors found, using all ${monitors.length} detected monitors as fallback`);
          // No filtrar, usar todos los monitores
        } else {
          monitors = validMonitors;
        }
      }

      if (monitors.length === 0) {
        console.error("No monitors found!");
        return;
      }

      console.log(`Creating windows for ${monitors.length} monitors`);

      monitors.forEach((monitor, index) => {
        const isPrimary = index === 0;
        const monitorType = isPrimary ? "Primary" : "Secondary";
        const displayName = monitor.display_name || `Monitor-${index}`;

        console.log(`Monitor ${index + 1}: ${displayName} (${monitorType})`);

        // Debug: Mostrar todos los widgets disponibles
        const widgetNames = windows.map(w => w.name);
        console.log(`Available widgets: ${widgetNames.join(', ')}`);

        // Crear ventanas según configuración
        windows.forEach(windowFn => {
          const windowName = windowFn.name;

          try {
            // ¿Va en todos los monitores?
            if (widgetConfig.allMonitors.includes(windowName)) {
              windowFn(monitor);
              console.log(`  ✓ Created ${windowName} (all monitors)`);
            }
            // ¿Solo en primario y este ES el primario?
            else if (isPrimary && widgetConfig.primaryOnly.includes(windowName)) {
              windowFn(monitor);
              console.log(`  ✓ Created ${windowName} (primary only)`);
            }
            // ¿Solo en secundario y este NO ES el primario?
            else if (!isPrimary && widgetConfig.secondaryOnly.includes(windowName)) {
              windowFn(monitor);
              console.log(`  ✓ Created ${windowName} (secondary only)`);
            }
            // Debug: Log why it was skipped
            else {
              if (widgetConfig.primaryOnly.includes(windowName)) {
                console.log(`  - Skipped ${windowName} (primary only, but this is secondary)`);
              } else if (widgetConfig.secondaryOnly.includes(windowName)) {
                console.log(`  - Skipped ${windowName} (secondary only, but this is primary)`);
              } else {
                console.log(`  - Skipped ${windowName} (not in any config list)`);
              }
            }
          } catch (e) {
            console.error(`  ✗ Failed to create ${windowName}:`, e);
          }
        });
      });
    };

    resetMonitorInterface = () => {
      console.log("Resetting monitor interface...");
      cleanupAllWindows();

      // Esperar más tiempo para que el sistema detecte el monitor (1.2 segundos)
      setTimeout(() => {
        createAllWindows(true); // true = skip invalid monitors during reset
      }, 1200);
    };

    // Inicializar
    createAllWindows();
    console.log("AGS ready. Use 'astal reset-monitors' to reset interface");
  },
});
