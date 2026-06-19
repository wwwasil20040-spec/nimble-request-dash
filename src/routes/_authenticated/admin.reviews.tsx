import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fileToCompressedDataUrl } from "@/lib/image-utils";

type Row = {
  id: string;
  image_url: string;
  caption: string | null;
  is_active: boolean;
  sort_order: number;
};

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  head: () => ({ meta: [{ title: "إدارة آراء الزبائن" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [imageData, setImageData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data, error } = await supabase
      .from("reviews")
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

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const d = await fileToCompressedDataUrl(f, 1400, 0.8);
      setImageData(d);
    } catch {
      toast.error("تعذر قراءة الصورة");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!imageData) return toast.error("اختر صورة أولاً");
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      image_url: imageData,
      caption: caption || null,
      sort_order: sortOrder,
      is_active: true,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("تمت إضافة الرأي");
    setCaption("");
    setSortOrder(0);
    setImageData("");
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function del(id: string) {
    if (!confirm("حذف هذا الرأي؟")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  }

  async function toggle(r: Row) {
    const { error } = await supabase
      .from("reviews")
      .update({ is_active: !r.is_active })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
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
          <h1 className="text-2xl font-extrabold">إدارة آراء الزبائن</h1>
          <div className="flex gap-2">
            <Link to="/admin/products" className="px-3 py-2 rounded-lg border border-border text-sm font-bold">
              المنتجات
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
          <h2 className="md:col-span-2 font-extrabold text-lg">إضافة رأي جديد (صورة)</h2>

          <label className="block md:col-span-2">
            <span className="block text-sm font-semibold mb-1">الصورة *</span>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="block w-full text-sm" />
          </label>

          {imageData && (
            <div className="md:col-span-2">
              <img src={imageData} alt="معاينة" className="max-h-64 rounded-lg border border-border" />
            </div>
          )}

          <label className="block">
            <span className="block text-sm font-semibold mb-1">تعليق (اختياري)</span>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">ترتيب العرض</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </label>

          <div className="md:col-span-2">
            <button
              disabled={loading}
              className="px-5 py-2.5 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] disabled:opacity-60"
            >
              {loading ? "..." : "إضافة"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rows.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-10">لا توجد آراء بعد.</p>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <img src={r.image_url} alt={r.caption || "رأي زبون"} className="w-full h-48 object-cover" />
                <div className="p-3 space-y-2">
                  {r.caption && <p className="text-sm">{r.caption}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggle(r)}
                      className="flex-1 px-2 py-1 rounded-md border border-border text-xs font-bold"
                    >
                      {r.is_active ? "إخفاء" : "إظهار"}
                    </button>
                    <button
                      onClick={() => del(r.id)}
                      className="flex-1 px-2 py-1 rounded-md border border-destructive text-destructive text-xs font-bold"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
