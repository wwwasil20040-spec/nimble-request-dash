import { useEffect, useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { SITE } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";

type ServiceOption = {
  id: string;
  name: string;
  is_out_of_stock: boolean;
  discount_percent: number;
  note: string | null;
};

export function RequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [options, setOptions] = useState<ServiceOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("service_options")
        .select("id,name,is_out_of_stock,discount_percent,note")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (!error && data) setOptions(data as ServiceOption[]);
    })();
  }, []);

  const selected = options.find((o) => o.id === selectedId) || null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    if (selected?.is_out_of_stock) {
      toast.error("هذه الخدمة غير متوفرة حالياً، الرجاء اختيار خدمة أخرى");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const full_name = String(fd.get("full_name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
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
      if (selected) {
        let svc = `📋 *نوع الخدمة:* ${selected.name}`;
        if (selected.discount_percent > 0) svc += ` (خصم ${selected.discount_percent}%)`;
        lines.push(svc);
      }
      lines.push("", "📝 *تفاصيل الطلب:*", details);

      const text = encodeURIComponent(lines.join("\n"));
      const waUrl = `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      toast.success("تم فتح واتساب — أرسل الرسالة وأرفق الملفات إن وجدت");
      formRef.current?.reset();
      setSelectedId("");
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
        {options.length === 0 ? (
          <div className="text-xs text-muted-foreground px-3 py-2.5 border border-dashed border-border rounded-md bg-secondary/20">
            لا توجد خيارات متاحة حالياً — اكتب التفاصيل في الأسفل.
          </div>
        ) : (
          <select
            name="service_type_id"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2.5 border border-input rounded-md bg-secondary/30 focus:outline-none focus:border-[var(--primary-2)] transition"
          >
            <option value="">— اختر خدمة —</option>
            {options.map((o) => (
              <option key={o.id} value={o.id} disabled={o.is_out_of_stock}>
                {o.name}
                {o.discount_percent > 0 ? ` — خصم ${o.discount_percent}%` : ""}
                {o.is_out_of_stock ? " (نافد)" : ""}
              </option>
            ))}
          </select>
        )}
        {selected && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {selected.discount_percent > 0 && !selected.is_out_of_stock && (
              <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 font-bold">
                🔥 خصم {selected.discount_percent}%
              </span>
            )}
            {selected.is_out_of_stock && (
              <span className="px-2 py-1 rounded-md bg-destructive/10 text-destructive font-bold">
                ⛔ غير متوفر حالياً
              </span>
            )}
            {selected.note && (
              <span className="px-2 py-1 rounded-md bg-secondary/60 text-muted-foreground">
                {selected.note}
              </span>
            )}
          </div>
        )}
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
        disabled={submitting || selected?.is_out_of_stock}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:opacity-95 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "جاري التجهيز..." : "💬 إرسال عبر واتساب"}
      </button>
    </form>
  );
}
