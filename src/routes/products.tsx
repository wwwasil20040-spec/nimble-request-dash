import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useCart, type Product } from "@/lib/cart-store";
import { SITE } from "@/lib/site-config";
import { toast } from "sonner";

export const Route = createFileRoute("/products")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "المنتجات — مؤسسة الأصيل" },
      { name: "description", content: "تصفح منتجاتنا وأضفها للسلة واطلبها عبر واتساب." },
      { property: "og:title", content: "المنتجات — مؤسسة الأصيل" },
      { property: "og:description", content: "تصفح منتجاتنا واطلبها عبر واتساب." },
    ],
  }),
  component: ProductsPage,
});

const CUSTOMER_KEY = "aseel_customer_v1";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    supabase
      .from("products")
      .select("id,name,description,price,image_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setProducts((data as Product[]) || []);
        setLoading(false);
      });

    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}");
      if (saved.name) setCustomerName(saved.name);
      if (saved.phone) setCustomerPhone(saved.phone);
    } catch {}
  }, []);

  function sendOrder() {
    if (cart.items.length === 0) return;
    const name = customerName.trim();
    const phone = customerPhone.trim();
    if (name.length < 2) {
      toast.error("الرجاء إدخال الاسم");
      return;
    }
    if (!/^[+\d][\d\s-]{6,}$/.test(phone)) {
      toast.error("الرجاء إدخال رقم هاتف صحيح");
      return;
    }
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, phone }));

    const lines = cart.items.map(
      (i, n) => `${n + 1}- ${i.product.name} × ${i.qty} = ${(i.qty * Number(i.product.price)).toFixed(2)}`,
    );
    const msg =
      `طلب جديد من الموقع:\n\n` +
      `👤 الاسم: ${name}\n` +
      `📱 الهاتف: ${phone}\n\n` +
      `🛒 الطلب:\n${lines.join("\n")}\n\n` +
      `الإجمالي: ${cart.total.toFixed(2)}`;
    window.open(`${SITE.whatsappUrl}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />

      <section className="py-12 px-5" style={{ background: "var(--grad-hero)" }}>
        <div className="max-w-[1200px] mx-auto text-center text-white">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">المنتجات</h1>
          <p className="text-white/85">اختر ما يناسبك وأرسل طلبك عبر واتساب</p>
        </div>
      </section>

      <section className="py-12 px-5">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <p className="text-center text-muted-foreground">جاري التحميل...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">لا توجد منتجات متاحة حالياً.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <article
                  key={p.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col"
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-48 object-cover" loading="lazy" />
                  ) : (
                    <div
                      className="w-full h-48 flex items-center justify-center text-5xl"
                      style={{ background: "var(--grad-hero)" }}
                    >
                      📦
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                    {p.description && <p className="text-sm text-muted-foreground mb-3 flex-1">{p.description}</p>}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-extrabold text-xl text-[var(--primary-2)]">
                        {Number(p.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          cart.add(p, 1);
                          toast.success("أضيف إلى السلة");
                        }}
                        className="px-4 py-2 rounded-lg text-white font-bold text-sm bg-[image:var(--grad-accent)]"
                      >
                        + أضف
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {cart.count > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 left-5 z-40 px-5 py-3 rounded-full text-white font-bold shadow-[var(--shadow-glow)] bg-[image:var(--grad-accent)] flex items-center gap-2"
        >
          🛒 السلة ({cart.count}) — {cart.total.toFixed(2)}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex" dir="rtl">
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
          <div className="w-full max-w-md bg-background h-full overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold">سلة المشتريات</h2>
              <button onClick={() => setOpen(false)} className="text-2xl">×</button>
            </div>
            {cart.items.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">السلة فارغة</p>
            ) : (
              <>
                <div className="space-y-3 mb-5">
                  {cart.items.map((i) => (
                    <div key={i.product.id} className="border border-border rounded-xl p-3">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">{i.product.name}</span>
                        <button
                          onClick={() => cart.remove(i.product.id)}
                          className="text-destructive text-sm"
                        >
                          حذف
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => cart.setQty(i.product.id, i.qty - 1)}
                            className="w-8 h-8 rounded-lg border border-border font-bold"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={i.qty}
                            onChange={(e) => cart.setQty(i.product.id, Number(e.target.value) || 0)}
                            className="w-14 text-center px-2 py-1 rounded-lg border border-border bg-background"
                          />
                          <button
                            onClick={() => cart.setQty(i.product.id, i.qty + 1)}
                            className="w-8 h-8 rounded-lg border border-border font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-[var(--primary-2)]">
                          {(i.qty * Number(i.product.price)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex justify-between font-extrabold text-lg mb-4">
                    <span>الإجمالي:</span>
                    <span className="text-[var(--primary-2)]">{cart.total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <h3 className="font-bold text-sm">بيانات العميل</h3>
                    <label className="block">
                      <span className="block text-xs font-semibold mb-1">الاسم *</span>
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="الاسم الكامل"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-semibold mb-1">رقم الهاتف *</span>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="07XXXXXXXX"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-right"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={sendOrder}
                  className="w-full px-4 py-3 rounded-lg font-bold text-white bg-[#25d366] mb-2"
                >
                  💬 إرسال الطلب عبر واتساب
                </button>
                <button
                  onClick={() => cart.clear()}
                  className="w-full px-4 py-2 rounded-lg font-bold border border-border"
                >
                  تفريغ السلة
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
