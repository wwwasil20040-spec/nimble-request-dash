import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { SITE } from "@/lib/site-config";

export function RequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const fd = new FormData(e.currentTarget);
      const full_name = String(fd.get("full_name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const service_type = String(fd.get("service_type") || "").trim();
      const details = String(fd.get("details") || "").trim();

      if (!full_name || !phone || !details) {
        toast.error("الرجاء تعبئة الحقول المطلوبة");
        setSubmitting(false);
        return;
      }

      const lines = [
        "🌟 *طلب خدمة جديد*",
        "",
        `👤 *الاسم:* ${full_name}`,
        `📱 *الجوال:* ${phone}`,
      ];
      if (service_type) lines.push(`📋 *نوع الخدمة:* ${service_type}`);
      lines.push("", "📝 *تفاصيل الطلب:*", details);

      const text = encodeURIComponent(lines.join("\n"));
      const waUrl = `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      toast.success("تم فتح واتساب — أرسل الرسالة وأرفق الملفات إن وجدت");
      formRef.current?.reset();
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
      <div className="text-xs text-muted-foreground mb-3 leading-relaxed bg-secondary/40 rounded-md p-3">
        📎 إذا كان طلبك يتطلب إرفاق ملفات أو صور، أرسلها مباشرة في محادثة واتساب بعد فتحها.
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:opacity-95 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "جاري التجهيز..." : "💬 إرسال عبر واتساب"}
      </button>
    </form>
  );
}
