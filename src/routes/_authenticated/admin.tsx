import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/AdminNav";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "لوحة الإدارة" }] }),
  component: AdminHome,
});

const LAST_SEEN_KEY = "admin_orders_last_seen_v1";

type Counts = {
  ordersTotal: number;
  ordersNew: number;
  ordersUnseen: number;
  products: number;
  reviews: number;
  discounts: number;
};

function AdminHome() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<Array<{ id: string; full_name: string; phone: string; service_type: string | null; created_at: string; tracking_code: string; status: string }>>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!role);
      if (role) load();
    })();
  }, []);

  async function load() {
    try {
      const lastSeen = typeof window !== "undefined" ? localStorage.getItem(LAST_SEEN_KEY) : null;
      const [oAll, oNew, oUnseen, prod, rev, dc, rec] = await Promise.all([
        supabase.from("service_requests").select("id", { count: "exact", head: true }),
        supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
        lastSeen
          ? supabase.from("service_requests").select("id", { count: "exact", head: true }).gt("created_at", lastSeen)
          : supabase.from("service_requests").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("discount_codes").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("service_requests").select("id,full_name,phone,service_type,created_at,tracking_code,status").order("created_at", { ascending: false }).limit(6),
      ]);
      setCounts({
        ordersTotal: oAll.count || 0,
        ordersNew: oNew.count || 0,
        ordersUnseen: oUnseen.count || 0,
        products: prod.count || 0,
        reviews: rev.count || 0,
        discounts: dc.count || 0,
      });
      setRecent((rec.data as typeof recent) || []);
    } catch (e: any) {
      toast.error(e?.message || "تعذر تحميل البيانات");
    }
  }

  function markSeen() {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    load();
    toast.success("تم تعليم كل الطلبات كمقروءة");
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
          <button onClick={logout} className="px-4 py-2 rounded-lg border border-border font-bold">تسجيل الخروج</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-5" dir="rtl">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold">🎛️ لوحة الإدارة</h1>
          {counts && counts.ordersUnseen > 0 && (
            <button
              onClick={markSeen}
              className="relative px-4 py-2 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)]"
            >
              🔔 {counts.ordersUnseen} طلب جديد — تعليم كمقروء
            </button>
          )}
        </div>

        <AdminNav onLogout={logout} />

        {!counts ? (
          <p className="text-muted-foreground text-center py-12">جاري التحميل...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card icon="📨" label="إجمالي الطلبات" value={counts.ordersTotal} to="/admin/orders" />
              <Card icon="🆕" label="طلبات جديدة" value={counts.ordersNew} to="/admin/orders" highlight={counts.ordersNew > 0} />
              <Card icon="📦" label="المنتجات" value={counts.products} to="/admin/products" />
              <Card icon="⭐" label="آراء الزبائن" value={counts.reviews} to="/admin/reviews" />
              <Card icon="🎟️" label="أكواد فعّالة" value={counts.discounts} to="/admin/discounts" />
              <Card icon="🛠️" label="خيارات الخدمة" value="→" to="/admin/service-options" />
              <Card icon="👥" label="المستخدمون" value="→" to="/admin/users" />
              <Card icon="📈" label="إحصائيات" value="→" to="/admin/stats" />
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-extrabold">آخر الطلبات</h2>
                <Link to="/admin/orders" className="text-sm font-bold text-[var(--primary-2)] hover:underline">
                  عرض الكل ←
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="text-muted-foreground text-sm">لا توجد طلبات بعد.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="text-right text-xs text-muted-foreground border-b border-border">
                      <tr>
                        <th className="p-2">الرمز</th>
                        <th className="p-2">الاسم</th>
                        <th className="p-2">الجوال</th>
                        <th className="p-2">الخدمة</th>
                        <th className="p-2">الحالة</th>
                        <th className="p-2">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r) => (
                        <tr key={r.id} className="border-b border-border last:border-0">
                          <td className="p-2 font-mono">{r.tracking_code}</td>
                          <td className="p-2 font-semibold">{r.full_name}</td>
                          <td className="p-2">{r.phone}</td>
                          <td className="p-2">{r.service_type || "-"}</td>
                          <td className="p-2">{r.status}</td>
                          <td className="p-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("ar")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ icon, label, value, to, highlight }: { icon: string; label: string; value: number | string; to: string; highlight?: boolean }) {
  return (
    <Link
      to={to}
      className={`block bg-card border rounded-2xl p-4 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition ${highlight ? "border-[var(--primary-2)] ring-2 ring-[var(--primary-2)]/30" : "border-border"}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold text-[var(--primary-2)]">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </Link>
  );
}
