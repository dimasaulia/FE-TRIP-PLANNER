export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "tp.theme";

/** Runs before paint so the page never flashes the wrong theme. */
export const themeBootScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})();`;
