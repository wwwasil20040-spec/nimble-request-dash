import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/stats")({
  head: () => ({ meta: [{ title: "لوحة الإحصائيات" }] }),
  component: AdminStats,
});

type Stats = {
  productsActive: number;
  productsAll: number;
  reviews: number;
  discountsActive: number;
  serviceOptions: number;
  requestsTotal: number;
  requestsToday: number;
  byStatus: Record<string, number>;
  topServices: { name: string; count: number }[];
};

function AdminStats() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roleRow);
      if (roleRow) load();
    })();
  }, []);

  async function load() {
    try {
      const todayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      const [pAll, pActive, rev, dc, so, reqAll, reqToday, reqRows] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("discount_codes").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("service_options").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("service_requests").select("id", { count: "exact", head: true }),
        supabase.from("service_requests").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
        supabase.from("service_requests").select("status,service_type"),
      ]);

      const rows = (reqRows.data as { status: string; service_type: string }[]) || [];
      const byStatus: Record<string, number> = {};
      const svcMap: Record<string, number> = {};
      for (const r of rows) {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        if (r.service_type) svcMap[r.service_type] = (svcMap[r.service_type] || 0) + 1;
      }
      const topServices = Object.entries(svcMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        productsAll: pAll.count || 0,
        productsActive: pActive.count || 0,
        reviews: rev.count || 0,
        discountsActive: dc.count || 0,
        serviceOptions: so.count || 0,
        requestsTotal: reqAll.count || 0,
        requestsToday: reqToday.count || 0,
        byStatus,
        topServices,
      });
    } catch (e: any) {
      toast.error(e?.message || "تعذر تحميل الإحصائيات");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" dir="rtl">
        <div className="max-w-md text-center bg-card border border-border rounded-2xl p-8">
          <h1 className="text-xl font-extrabold mb-3">⛔ غير مصرح</h1>
          <button onClick={logout} className="px-4 py-2 rounded-lg border border-border font-bold">
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    new: "جديد",
    in_progress: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  return (
    <div className="min-h-screen bg-background py-8 px-5" dir="rtl">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold">📈 لوحة الإحصائيات</h1>
          <div className="flex gap-2 flex-wrap">
            <Link to="/admin/products" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">المنتجات</Link>
            <Link to="/admin/discounts" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">الأكواد</Link>
            <Link to="/admin/reviews" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">الآراء</Link>
            <Link to="/admin/service-options" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">الخدمات</Link>
            <button onClick={logout} className="px-3 py-2 rounded-lg border border-border text-sm font-bold">خروج</button>
          </div>
        </div>

        {!stats ? (
          <p className="text-muted-foreground text-center py-12">جاري التحميل...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon="📨" label="إجمالي الطلبات" value={stats.requestsTotal} />
              <StatCard icon="📅" label="طلبات اليوم" value={stats.requestsToday} />
              <StatCard icon="📦" label="المنتجات المفعّلة" value={`${stats.productsActive}/${stats.productsAll}`} />
              <StatCard icon="🎟️" label="أكواد فعّالة" value={stats.discountsActive} />
              <StatCard icon="⭐" label="آراء الزبائن" value={stats.reviews} />
              <StatCard icon="🛠️" label="خيارات الخدمات" value={stats.serviceOptions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-extrabold mb-4">الطلبات حسب الحالة</h2>
                {Object.keys(stats.byStatus).length === 0 ? (
                  <p className="text-muted-foreground text-sm">لا توجد بيانات.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.byStatus).map(([k, v]) => {
                      const pct = stats.requestsTotal ? (v / stats.requestsTotal) * 100 : 0;
                      return (
                        <div key={k}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold">{statusLabels[k] || k}</span>
                            <span className="text-muted-foreground">{v} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-[image:var(--grad-accent)]" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-extrabold mb-4">أكثر الخدمات طلباً</h2>
                {stats.topServices.length === 0 ? (
                  <p className="text-muted-foreground text-sm">لا توجد بيانات.</p>
                ) : (
                  <ol className="space-y-2">
                    {stats.topServices.map((s, i) => (
                      <li key={s.name} className="flex justify-between border-b border-border pb-2 text-sm">
                        <span className="font-semibold">{i + 1}. {s.name}</span>
                        <span className="text-[var(--primary-2)] font-bold">{s.count}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-card)]">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold text-[var(--primary-2)]">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
