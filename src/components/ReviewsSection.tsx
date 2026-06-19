import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Review = { id: string; image_url: string; caption: string | null };

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id,image_url,caption")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) || []));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 px-5" dir="rtl">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">آراء زبائننا</h2>
          <p className="text-muted-foreground">شهادات حقيقية من عملاء وثقوا بنا</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reviews.map((r) => (
            <button
              key={r.id}
              onClick={() => setLightbox(r.image_url)}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:-translate-y-1 transition"
            >
              <img
                src={r.image_url}
                alt={r.caption || "رأي زبون"}
                className="w-full h-56 object-cover"
                loading="lazy"
              />
              {r.caption && <p className="p-3 text-sm text-right">{r.caption}</p>}
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-5 cursor-zoom-out"
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </section>
  );
}
