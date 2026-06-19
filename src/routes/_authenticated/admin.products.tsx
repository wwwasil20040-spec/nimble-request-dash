import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fileToCompressedDataUrl } from "@/lib/image-utils";

type Row = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "إدارة المنتجات" }] }),
  component: AdminProducts,
});

const empty = { name: "", description: "", price: "0", image_url: "", is_active: true, sort_order: 0 };

function AdminProducts() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("products")
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
      name: form.name,
      description: form.description || null,
      price: Number(form.price) || 0,
      image_url: form.image_url || null,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "تم التحديث" : "تمت الإضافة");
    resetForm();
    load();
  }

  async function del(id: string) {
    if (!confirm("حذف هذا المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  }

  function edit(r: Row) {
    setEditing(r);
    setForm({
      name: r.name,
      description: r.description || "",
      price: String(r.price),
      image_url: r.image_url || "",
      is_active: r.is_active,
      sort_order: r.sort_order,
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
          <p className="text-sm text-muted-foreground mb-4">
            حسابك لا يملك صلاحية المدير. يرجى التواصل لإضافة صلاحية admin إلى حسابك.
          </p>
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
          <h1 className="text-2xl font-extrabold">إدارة المنتجات</h1>
          <div className="flex gap-2">
            <Link to="/products" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">
              عرض الصفحة العامة
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
            {editing ? "تعديل منتج" : "إضافة منتج جديد"}
          </h2>
          <Field label="الاسم *">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="inp"
            />
          </Field>
          <Field label="السعر *">
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="inp"
            />
          </Field>
          <Field label="صورة المنتج" className="md:col-span-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const d = await fileToCompressedDataUrl(f, 1200, 0.8);
                  setForm({ ...form, image_url: d });
                } catch {
                  toast.error("تعذر قراءة الصورة");
                }
              }}
              className="block w-full text-sm"
            />
            {form.image_url && (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.image_url} alt="معاينة" className="h-24 w-24 object-cover rounded-lg border border-border" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="text-sm text-destructive font-bold"
                >
                  إزالة الصورة
                </button>
              </div>
            )}
          </Field>
          <Field label="ترتيب العرض">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="inp"
            />
          </Field>
          <Field label="الوصف" className="md:col-span-2">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="inp"
            />
          </Field>
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span className="text-sm font-semibold">مفعّل (يظهر للزوار)</span>
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] disabled:opacity-60"
            >
              {loading ? "..." : editing ? "حفظ التعديلات" : "إضافة"}
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
                <th className="p-3 text-right">السعر</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    لا توجد منتجات بعد.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3 font-semibold">{r.name}</td>
                    <td className="p-3">{Number(r.price).toFixed(2)}</td>
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
