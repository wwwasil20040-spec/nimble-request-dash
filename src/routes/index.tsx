import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SERVICES } from "@/lib/services-data";
import { RequestForm } from "@/components/RequestForm";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const STATS = [
  { val: "+500", lbl: "بحث منجز" },
  { val: "+200", lbl: "باحث وأكاديمي" },
  { val: "98%", lbl: "رضا العملاء" },
  { val: "24/7", lbl: "دعم مستمر" },
];

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between py-4">
          <button onClick={() => scrollTo("home")} className="font-extrabold text-lg text-primary flex items-center gap-2">
            📚 الأصيل{" "}
            <span className="bg-[image:var(--grad-accent)] bg-clip-text text-transparent">للبحوث العلمية</span>
          </button>
          <nav className="hidden md:block">
            <ul className="flex gap-6 list-none">
              <li><button onClick={() => scrollTo("home")} className="font-semibold hover:text-[var(--primary-2)] transition">الرئيسية</button></li>
              <li><button onClick={() => scrollTo("services")} className="font-semibold hover:text-[var(--primary-2)] transition">الخدمات</button></li>
              <li><button onClick={() => scrollTo("about")} className="font-semibold hover:text-[var(--primary-2)] transition">عن المؤسسة</button></li>
              <li><button onClick={() => scrollTo("contact")} className="font-semibold hover:text-[var(--primary-2)] transition">تواصل</button></li>
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-primary font-bold text-sm hover:bg-secondary transition"
            >
              🔐 المشرفون
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden text-2xl text-primary"
              aria-label="القائمة"
            >
              ☰
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <ul className="flex flex-col p-4 gap-3">
              <li><button onClick={() => scrollTo("home")} className="font-semibold w-full text-right">الرئيسية</button></li>
              <li><button onClick={() => scrollTo("services")} className="font-semibold w-full text-right">الخدمات</button></li>
              <li><button onClick={() => scrollTo("about")} className="font-semibold w-full text-right">عن المؤسسة</button></li>
              <li><button onClick={() => scrollTo("contact")} className="font-semibold w-full text-right">تواصل</button></li>
              <li><Link to="/admin" className="font-semibold w-full text-right block">🔐 لوحة المشرفين</Link></li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative text-white text-center py-20 px-5 overflow-hidden"
        style={{ background: "var(--grad-hero)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(34,193,195,0.25), transparent 50%)",
          }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sm mb-6">
            ✨ خبرة أكاديمية موثوقة
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl mx-auto mb-6">
            الأصيل لخدمات{" "}
            <span className="bg-gradient-to-br from-[oklch(0.74_0.14_195)] to-[oklch(0.85_0.1_190)] bg-clip-text text-transparent">
              البحوث والمشاريع العلمية
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-base md:text-lg text-white/85">
            نقدم خدمات إعداد البحوث، الرسائل الجامعية، التحليل الإحصائي (SPSS, R)، وحل مسائل الرياضيات
            لجميع الكليات ومراحل البكالوريوس والماجستير والدكتوراه.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollTo("contact")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
            >
              📝 اطلب خدمة ←
            </button>
            <button
              type="button"
              onClick={() => scrollTo("services")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white border border-white/40 hover:bg-white/10 transition"
            >
              📋 استعرض الخدمات
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14">
            {STATS.map((s) => (
              <div
                key={s.lbl}
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4"
              >
                <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-[oklch(0.74_0.14_195)] to-[oklch(0.9_0.08_190)] bg-clip-text text-transparent">
                  {s.val}
                </div>
                <div className="text-xs md:text-sm text-white/75 mt-1">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="py-16 px-5"
        style={{ background: "linear-gradient(180deg, var(--background), oklch(0.95 0.02 245))" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">خدماتنا الأكاديمية</h2>
            <p className="text-muted-foreground">حلول متكاملة للباحثين وطلاب الدراسات العليا</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
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
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 px-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">عن مؤسسة الأصيل</h2>
            <p className="text-muted-foreground">
              مؤسسة متخصصة في تقديم الخدمات البحثية بمعايير جودة عالية
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "🎯", title: "الدقة والاحترافية", desc: "نلتزم بمعايير البحث العلمي الرصين." },
              { icon: "⏱️", title: "الالتزام بالمواعيد", desc: "نسلّم أعمالك في الوقت المحدد." },
              { icon: "🤝", title: "السرية التامة", desc: "نضمن خصوصية بياناتك وأبحاثك." },
            ].map((c) => (
              <div
                key={c.title}
                className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]"
              >
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
          <div
            className="rounded-3xl p-10 text-center text-white"
            style={{ background: "var(--grad-hero)" }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">جاهز لبدء مشروعك البحثي؟</h2>
            <p className="text-white/80 mb-6">احصل على عرض سعر خلال ساعات</p>
            <a
              href="https://wa.me/218919769019"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 transition"
            >
              💬 تواصل عبر واتساب
            </a>
          </div>
        </div>
      </section>

      {/* Contact / Request */}
      <section
        id="contact"
        className="py-16 px-5"
        style={{ background: "linear-gradient(180deg, var(--background), oklch(0.95 0.02 245))" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">طلب خدمة</h2>
            <p className="text-muted-foreground">املأ النموذج وسنقوم بالرد عليك في أقرب وقت</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            <div>
              {[
                { icon: "📱", title: "الهاتف / واتساب", val: "0919769019" },
                { icon: "💬", title: "WhatsApp", val: "محادثة مباشرة", href: "https://wa.me/218919769019" },
                { icon: "🕐", title: "ساعات العمل", val: "يومياً 9 صباحاً - 11 مساءً" },
              ].map((c) => {
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-5">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="font-extrabold text-primary mb-2">
            📚 الأصيل{" "}
            <span className="bg-[image:var(--grad-accent)] bg-clip-text text-transparent">للبحوث العلمية</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 مؤسسة الأصيل. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/218919769019"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 left-5 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center text-2xl z-40 shadow-lg hover:scale-110 transition"
        title="WhatsApp"
        aria-label="WhatsApp"
      >
        💬
      </a>
    </div>
  );
}
