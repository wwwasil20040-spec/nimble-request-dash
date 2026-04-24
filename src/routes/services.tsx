import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";
import { SERVICES } from "@/lib/services-data";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `الخدمات الأكاديمية — ${SITE.brandName} للبحوث العلمية` },
      {
        name: "description",
        content:
          "خدمات بحثية متكاملة: إعداد بحوث، رسائل ماجستير ودكتوراه، تحليل إحصائي SPSS و R، حل مسائل رياضيات، مشاريع تخرج وترجمة أكاديمية.",
      },
      { property: "og:title", content: `الخدمات الأكاديمية — ${SITE.brandName}` },
      {
        property: "og:description",
        content: "حلول بحثية احترافية لطلاب البكالوريوس والماجستير والدكتوراه.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      <section className="py-12 px-5 text-white" style={{ background: "var(--grad-hero)" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">خدماتنا الأكاديمية</h1>
          <p className="text-white/85 max-w-2xl mx-auto">
            اختر الخدمة المناسبة لك — نقدم دعماً متخصصاً في كل مرحلة من رحلتك البحثية.
          </p>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <article
              key={s.title}
              className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)] hover:-translate-y-1 transition"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl mb-4"
                style={{ background: "var(--grad-accent)" }}
              >
                {s.icon}
              </div>
              <h2 className="text-lg font-bold mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-bold px-2.5 py-1 rounded text-primary bg-[oklch(0.94_0.03_245)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
          >
            📝 اطلب الخدمة الآن
          </Link>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
