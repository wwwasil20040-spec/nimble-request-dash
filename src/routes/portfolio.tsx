import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

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

const WORKS = [
  { icon: "🎓", category: "رسالة دكتوراه", title: "أثر الذكاء الاصطناعي على الإدارة", field: "إدارة أعمال", year: "2024" },
  { icon: "📊", category: "تحليل إحصائي", title: "تحليل بيانات استبيان لـ 1200 مشارك", field: "علوم اجتماعية", year: "2024" },
  { icon: "📖", category: "بحث محكّم", title: "تطبيقات الطاقة المتجددة في المنطقة", field: "هندسة بيئية", year: "2024" },
  { icon: "🎓", category: "رسالة ماجستير", title: "أساليب التدريس الحديثة", field: "علوم تربوية", year: "2023" },
  { icon: "🧮", category: "حلول رياضية", title: "حل تمارين تفاضل وتكامل متقدم", field: "رياضيات", year: "2023" },
  { icon: "💻", category: "مشروع تخرج", title: "نظام إدارة مكتبة بـ Python و Django", field: "علوم حاسب", year: "2024" },
  { icon: "📝", category: "ترجمة أكاديمية", title: "ترجمة فصول من رسالة دكتوراه طبية", field: "علوم طبية", year: "2024" },
  { icon: "📊", category: "تحليل SPSS", title: "اختبارات T-test و ANOVA لدراسة سريرية", field: "علوم صحية", year: "2023" },
  { icon: "📖", category: "خطة بحث", title: "خطة بحث ماجستير في التسويق الرقمي", field: "تسويق", year: "2024" },
];

function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      <section className="py-12 px-5 text-white" style={{ background: "var(--grad-hero)" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">أعمالنا السابقة</h1>
          <p className="text-white/85 max-w-2xl mx-auto">
            نماذج مختارة من المشاريع التي نفّذناها — لأسباب الخصوصية لا نعرض أسماء العملاء أو محتوى الأعمال الكامل.
          </p>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WORKS.map((w, i) => (
            <article
              key={i}
              className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)] hover:-translate-y-1 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                  style={{ background: "var(--grad-accent)" }}
                >
                  {w.icon}
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded text-primary bg-[oklch(0.94_0.03_245)]">
                  {w.category}
                </span>
              </div>
              <h2 className="text-base font-bold mb-2">{w.title}</h2>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                <span>📚 {w.field}</span>
                <span>📅 {w.year}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">هل تريد عملاً مشابهاً؟</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
          >
            📝 ابدأ مشروعك معنا
          </Link>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
