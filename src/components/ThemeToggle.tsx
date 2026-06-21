import { useTheme } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="تبديل الوضع الليلي"
      title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
      className={`w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted transition ${className}`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
