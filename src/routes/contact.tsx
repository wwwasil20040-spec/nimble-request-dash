import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";
import { RequestForm } from "@/components/RequestForm";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `تواصل معنا — ${SITE.brandName}` },
      {
        name: "description",
        content:
          "تواصل مع مؤسسة الأصيل للبحوث العلمية: رقم الهاتف، واتساب، ساعات العمل، أو أرسل طلبك مباشرة عبر النموذج.",
      },
      { property: "og:title", content: `تواصل معنا — ${SITE.brandName}` },
      { property: "og:description", content: "نسعد بخدمتك — أرسل طلبك أو تواصل معنا مباشرة." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const cards = [
    { icon: "📱", title: "الهاتف / واتساب", val: SITE.phone },
    { icon: "💬", title: "WhatsApp", val: "محادثة مباشرة", href: SITE.whatsappUrl },
    { icon: "🕐", title: "ساعات العمل", val: SITE.workingHours },
  ];
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      <section className="py-12 px-5 text-white" style={{ background: "var(--grad-hero)" }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">تواصل معنا</h1>
          <p className="text-white/85 max-w-2xl mx-auto">املأ النموذج وسنرد عليك في أقرب وقت — أو راسلنا مباشرة عبر واتساب.</p>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          <div>
            {cards.map((c) => {
              const Inner = (
                <>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg shrink-0"
                    style={{ background: "var(--grad-accent)" }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <strong className="block text-primary">{c.title}</strong>
                    <span className="text-sm text-muted-foreground">{c.val}</span>
                  </div>
                </>
              );
              return c.href ? (
                <a
                  key={c.title}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 mb-4 hover:shadow-md transition"
                >
                  {Inner}
                </a>
              ) : (
                <div
                  key={c.title}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 mb-4"
                >
                  {Inner}
                </div>
              );
            })}
          </div>
          <RequestForm />
        </div>
      </section>

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
