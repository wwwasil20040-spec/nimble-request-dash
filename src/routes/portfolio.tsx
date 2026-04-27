import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site-config";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: `أعمالنا السابقة — ${SITE.brandName}` },
      {
        name: "description",
        content:
          "نماذج من المشاريع البحثية والرسائل الجامعية والتحليلات الإحصائية التي نفّذتها مؤسسة الأصيل لطلابها وعملائها.",
      },
      { property: "og:title", content: `أعمالنا السابقة — ${SITE.brandName}` },
      { property: "og:description", content: "نماذج مختارة من أعمالنا البحثية والأكاديمية." },
    ],
  }),
  component: PortfolioPage,
});

interface PortfolioItem {
  id: string;
  title: string;
  category: string | null;
  field: string | null;
  year: string | null;
  description: string | null;
  file_path: string;
  file_name: string;
}

function iconFor(category: string | null) {
  const c = (category ?? "").toLowerCase();
  if (c.includes("دكتوراه")) return "🎓";
  if (c.includes("ماجستير")) return "🎓";
  if (c.includes("تحليل") || c.includes("spss")) return "📊";
  if (c.includes("بحث")) return "📖";
  if (c.includes("رياض")) return "🧮";
  if (c.includes("تخرج") || c.includes("برمج")) return "💻";
  if (c.includes("ترجم")) return "📝";
  return "📄";
}

function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("id,title,category,field,year,description,file_path,file_name")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (!error) setItems((data ?? []) as PortfolioItem[]);
      setLoading(false);
    })();
  }, []);

  function publicUrl(path: string) {
    return supabase.storage.from("portfolio-files").getPublicUrl(path).data.publicUrl;
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      <section className="py-12 px-5 text-white" style={{ background: "var(--grad-hero)" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">أعمالنا السابقة</h1>
          <p className="text-white/85 max-w-2xl mx-auto">
            نماذج مختارة من المشاريع التي نفّذناها — يمكنك تصفّح ملفات PDF مباشرة.
          </p>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">جاري تحميل الأعمال...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground mb-2">لا توجد أعمال منشورة بعد.</p>
              <p className="text-sm text-muted-foreground">سيتم نشر نماذج من أعمالنا قريباً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((w) => (
                <article
                  key={w.id}
                  className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)] hover:-translate-y-1 transition flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                      style={{ background: "var(--grad-accent)" }}
                    >
                      {iconFor(w.category)}
                    </div>
                    {w.category && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded text-primary bg-[oklch(0.94_0.03_245)]">
                        {w.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold mb-2">{w.title}</h2>
                  {w.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{w.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3">
                    <span>{w.field ? `📚 ${w.field}` : ""}</span>
                    <span>{w.year ? `📅 ${w.year}` : ""}</span>
                  </div>
                  <a
                    href={publicUrl(w.file_path)}
                    target="_blank"
                    rel="noopener"
                    className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition text-sm"
                  >
                    📄 عرض ملف PDF
                  </a>
                </article>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">هل تريد عملاً مشابهاً؟</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
            >
              📝 ابدأ مشروعك معنا
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
