import { SITE } from "@/lib/site-config";

export function FloatingWhatsApp() {
  return (
    <a
      href={SITE.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center text-2xl z-40 shadow-lg hover:scale-110 transition"
      title="WhatsApp"
      aria-label="تواصل عبر واتساب"
    >
      💬
    </a>
  );
}
