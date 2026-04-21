import { useState, useRef, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function RequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const fd = new FormData(e.currentTarget);
      const full_name = String(fd.get("full_name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const service_type = String(fd.get("service_type") || "").trim() || null;
      const details = String(fd.get("details") || "").trim();
      const file = fileInputRef.current?.files?.[0] ?? null;

      if (!full_name || !phone || !details) {
        toast.error("الرجاء تعبئة الحقول المطلوبة");
        setSubmitting(false);
        return;
      }
      if (file && file.size > 50 * 1024 * 1024) {
        toast.error("حجم الملف يتجاوز 50 ميغابايت");
        setSubmitting(false);
        return;
      }

      let file_path: string | null = null;
      let file_name: string | null = null;

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_");
        const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
        const { error: uploadErr } = await supabase.storage
          .from("request-files")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadErr) {
          console.error("upload error", uploadErr);
          toast.error("تعذر رفع الملف");
          setSubmitting(false);
          return;
        }
        file_path = path;
        file_name = file.name;
      }

      const { error } = await supabase.from("service_requests").insert({
        full_name,
        phone,
        service_type,
        details,
        file_name,
        file_path,
        status: "new",
      });

      if (error) {
        console.error("insert error", error);
        toast.error("تعذر إرسال الطلب، حاول مرة أخرى");
        setSubmitting(false);
        return;
      }

      toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريباً.");
      formRef.current?.reset();
      setFileName("");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]"
    >
      <div className="mb-4">
        <label className="block font-semibold mb-2 text-sm">الاسم الكامل *</label>
        <input
          name="full_name"
          required
          maxLength={200}
          className="w-full px-3 py-2.5 border border-input rounded-md bg-secondary/30 focus:outline-none focus:border-[var(--primary-2)] transition"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2 text-sm">رقم الجوال *</label>
        <input
          name="phone"
          required
          maxLength={50}
          className="w-full px-3 py-2.5 border border-input rounded-md bg-secondary/30 focus:outline-none focus:border-[var(--primary-2)] transition"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2 text-sm">نوع الخدمة</label>
        <input
          name="service_type"
          maxLength={200}
          placeholder="بحث / تحليل / رياضة ..."
          className="w-full px-3 py-2.5 border border-input rounded-md bg-secondary/30 focus:outline-none focus:border-[var(--primary-2)] transition"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2 text-sm">تفاصيل الطلب *</label>
        <textarea
          name="details"
          required
          rows={4}
          maxLength={5000}
          className="w-full px-3 py-2.5 border border-input rounded-md bg-secondary/30 focus:outline-none focus:border-[var(--primary-2)] transition resize-y"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2 text-sm">
          رفع ملفات (PDF, DOCX, ZIP, صور — حتى 50MB)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.zip,.jpg,.jpeg,.png,.txt"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
          className="w-full px-3 py-2 border border-input rounded-md bg-secondary/30 text-sm"
        />
        {fileName && <p className="text-xs text-muted-foreground mt-1">📎 {fileName}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:opacity-95 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "جاري الإرسال..." : "📤 إرسال الطلب"}
      </button>
    </form>
  );
}
