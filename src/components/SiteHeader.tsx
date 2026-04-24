import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SITE } from "@/lib/site-config";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/services", label: "الخدمات" },
  { to: "/pricing", label: "الأسعار" },
  { to: "/portfolio", label: "أعمالنا" },
  { to: "/faq", label: "الأسئلة الشائعة" },
  { to: "/contact", label: "تواصل" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border" dir="rtl">
      <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between py-4">
        <Link to="/" className="font-extrabold text-lg text-primary flex items-center gap-2">
          📚 {SITE.brandName}{" "}
          <span className="bg-[image:var(--grad-accent)] bg-clip-text text-transparent">{SITE.brandTagline}</span>
        </Link>
        <nav className="hidden md:block">
          <ul className="flex gap-5 list-none">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className="font-semibold text-sm hover:text-[var(--primary-2)] transition"
                  activeProps={{ className: "font-semibold text-sm text-[var(--primary-2)]" }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
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
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-2xl text-primary"
            aria-label="القائمة"
          >
            ☰
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <ul className="flex flex-col p-4 gap-3">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setOpen(false)} className="font-semibold w-full text-right block">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/admin" onClick={() => setOpen(false)} className="font-semibold w-full text-right block">
                🔐 لوحة المشرفين
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8 px-5" dir="rtl">
      <div className="max-w-[1200px] mx-auto text-center">
        <div className="font-extrabold text-primary mb-2">
          📚 {SITE.brandName}{" "}
          <span className="bg-[image:var(--grad-accent)] bg-clip-text text-transparent">{SITE.brandTagline}</span>
        </div>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
          <Link to="/services" className="hover:text-foreground">الخدمات</Link>
          <Link to="/pricing" className="hover:text-foreground">الأسعار</Link>
          <Link to="/portfolio" className="hover:text-foreground">أعمالنا</Link>
          <Link to="/faq" className="hover:text-foreground">الأسئلة الشائعة</Link>
          <Link to="/contact" className="hover:text-foreground">تواصل</Link>
        </div>
        <p className="text-sm text-muted-foreground">© 2025 مؤسسة {SITE.brandName}. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
