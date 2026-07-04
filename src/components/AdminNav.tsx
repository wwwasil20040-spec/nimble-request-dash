import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/admin", label: "الرئيسية", icon: "🏠" },
  { to: "/admin/orders", label: "الطلبات", icon: "📨" },
  { to: "/admin/products", label: "المنتجات", icon: "📦" },
  { to: "/admin/service-options", label: "خيارات الخدمات", icon: "🛠️" },
  { to: "/admin/discounts", label: "أكواد الخصم", icon: "🎟️" },
  { to: "/admin/reviews", label: "الآراء", icon: "⭐" },
  { to: "/admin/users", label: "المستخدمون", icon: "👥" },
  { to: "/admin/stats", label: "الإحصائيات", icon: "📈" },
] as const;

export function AdminNav({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="flex gap-2 flex-wrap items-center mb-6" dir="rtl">
      {LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="px-3 py-2 rounded-lg border border-border text-xs font-bold hover:bg-muted transition"
          activeProps={{ className: "px-3 py-2 rounded-lg border text-xs font-bold bg-[image:var(--grad-accent)] text-white border-transparent" }}
          activeOptions={{ exact: l.to === "/admin" }}
        >
          <span className="ml-1">{l.icon}</span>
          {l.label}
        </Link>
      ))}
      {onLogout && (
        <button onClick={onLogout} className="mr-auto px-3 py-2 rounded-lg border border-border text-xs font-bold">
          خروج
        </button>
      )}
    </div>
  );
}
