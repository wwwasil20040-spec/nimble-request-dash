import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SITE } from "@/lib/site-config";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `الأسئلة الشائعة — ${SITE.brandName}` },
      {
        name: "description",
        content:
          "أجوبة على أكثر الأسئلة شيوعاً حول خدمات البحوث، الأسعار، التسليم، التعديلات، والسرية في مؤسسة الأصيل للبحوث العلمية.",
      },
      { property: "og:title", content: `الأسئلة الشائعة — ${SITE.brandName}` },
      { property: "og:description", content: "كل ما تريد معرفته عن خدماتنا البحثية." },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "كيف أحصل على عرض سعر؟",
    a: "أرسل تفاصيل طلبك عبر نموذج التواصل أو واتساب، وسنرد عليك بعرض سعر مجاني خلال ساعات قليلة.",
  },
  {
    q: "ما هي مدة تنفيذ البحث؟",
    a: "تختلف المدة حسب نوع وحجم العمل: البحوث القصيرة من 3-7 أيام، الرسائل الجامعية من 3 أسابيع إلى عدة أشهر. نلتزم بالموعد المحدد دائماً.",
  },
  {
    q: "هل تضمنون السرية التامة؟",
    a: "نعم. جميع بياناتك وأبحاثك سرية تماماً ولا نشاركها مع أي طرف ثالث، ولا نعيد استخدامها في أعمال أخرى.",
  },
  {
    q: "هل توفرون تعديلات بعد التسليم؟",
    a: "نعم، نوفر تعديلات مجانية ضمن نطاق العمل المتفق عليه. التعديلات الكبيرة الخارجة عن النطاق قد تكلف رسوماً إضافية.",
  },
  {
    q: "ما طرق الدفع المتاحة؟",
    a: "ندعم عدة طرق دفع. يتم تأكيد طريقة الدفع المناسبة عند الاتفاق على الطلب. عادة يتم دفع جزء مقدم وباقي المبلغ عند التسليم.",
  },
  {
    q: "هل تتعاملون مع جميع التخصصات؟",
    a: "نتعامل مع غالبية التخصصات (إدارة، اقتصاد، تربية، علوم، هندسة، طب، شريعة...). إذا كان تخصصك دقيقاً، أرسل لنا تفاصيله ونؤكد قدرتنا على تنفيذه.",
  },
  {
    q: "هل البحوث أصلية وخالية من النسخ؟",
    a: "نعم. جميع أعمالنا أصلية ومكتوبة من الصفر، ونمررها على برامج كشف الانتحال لضمان نسبة تشابه منخفضة.",
  },
  {
    q: "ماذا لو لم يعجبني العمل؟",
    a: "نعمل معك على التعديلات حتى تحصل على النتيجة المرضية ضمن نطاق الاتفاق الأصلي.",
  },
  {
    q: "هل تساعدون في المناقشة؟",
    a: "نعم، نوفر دعماً للتحضير للمناقشة عبر شرح محتوى الرسالة والإجابات المقترحة على الأسئلة المتوقعة.",
  },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      <section className="py-12 px-5 text-white" style={{ background: "var(--grad-hero)" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">الأسئلة الشائعة</h1>
          <p className="text-white/85 max-w-2xl mx-auto">إجابات على أكثر الأسئلة التي يطرحها عملاؤنا.</p>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-[850px] mx-auto space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-right hover:bg-secondary/30 transition"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-primary">{f.q}</span>
                  <span className={`text-[var(--primary-2)] text-xl transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    ⌄
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="max-w-[850px] mx-auto mt-10 bg-card border border-border rounded-2xl p-6 text-center">
          <p className="text-muted-foreground mb-4">لم تجد إجابة سؤالك؟</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)]"
            >
              📝 تواصل معنا
            </Link>
            <a
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold border border-border"
            >
              💬 واتساب
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
