import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/AdminNav";
import { downloadCsv, printHtml } from "@/lib/csv-export";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "إدارة الطلبات" }] }),
  component: AdminOrders,
});

type Order = {
  id: string;
  tracking_code: string;
  full_name: string;
  phone: string;
  service_type: string | null;
  details: string;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "in_progress", "completed", "cancelled"] as const;
const LABELS: Record<string, string> = {
  new: "جديد",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغي",
};

function AdminOrders() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!role);
      if (role) load();
    })();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("service_requests")
      .select("id,tracking_code,full_name,phone,service_type,details,status,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data as Order[]) || []);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("تم التحديث"); load(); }
  }

  async function del(id: string) {
    if (!confirm("حذف هذا الطلب؟")) return;
    const { error } = await supabase.from("service_requests").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("تم الحذف"); load(); }
  }

  async function logout() { await supabase.auth.signOut(); navigate({ to: "/auth" }); }

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return [r.full_name, r.phone, r.tracking_code, r.service_type || "", r.details]
        .some((s) => s.toLowerCase().includes(q));
    }
    return true;
  });

  function exportCsv() {
    const rowsOut = filtered.map((r) => ({
      "الرمز": r.tracking_code,
      "الاسم": r.full_name,
      "الجوال": r.phone,
      "الخدمة": r.service_type || "",
      "التفاصيل": r.details,
      "الحالة": LABELS[r.status] || r.status,
      "التاريخ": new Date(r.created_at).toLocaleString("ar"),
    }));
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, rowsOut);
  }

  function exportPdf() {
    const body = `<table><thead><tr>
      <th>الرمز</th><th>الاسم</th><th>الجوال</th><th>الخدمة</th><th>التفاصيل</th><th>الحالة</th><th>التاريخ</th>
    </tr></thead><tbody>${filtered.map((r) => `<tr>
      <td>${r.tracking_code}</td>
      <td>${escapeHtml(r.full_name)}</td>
      <td>${escapeHtml(r.phone)}</td>
      <td>${escapeHtml(r.service_type || "")}</td>
      <td>${escapeHtml(r.details)}</td>
      <td>${LABELS[r.status] || r.status}</td>
      <td>${new Date(r.created_at).toLocaleString("ar")}</td>
    </tr>`).join("")}</tbody></table>`;
    printHtml(`طلبات — ${new Date().toLocaleDateString("ar")}`, body);
  }

  if (isAdmin === false) return <Deny onLogout={logout} />;

  return (
    <div className="min-h-screen bg-background py-8 px-5" dir="rtl">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-extrabold mb-4">📨 إدارة الطلبات</h1>
        <AdminNav onLogout={logout} />

        <div className="flex gap-2 flex-wrap items-center mb-4">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
            <option value="all">كل الحالات</option>
            {STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
          </select>
          <input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm flex-1 min-w-[180px]" />
          <button onClick={exportCsv} className="px-3 py-2 rounded-lg border border-border text-sm font-bold">📊 Excel/CSV</button>
          <button onClick={exportPdf} className="px-3 py-2 rounded-lg border border-border text-sm font-bold">🖨️ PDF</button>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-right">
                <tr>
                  <th className="p-3">الرمز</th>
                  <th className="p-3">الاسم</th>
                  <th className="p-3">الجوال</th>
                  <th className="p-3">الخدمة</th>
                  <th className="p-3">التفاصيل</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">لا توجد طلبات.</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="p-3 font-mono text-xs whitespace-nowrap">{r.tracking_code}</td>
                    <td className="p-3 font-semibold whitespace-nowrap">{r.full_name}</td>
                    <td className="p-3 whitespace-nowrap"><a href={`tel:${r.phone}`} className="hover:underline">{r.phone}</a></td>
                    <td className="p-3 whitespace-nowrap">{r.service_type || "-"}</td>
                    <td className="p-3 max-w-[280px]"><div className="line-clamp-3 text-xs">{r.details}</div></td>
                    <td className="p-3">
                      <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="px-2 py-1 rounded border border-border bg-background text-xs">
                        {STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString("ar")}</td>
                    <td className="p-3 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                        target="_blank" rel="noreferrer"
                        className="px-2 py-1 rounded-md border border-border text-xs ml-1"
                      >واتساب</a>
                      <button onClick={() => del(r.id)} className="px-2 py-1 rounded-md border border-destructive text-destructive text-xs">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function Deny({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5" dir="rtl">
      <div className="max-w-md text-center bg-card border border-border rounded-2xl p-8">
        <h1 className="text-xl font-extrabold mb-3">⛔ غير مصرح</h1>
        <button onClick={onLogout} className="px-4 py-2 rounded-lg border border-border font-bold">تسجيل الخروج</button>
      </div>
    </div>
  );
}
