import { createFileRoute, Link } from "@tanstack/react-router";
import { SERVICES } from "@/lib/services-data";
import { SITE } from "@/lib/site-config";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.brandName} ${SITE.brandTagline} — بحوث ورسائل وتحليل إحصائي` },
      {
        name: "description",
        content:
          "مؤسسة الأصيل: إعداد البحوث، الرسائل الجامعية، مشاريع التخرج، التحليل الإحصائي SPSS و R، وحل مسائل الرياضيات لجميع المراحل.",
      },
      { property: "og:title", content: `${SITE.brandName} ${SITE.brandTagline}` },
      {
        property: "og:description",
        content: "خدمات بحثية وأكاديمية متكاملة لطلاب البكالوريوس والماجستير والدكتوراه.",
      },
    ],
  }),
  component: HomePage,
});

const STATS = [
  { val: "+500", lbl: "بحث منجز" },
  { val: "+200", lbl: "باحث وأكاديمي" },
  { val: "98%", lbl: "رضا العملاء" },
  { val: "24/7", lbl: "دعم مستمر" },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      {/* Hero */}
      <section className="relative text-white text-center py-20 px-5 overflow-hidden" style={{ background: "var(--grad-hero)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 20% 30%, rgba(34,193,195,0.25), transparent 50%)" }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sm mb-6">
            ✨ خبرة أكاديمية موثوقة
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl mx-auto mb-6">
            {SITE.brandName} لخدمات{" "}
            <span className="bg-gradient-to-br from-[oklch(0.74_0.14_195)] to-[oklch(0.85_0.1_190)] bg-clip-text text-transparent">
              البحوث والمشاريع العلمية
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-base md:text-lg text-white/85">
            نقدم خدمات إعداد البحوث، الرسائل الجامعية، التحليل الإحصائي (SPSS, R)، وحل مسائل الرياضيات لجميع الكليات
            ومراحل البكالوريوس والماجستير والدكتوراه.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
            >
              📝 اطلب خدمة ←
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white border border-white/40 hover:bg-white/10 transition"
            >
              📋 استعرض الخدمات
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14">
            {STATS.map((s) => (
              <div key={s.lbl} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-[oklch(0.74_0.14_195)] to-[oklch(0.9_0.08_190)] bg-clip-text text-transparent">
                  {s.val}
                </div>
                <div className="text-xs md:text-sm text-white/75 mt-1">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-16 px-5" style={{ background: "linear-gradient(180deg, var(--background), oklch(0.95 0.02 245))" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">خدماتنا الأكاديمية</h2>
            <p className="text-muted-foreground">حلول متكاملة للباحثين وطلاب الدراسات العليا</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.slice(0, 6).map((s) => (
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
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </article>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services" className="inline-flex items-center gap-2 text-[var(--primary-2)] font-bold hover:underline">
              عرض جميع الخدمات ←
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">عن مؤسسة {SITE.brandName}</h2>
            <p className="text-muted-foreground">مؤسسة متخصصة في تقديم الخدمات البحثية بمعايير جودة عالية</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "🎯", title: "الدقة والاحترافية", desc: "نلتزم بمعايير البحث العلمي الرصين." },
              { icon: "⏱️", title: "الالتزام بالمواعيد", desc: "نسلّم أعمالك في الوقت المحدد." },
              { icon: "🤝", title: "السرية التامة", desc: "نضمن خصوصية بياناتك وأبحاثك." },
            ].map((c) => (
              <div key={c.title} className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl mb-4"
                  style={{ background: "var(--grad-accent)" }}
                >
                  {c.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="rounded-3xl p-10 text-center text-white" style={{ background: "var(--grad-hero)" }}>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">جاهز لبدء مشروعك البحثي؟</h2>
            <p className="text-white/80 mb-6">احصل على عرض سعر خلال ساعات</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)]"
              >
                📝 اطلب خدمة
              </Link>
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white border border-white/40 hover:bg-white/10 transition"
              >
                💬 تواصل عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
