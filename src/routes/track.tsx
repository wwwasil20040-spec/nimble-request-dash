import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  component: TrackPage,
  head: () => ({
    meta: [
      { title: "تتبع طلبك — معرفة حالة الطلب" },
      { name: "description", content: "تابع حالة طلبك بإدخال رقم التتبع ورقم جوالك." },
    ],
  }),
});

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "جديد", color: "bg-blue-100 text-blue-800" },
  in_progress: { label: "قيد التنفيذ", color: "bg-amber-100 text-amber-800" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800" },
  cancelled: { label: "ملغى", color: "bg-red-100 text-red-800" },
};

type Result = {
  tracking_code: string;
  full_name: string;
  service_type: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function TrackPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [searched, setSearched] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    if (!code || !phone) {
      toast.error("الرجاء إدخال رمز التتبع ورقم الجوال");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc("track_request", {
      _code: code,
      _phone: phone,
    });
    setLoading(false);
    setSearched(true);
    if (error) {
      console.error(error);
      toast.error("تعذر البحث، حاول لاحقاً");
      return;
    }
    setResult((data && data[0]) || null);
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-primary">📦 تتبع طلبك</h1>
        <p className="text-muted-foreground mb-8">
          أدخل رقم التتبع الذي حصلت عليه عند الإرسال + آخر 4 أرقام من جوالك.
        </p>

        <form
          onSubmit={onSubmit}
          className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)] mb-6"
        >
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-sm">رمز التتبع *</label>
            <input
              name="code"
              required
              placeholder="مثل ABC-1234"
              className="w-full px-3 py-2.5 border border-input rounded-md bg-secondary/30 focus:outline-none focus:border-[var(--primary-2)] uppercase"
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-sm">رقم الجوال *</label>
            <input
              name="phone"
              required
              placeholder="نفس الرقم المسجل في الطلب"
              className="w-full px-3 py-2.5 border border-input rounded-md bg-secondary/30 focus:outline-none focus:border-[var(--primary-2)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] hover:opacity-95 transition disabled:opacity-60"
          >
            {loading ? "جاري البحث..." : "🔍 بحث"}
          </button>
        </form>

        {searched && !result && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-6 text-center">
            لم نعثر على طلب بهذه البيانات. تأكد من الرمز ورقم الجوال.
          </div>
        )}

        {result && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="text-xs text-muted-foreground">رمز التتبع</div>
                <div className="font-mono font-bold text-lg">{result.tracking_code}</div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  STATUS_LABELS[result.status]?.color || "bg-secondary text-foreground"
                }`}
              >
                {STATUS_LABELS[result.status]?.label || result.status}
              </span>
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div>
                <span className="text-muted-foreground">الاسم: </span>
                <span className="font-semibold">{result.full_name}</span>
              </div>
              {result.service_type && (
                <div>
                  <span className="text-muted-foreground">نوع الخدمة: </span>
                  <span className="font-semibold">{result.service_type}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">تاريخ الإرسال: </span>
                <span>{new Date(result.created_at).toLocaleString("ar-EG")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">آخر تحديث: </span>
                <span>{new Date(result.updated_at).toLocaleString("ar-EG")}</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
