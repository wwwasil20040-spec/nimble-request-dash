import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: `الأسعار — ${SITE.brandName} للبحوث العلمية` },
      {
        name: "description",
        content:
          "أسعار خدمات البحوث والتحليل الإحصائي والرسائل الجامعية: سعر مخصص لكل طلب حسب التخصص وحجم العمل والمدة الزمنية.",
      },
      { property: "og:title", content: `الأسعار — ${SITE.brandName}` },
      {
        property: "og:description",
        content: "أسعار حسب الطلب — احصل على عرض سعر دقيق خلال ساعات.",
      },
    ],
  }),
  component: PricingPage,
});

const FACTORS = [
  { icon: "📚", title: "نوع الخدمة", desc: "بحث، رسالة، تحليل إحصائي، ترجمة..." },
  { icon: "📏", title: "حجم العمل", desc: "عدد الصفحات / الفصول / الحجم الكلي للبيانات" },
  { icon: "⏱️", title: "المدة الزمنية", desc: "الطلبات المستعجلة لها سعر مختلف" },
  { icon: "🎓", title: "المرحلة العلمية", desc: "بكالوريوس / ماجستير / دكتوراه" },
  { icon: "🔬", title: "التخصص", desc: "بعض التخصصات تتطلب جهداً متخصصاً أعلى" },
  { icon: "📑", title: "متطلبات إضافية", desc: "مراجع نادرة، تدقيق، تنسيق خاص..." },
];

const STEPS = [
  { n: "1", title: "أرسل تفاصيل طلبك", desc: "املأ النموذج أو راسلنا عبر واتساب" },
  { n: "2", title: "نراجع ونحدد السعر", desc: "نرسل لك عرض سعر دقيق خلال ساعات" },
  { n: "3", title: "اعتماد ودفع جزئي", desc: "نبدأ العمل بعد الموافقة" },
  { n: "4", title: "تسليم العمل", desc: "تسلم العمل في الموعد المحدد + تعديلات مجانية" },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      <section className="py-12 px-5 text-white" style={{ background: "var(--grad-hero)" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">الأسعار</h1>
          <p className="text-white/85 max-w-2xl mx-auto">
            نقدم سعراً مخصصاً لكل طلب — لأن كل عمل بحثي مختلف. أرسل تفاصيل طلبك واحصل على عرض سعر مجاني خلال ساعات.
          </p>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">العوامل التي تحدد السعر</h2>
            <p className="text-muted-foreground">نحرص على الشفافية الكاملة في تسعير خدماتنا</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FACTORS.map((f) => (
              <div
                key={f.title}
                className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-card)]"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xl mb-3"
                  style={{ background: "var(--grad-accent)" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-5 bg-[oklch(0.96_0.02_245)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">كيف نعمل؟</h2>
            <p className="text-muted-foreground">خطوات بسيطة من الطلب إلى التسليم</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-card)] text-center"
              >
                <div
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white text-xl font-extrabold mb-3"
                  style={{ background: "var(--grad-accent)" }}
                >
                  {s.n}
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-5">
        <div className="max-w-[900px] mx-auto rounded-3xl p-10 text-center text-white" style={{ background: "var(--grad-hero)" }}>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">احصل على عرض سعر مجاني الآن</h2>
          <p className="text-white/80 mb-6">ردّ خلال ساعات — بدون أي التزام</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
            >
              📝 اطلب عرض سعر
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
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
