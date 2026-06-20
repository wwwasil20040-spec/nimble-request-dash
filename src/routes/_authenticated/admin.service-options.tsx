import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  is_out_of_stock: boolean;
  discount_percent: number;
  note: string | null;
};

export const Route = createFileRoute("/_authenticated/admin/service-options")({
  head: () => ({ meta: [{ title: "إدارة خيارات نوع الخدمة" }] }),
  component: AdminServiceOptions,
});

const empty = {
  name: "",
  sort_order: 0,
  is_active: true,
  is_out_of_stock: false,
  discount_percent: 0,
  note: "",
};

function AdminServiceOptions() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("service_options")
      .select("*")
      .order("sort_order", { ascending: true })
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
      name: form.name.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      is_out_of_stock: form.is_out_of_stock,
      discount_percent: Math.max(0, Math.min(100, Number(form.discount_percent) || 0)),
      note: form.note?.trim() || null,
    };
    if (!payload.name) {
      setLoading(false);
      return toast.error("الاسم مطلوب");
    }
    const { error } = editing
      ? await supabase.from("service_options").update(payload).eq("id", editing.id)
      : await supabase.from("service_options").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "تم التحديث" : "تمت الإضافة");
    resetForm();
    load();
  }

  async function del(id: string) {
    if (!confirm("حذف هذا الخيار؟")) return;
    const { error } = await supabase.from("service_options").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  }

  function edit(r: Row) {
    setEditing(r);
    setForm({
      name: r.name,
      sort_order: r.sort_order,
      is_active: r.is_active,
      is_out_of_stock: r.is_out_of_stock,
      discount_percent: r.discount_percent,
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
          <h1 className="text-2xl font-extrabold">خيارات نوع الخدمة</h1>
          <div className="flex gap-2 flex-wrap">
            <Link to="/admin/products" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">
              المنتجات
            </Link>
            <Link to="/admin/reviews" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">
              الآراء
            </Link>
            <Link to="/contact" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">
              صفحة الطلب
            </Link>
            <button onClick={logout} className="px-3 py-2 rounded-lg border border-border text-sm font-bold">
              خروج
            </button>
          </div>
        </div>

        <form
          onSubmit={save}
          className="bg-card border border-border rounded-2xl p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="md:col-span-2 font-extrabold text-lg">
            {editing ? "تعديل خيار" : "إضافة خيار جديد"}
          </h2>
          <Field label="اسم الخيار *">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="inp"
              placeholder="مثال: بحث جامعي"
            />
          </Field>
          <Field label="ترتيب العرض">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="inp"
            />
          </Field>
          <Field label="نسبة الخصم %">
            <input
              type="number"
              min="0"
              max="100"
              value={form.discount_percent}
              onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
              className="inp"
            />
          </Field>
          <Field label="ملاحظة (اختياري)">
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="inp"
              placeholder="مثال: عرض لفترة محدودة"
            />
          </Field>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span className="text-sm font-semibold">مفعّل (يظهر للزوار)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_out_of_stock}
              onChange={(e) => setForm({ ...form, is_out_of_stock: e.target.checked })}
            />
            <span className="text-sm font-semibold">نفاد / غير متوفر حالياً</span>
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
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-lg font-bold border border-border"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right">خصم</th>
                <th className="p-3 text-right">المخزون</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    لا توجد خيارات بعد.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3 font-semibold">
                      {r.name}
                      {r.note && <div className="text-xs text-muted-foreground font-normal">{r.note}</div>}
                    </td>
                    <td className="p-3">{r.discount_percent > 0 ? `${r.discount_percent}%` : "—"}</td>
                    <td className="p-3">
                      {r.is_out_of_stock ? (
                        <span className="text-destructive">نافد</span>
                      ) : (
                        <span className="text-green-600">متوفر</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={r.is_active ? "text-green-600" : "text-muted-foreground"}>
                        {r.is_active ? "مفعّل" : "مخفي"}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => edit(r)} className="px-3 py-1 rounded-md border border-border">
                        تعديل
                      </button>
                      <button
                        onClick={() => del(r.id)}
                        className="px-3 py-1 rounded-md border border-destructive text-destructive"
                      >
                        حذف
                      </button>
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

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}
