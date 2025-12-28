/**
 * Type definitions for Astal GJS bindings
 * Extends the official types to include missing methods
 */

declare module 'astal/gtk4' {
    export interface Astal3JS {
        /**
         * Toggle visibility of a window by name
         * @param name - Window name to toggle
         */
        toggle_window(name: string): void;

        /**
         * Connect to a signal/event
         * @param signal - Signal name (e.g., "window-toggled")
         * @param callback - Callback function to execute
         * @returns Connection ID
         */
        connect(signal: string, callback: (...args: any[]) => void): number;

        /**
         * Remove a window from the application
         * @param window - Window instance to remove
         */
        remove_window(window: any): void;

        /**
         * Get a window instance by name
         * @param name - Window name
         * @returns Window instance or null
         */
        get_window(name: string): any | null;

        /**
         * Get all application windows
         * @returns Array of windows
         */
        get_windows(): any[];
    }

    /**
     * Application instance
     */
    export const App: Astal3JS;

    /**
     * GTK namespace
     */
    export namespace Gtk {
        export enum Align {
            FILL,
            START,
            END,
            CENTER,
            BASELINE,
        }

        export enum IconSize {
            INHERIT,
            NORMAL,
            LARGE,
        }

        export enum StackTransitionType {
            NONE,
            CROSSFADE,
            SLIDE_RIGHT,
            SLIDE_LEFT,
            SLIDE_UP,
            SLIDE_DOWN,
            SLIDE_LEFT_RIGHT,
            SLIDE_UP_DOWN,
            OVER_UP,
            OVER_DOWN,
            OVER_LEFT,
            OVER_RIGHT,
            UNDER_UP,
            UNDER_DOWN,
            UNDER_LEFT,
            UNDER_RIGHT,
            OVER_UP_DOWN,
            OVER_DOWN_UP,
            OVER_LEFT_RIGHT,
            OVER_RIGHT_LEFT,
        }

        export class Separator { }
        export class ScrolledWindow { }
        // Add other Gtk types as needed
    }

    /**
     * GDK (GIMP Drawing Kit) namespace
     * Provides low-level graphics and windowing functionality
     */
    export namespace Gdk {
        export class Monitor {
            display_name: string;
            // Add monitor properties as needed
        }

        export class Display {
            static get_default(): Display | null;
            connect(signal: string, callback: (...args: any[]) => void): number;
        }

        // Add other Gdk types as needed
    }
}

/**
 * AstalNotifd - Notification daemon bindings
 */
declare module 'gi://AstalNotifd' {
    export interface Notification {
        id: number;
        app_name: string;
        app_icon: string;
        summary: string;
        body: string;
        actions: string[];
        urgency: number;
        time: number;
        get_icon_name(): string;
    }

    export interface Notifd {
        dont_disturb: boolean;
        dontDisturb: boolean;
        notifications: Notification[];
    }

    export namespace AstalNotifd {
        export function get_default(): Notifd;
    }

    export default AstalNotifd;
}

/**
 * AstalApps - Application launcher bindings
 */
declare module 'gi://AstalApps' {
    export interface App {
        name: string;
        description: string;
        executable: string;
        icon_name: string;
        get_icon_name(): string;
        launch(): void;
    }

    export class Apps {
        constructor();
        get_list(): App[];
        fuzzy_query(query: string): App[];
        query(query: string): App[];
    }

    export namespace AstalApps {
        export { Apps };
    }

    export default AstalApps;
}
