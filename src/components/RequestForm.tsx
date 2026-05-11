import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { SITE } from "@/lib/site-config";
import jsPDF from "jspdf";

export function RequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setFiles(list);
  }

  async function imagesToPdf(images: File[]): Promise<Blob> {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const dataUrl: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = dataUrl;
      });
      const ratio = Math.min(pageW / img.width, pageH / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;
      if (i > 0) pdf.addPage();
      const fmt = file.type.includes("png") ? "PNG" : "JPEG";
      pdf.addImage(dataUrl, fmt, x, y, w, h);
    }
    return pdf.output("blob");
  }

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

      // Convert images to a single PDF if any
      const images = files.filter((f) => f.type.startsWith("image/"));
      const others = files.filter((f) => !f.type.startsWith("image/"));

      if (images.length > 0) {
        try {
          const pdfBlob = await imagesToPdf(images);
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `صور-الطلب-${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          toast.success("تم تحويل صورك إلى PDF — أرفقه في محادثة واتساب");
        } catch (err) {
          console.error(err);
          toast.error("تعذر تحويل الصور إلى PDF");
        }
      }

      // Build clean WhatsApp message
      const lines = [
        "🌟 *طلب خدمة جديد*",
        "",
        `👤 *الاسم:* ${full_name}`,
        `📱 *الجوال:* ${phone}`,
      ];
      if (service_type) lines.push(`📋 *نوع الخدمة:* ${service_type}`);
      lines.push("", "📝 *تفاصيل الطلب:*", details);

      if (images.length > 0) {
        lines.push("", `🖼️ مرفق ${images.length} صورة (تم تحويلها إلى ملف PDF — سأرفقه هنا).`);
      }
      if (others.length > 0) {
        lines.push("", `📎 مرفقات إضافية (${others.length}): ${others.map((f) => f.name).join("، ")}`);
        lines.push("سأرفقها مباشرة في هذه المحادثة.");
      }

      const text = encodeURIComponent(lines.join("\n"));
      const waUrl = `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      toast.success("تم فتح واتساب — أرسل الرسالة وأرفق الملفات");
      formRef.current?.reset();
      setFiles([]);
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
          مرفقات (صور أو ملفات — الصور ستُحوَّل تلقائياً إلى PDF)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.docx,.doc,.zip,.txt"
          onChange={onFilesChange}
          className="w-full px-3 py-2 border border-input rounded-md bg-secondary/30 text-sm"
        />
        {files.length > 0 && (
          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
            {files.map((f, i) => (
              <li key={i}>📎 {f.name}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="text-xs text-muted-foreground mb-3 leading-relaxed bg-secondary/40 rounded-md p-3">
        ℹ️ بعد الضغط على الزر: سيُفتح واتساب بالرسالة جاهزة، وإذا اخترت صوراً سيتم تحميل ملف PDF — قم بإرفاقه يدوياً في محادثة واتساب.
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
