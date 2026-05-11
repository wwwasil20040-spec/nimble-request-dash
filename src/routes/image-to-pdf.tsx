import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { SITE } from "@/lib/site-config";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/image-to-pdf")({
  head: () => ({
    meta: [
      { title: `تحويل الصور إلى PDF — ${SITE.brandName}` },
      {
        name: "description",
        content:
          "خدمة مجانية لتحويل صورك إلى ملف PDF واحد بسهولة — مناسب للوثائق وصور الواجبات والتقارير.",
      },
      { property: "og:title", content: `تحويل الصور إلى PDF — ${SITE.brandName}` },
      { property: "og:description", content: "حوّل صورك إلى PDF بضغطة واحدة، بدون رفع للسيرفر." },
    ],
  }),
  component: ImageToPdfPage,
});

function ImageToPdfPage() {
  const [images, setImages] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...list]);
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function generate() {
    if (images.length === 0) {
      toast.error("اختر صورة واحدة على الأقل");
      return;
    }
    setBusy(true);
    try {
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
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `images-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success("تم إنشاء ملف PDF بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء التحويل");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      <section className="py-12 px-5 text-white" style={{ background: "var(--grad-hero)" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">🖼️ تحويل الصور إلى PDF</h1>
          <p className="text-white/85 max-w-2xl mx-auto">
            ارفع صورك ورتّبها بالترتيب الذي تريده — يتم التحويل داخل متصفحك بدون أي رفع للسيرفر.
          </p>
        </div>
      </section>

      <section className="py-12 px-5">
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <label className="block font-semibold mb-2 text-sm">اختر الصور (يمكن اختيار أكثر من صورة)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onPick}
            className="w-full px-3 py-2 border border-input rounded-md bg-secondary/30 text-sm mb-4"
          />

          {images.length > 0 && (
            <ul className="space-y-2 mb-4">
              {images.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-2 border border-border rounded-md bg-secondary/30"
                >
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span className="flex-1 text-sm truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="px-2 py-1 text-xs border border-border rounded hover:bg-background"
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="px-2 py-1 text-xs border border-border rounded hover:bg-background"
                    disabled={i === images.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="px-2 py-1 text-xs text-destructive border border-destructive/30 rounded hover:bg-destructive/10"
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={busy || images.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "جاري التحويل..." : `📄 تحويل ${images.length || ""} ${images.length ? "صورة" : ""} إلى PDF`}
          </button>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            🔒 جميع العمليات تتم محلياً داخل متصفحك — لا يتم رفع صورك إلى أي سيرفر.
          </p>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
