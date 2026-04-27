import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  title: string;
  category: string | null;
  field: string | null;
  year: string | null;
  description: string | null;
  file_path: string;
  file_name: string;
  display_order: number;
  created_at: string;
}

export function PortfolioManager({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("تعذر تحميل الأعمال");
      return;
    }
    setItems((data ?? []) as PortfolioItem[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("اختر ملف PDF");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("يجب أن يكون الملف من نوع PDF");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 25 ميغابايت");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const title = String(fd.get("title") || "").trim();
      const category = String(fd.get("category") || "").trim() || null;
      const field = String(fd.get("field") || "").trim() || null;
      const year = String(fd.get("year") || "").trim() || null;
      const description = String(fd.get("description") || "").trim() || null;

      if (!title) {
        toast.error("العنوان مطلوب");
        setSubmitting(false);
        return;
      }

      const safe = file.name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_");
      const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from("portfolio-files")
        .upload(path, file, { contentType: "application/pdf", upsert: false });
      if (upErr) {
        console.error(upErr);
        toast.error("تعذر رفع الملف");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("portfolio_items").insert({
        title,
        category,
        field,
        year,
        description,
        file_path: path,
        file_name: file.name,
        created_by: userId,
        created_by_email: userEmail,
      } as never);

      if (error) {
        console.error(error);
        await supabase.storage.from("portfolio-files").remove([path]);
        toast.error("تعذر حفظ العمل");
        setSubmitting(false);
        return;
      }

      toast.success("تمت إضافة العمل");
      formRef.current?.reset();
      setFileName("");
      load();
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: PortfolioItem) {
    if (!confirm(`حذف "${item.title}"؟`)) return;
    await supabase.storage.from("portfolio-files").remove([item.file_path]);
    const { error } = await supabase.from("portfolio_items").delete().eq("id", item.id);
    if (error) {
      toast.error("تعذر الحذف");
      return;
    }
    toast.success("تم الحذف");
    load();
  }

  function publicUrl(path: string) {
    return supabase.storage.from("portfolio-files").getPublicUrl(path).data.publicUrl;
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-extrabold mb-4">📂 إدارة الأعمال السابقة (PDF)</h2>

      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">عنوان العمل *</label>
          <input name="title" required maxLength={200}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">التصنيف</label>
          <input name="category" maxLength={100} placeholder="رسالة دكتوراه، تحليل إحصائي..."
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">المجال</label>
          <input name="field" maxLength={100} placeholder="إدارة، رياضيات..."
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">السنة</label>
          <input name="year" maxLength={10} placeholder="2024"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">ملف PDF * (حتى 25MB)</label>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm" />
          {fileName && <p className="text-[11px] text-muted-foreground mt-1">📎 {fileName}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">وصف موجز</label>
          <textarea name="description" rows={2} maxLength={500}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-y" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={submitting}
            className="px-5 py-2.5 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] disabled:opacity-60">
            {submitting ? "جاري الرفع..." : "➕ إضافة عمل"}
          </button>
        </div>
      </form>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-bold mb-3">
          الأعمال المضافة {loading ? "..." : `(${items.length})`}
        </h3>
        {items.length === 0 && !loading ? (
          <p className="text-sm text-muted-foreground">لا توجد أعمال بعد.</p>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-secondary/30">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{it.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[it.category, it.field, it.year].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <a href={publicUrl(it.file_path)} target="_blank" rel="noopener"
                  className="px-3 py-1.5 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90">
                  عرض PDF
                </a>
                <button onClick={() => handleDelete(it)}
                  className="px-3 py-1.5 rounded-md text-xs font-bold bg-red-500 text-white hover:bg-red-600">
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
