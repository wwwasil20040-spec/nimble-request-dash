import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  note: string | null;
};

export const Route = createFileRoute("/_authenticated/admin/discounts")({
  head: () => ({ meta: [{ title: "إدارة أكواد الخصم" }] }),
  component: AdminDiscounts,
});

const empty = {
  code: "",
  discount_percent: "10",
  is_active: true,
  max_uses: "",
  expires_at: "",
  note: "",
};

function AdminDiscounts() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data as Row[]) || []);
  }

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
      load();
    })();
  }, []);

  function resetForm() {
    setEditing(null);
    setForm({ ...empty });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_percent: Number(form.discount_percent) || 0,
      is_active: form.is_active,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      note: form.note || null,
    };
    const { error } = editing
      ? await supabase.from("discount_codes").update(payload).eq("id", editing.id)
      : await supabase.from("discount_codes").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "تم التحديث" : "تمت الإضافة");
    resetForm();
    load();
  }

  async function del(id: string) {
    if (!confirm("حذف هذا الكود؟")) return;
    const { error } = await supabase.from("discount_codes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  }

  function edit(r: Row) {
    setEditing(r);
    setForm({
      code: r.code,
      discount_percent: String(r.discount_percent),
      is_active: r.is_active,
      max_uses: r.max_uses ? String(r.max_uses) : "",
      expires_at: r.expires_at ? r.expires_at.slice(0, 16) : "",
      note: r.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="min-h-screen bg-background py-8 px-5" dir="rtl">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold">🎟️ إدارة أكواد الخصم</h1>
          <div className="flex gap-2 flex-wrap">
            <Link to="/admin/stats" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">📈 الإحصائيات</Link>
            <Link to="/admin/products" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">المنتجات</Link>
            <button onClick={logout} className="px-3 py-2 rounded-lg border border-border text-sm font-bold">خروج</button>
          </div>
        </div>

        <form
          onSubmit={save}
          className="bg-card border border-border rounded-2xl p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="md:col-span-2 font-extrabold text-lg">
            {editing ? "تعديل كود" : "إضافة كود جديد"}
          </h2>
          <Field label="الكود *">
            <input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="مثال: WELCOME10"
              className="inp uppercase"
            />
          </Field>
          <Field label="نسبة الخصم % *">
            <input
              required
              type="number"
              min="1"
              max="100"
              value={form.discount_percent}
              onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
              className="inp"
            />
          </Field>
          <Field label="الحد الأقصى للاستخدام (اختياري)">
            <input
              type="number"
              min="1"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              placeholder="بدون حد"
              className="inp"
            />
          </Field>
          <Field label="تاريخ الانتهاء (اختياري)">
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="inp"
            />
          </Field>
          <Field label="ملاحظة" className="md:col-span-2">
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="inp"
            />
          </Field>
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span className="text-sm font-semibold">مفعّل</span>
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] disabled:opacity-60"
            >
              {loading ? "..." : editing ? "حفظ" : "إضافة"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg font-bold border border-border">
                إلغاء
              </button>
            )}
          </div>
        </form>

        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-right">الكود</th>
                <th className="p-3 text-right">الخصم</th>
                <th className="p-3 text-right">الاستخدام</th>
                <th className="p-3 text-right">الانتهاء</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    لا توجد أكواد بعد.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3 font-bold">{r.code}</td>
                    <td className="p-3">{r.discount_percent}%</td>
                    <td className="p-3">
                      {r.used_count}{r.max_uses ? ` / ${r.max_uses}` : ""}
                    </td>
                    <td className="p-3 text-xs">
                      {r.expires_at ? new Date(r.expires_at).toLocaleDateString("ar") : "—"}
                    </td>
                    <td className="p-3">
                      <span className={r.is_active ? "text-green-600" : "text-muted-foreground"}>
                        {r.is_active ? "مفعّل" : "متوقف"}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => edit(r)} className="px-3 py-1 rounded-md border border-border">تعديل</button>
                      <button onClick={() => del(r.id)} className="px-3 py-1 rounded-md border border-destructive text-destructive">حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`.inp{width:100%;padding:.55rem .75rem;border:1px solid var(--border);border-radius:.5rem;background:var(--background);}`}</style>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}
