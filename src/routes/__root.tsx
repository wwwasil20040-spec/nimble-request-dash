import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import appCss from "../styles.css?url";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">الرابط الذي طلبته غير موجود.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "الأصيل لخدمات البحوث والمشاريع العلمية" },
      {
        name: "description",
        content:
          "مؤسسة الأصيل: إعداد البحوث، الرسائل الجامعية، مشاريع التخرج، التحليل الإحصائي، وحل مسائل الرياضة.",
      },
      { property: "og:title", content: "الأصيل لخدمات البحوث والمشاريع العلمية" },
      {
        property: "og:description",
        content: "خدمات بحثية وأكاديمية متكاملة لطلاب البكالوريوس والماجستير والدكتوراه.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "الأصيل لخدمات البحوث والمشاريع العلمية" },
      { name: "description", content: "Order Flow Navigator is a web application for administrators to manage service requests." },
      { property: "og:description", content: "Order Flow Navigator is a web application for administrators to manage service requests." },
      { name: "twitter:description", content: "Order Flow Navigator is a web application for administrators to manage service requests." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/20855644-638c-4540-a54b-32b58cb1128c/id-preview-9cbbc5b1--efcc2920-72b8-4ae4-b679-d48ad09e53c9.lovable.app-1776791289648.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/20855644-638c-4540-a54b-32b58cb1128c/id-preview-9cbbc5b1--efcc2920-72b8-4ae4-b679-d48ad09e53c9.lovable.app-1776791289648.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  );
}
