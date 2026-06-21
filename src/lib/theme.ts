import { useEffect, useState } from "react";

const KEY = "aseel_theme_v1";
type Theme = "light" | "dark";

function apply(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme | null) || "light";
    setTheme(saved);
    apply(saved);
  }, []);
  return {
    theme,
    toggle() {
      const next: Theme = theme === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(KEY, next);
      apply(next);
    },
  };
}

// Inline script (runs before paint) to avoid theme flash.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${KEY}');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;
