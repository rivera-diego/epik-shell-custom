import { App } from "astal/gtk4";
import windows from "./windows";
import request from "./request";
import initStyles from "./utils/styles";
import initHyprland from "./utils/hyprland";

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

    const createAllWindows = () => {
      const monitors = App.get_monitors();
      console.log(`Creating windows for ${monitors.length} monitors`);

      monitors.forEach(monitor => {
        console.log(`Creating windows for monitor: ${monitor.display_name}`);
        windows.forEach(win => win(monitor));
      });
    };

    resetMonitorInterface = () => {
      console.log("Resetting monitor interface...");
      cleanupAllWindows();

      // Esperar a que el sistema detecte el monitor
      setTimeout(() => {
        createAllWindows();
      }, 600);
    };

    // Inicializar
    createAllWindows();
    console.log("AGS ready. Use 'astal -i epik-shell reset-monitors' to reset interface");
  },
});
