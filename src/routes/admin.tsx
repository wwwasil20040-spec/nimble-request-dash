import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "لوحة المشرفين — الأصيل" }],
  }),
});

interface ServiceRequest {
  id: string;
  full_name: string;
  phone: string;
  service_type: string | null;
  details: string;
  file_name: string | null;
  file_path: string | null;
  status: string;
  received_by_email: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new: { label: "جديد", cls: "bg-[oklch(0.74_0.14_195)] text-white" },
  review: { label: "قيد المراجعة", cls: "bg-amber-500 text-white" },
  received: { label: "مُستلم", cls: "bg-violet-500 text-white" },
  done: { label: "مكتمل", cls: "bg-emerald-500 text-white" },
};

function AdminPage() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Login form
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Data
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Init auth
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Check role whenever session changes
  useEffect(() => {
    if (!authReady) return;
    if (!session) {
      setIsAdmin(null);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) console.error("role check error", error);
      setIsAdmin(!!data);
    })();
  }, [session, authReady]);

  // Load requests when admin
  useEffect(() => {
    if (!isAdmin) return;
    loadRequests();
    const channel = supabase
      .channel("service_requests_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () =>
        loadRequests(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function loadRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      console.error(error);
      toast.error("تعذر تحميل الطلبات");
      return;
    }
    setRequests((data ?? []) as ServiceRequest[]);
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب. يحتاج المالك إلى منحك صلاحية المشرف.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "فشل تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
  }

  async function updateStatus(id: string, status: string) {
    const patch =
      status === "received"
        ? {
            status,
            received_by: session?.user.id ?? null,
            received_by_email: session?.user.email ?? null,
          }
        : { status, received_by: null, received_by_email: null };
    const { error } = await supabase.from("service_requests").update(patch).eq("id", id);
    if (error) {
      toast.error("تعذر تحديث الحالة");
      console.error(error);
      return;
    }
    toast.success("تم التحديث");
    loadRequests();
  }

  async function deleteRequest(id: string, file_path: string | null) {
    if (!confirm("حذف هذا الطلب؟")) return;
    if (file_path) {
      await supabase.storage.from("request-files").remove([file_path]);
    }
    const { error } = await supabase.from("service_requests").delete().eq("id", id);
    if (error) {
      toast.error("تعذر الحذف");
      return;
    }
    toast.success("تم الحذف");
    loadRequests();
  }

  async function downloadFile(path: string, name: string) {
    const { data, error } = await supabase.storage.from("request-files").createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("تعذر تنزيل الملف");
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // ----- Render -----

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthShell onBack={() => navigate({ to: "/" })}>
        <h2 className="text-2xl font-extrabold text-center mb-2">🔐 لوحة المشرفين</h2>
        <p className="text-center text-muted-foreground text-sm mb-6">
          {mode === "signin" ? "سجّل دخولك للوصول إلى الطلبات" : "أنشئ حساباً جديداً"}
        </p>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-input rounded-md bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">كلمة المرور</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-input rounded-md bg-background"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] disabled:opacity-60"
          >
            {busy ? "..." : mode === "signin" ? "دخول" : "إنشاء حساب"}
          </button>
        </form>
        <button
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="block mx-auto mt-4 text-sm text-[var(--primary-2)] hover:underline"
        >
          {mode === "signin" ? "ليس لديك حساب؟ أنشئ واحداً" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </AuthShell>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <AuthShell onBack={() => navigate({ to: "/" })}>
        <h2 className="text-xl font-bold text-center mb-3">⛔ لا تملك صلاحية المشرف</h2>
        <p className="text-sm text-center text-muted-foreground mb-2">
          الحساب: <strong>{session.user.email}</strong>
        </p>
        <p className="text-xs text-center text-muted-foreground mb-6">
          إذا كنت أنت مالك المؤسسة: شغّل الأمر التالي مرة واحدة من قاعدة البيانات لإعطاء حسابك صلاحية المشرف:
        </p>
        <pre className="bg-secondary p-3 rounded text-xs overflow-x-auto text-left dir-ltr" dir="ltr">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${session.user.id}', 'admin');`}
        </pre>
        <button
          onClick={handleLogout}
          className="w-full mt-6 px-4 py-2 rounded-lg border border-input font-bold"
        >
          تسجيل الخروج
        </button>
      </AuthShell>
    );
  }

  // Admin dashboard
  const grouped: Record<string, ServiceRequest[]> = {
    new: [],
    review: [],
    received: [],
    done: [],
  };
  for (const r of requests) {
    (grouped[r.status] ?? grouped.new).push(r);
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-[oklch(0.25_0.04_260)] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-[1200px] mx-auto px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-extrabold">🔐 لوحة إدارة الطلبات</h1>
            <p className="text-xs text-white/70">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold"
            >
              ← الموقع
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-sm font-semibold"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {(["new", "review", "received", "done"] as const).map((k) => (
            <div key={k} className="bg-card border border-border rounded-xl p-4">
              <div className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${STATUS_LABELS[k].cls}`}>
                {STATUS_LABELS[k].label}
              </div>
              <div className="text-3xl font-extrabold mt-2">{grouped[k].length}</div>
            </div>
          ))}
        </div>

        {loading && <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>}

        {!loading && requests.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">لا توجد طلبات بعد.</p>
          </div>
        )}

        {(["new", "review", "received", "done"] as const).map((k) =>
          grouped[k].length === 0 ? null : (
            <section key={k} className="mb-8">
              <h2 className="font-extrabold text-primary border-r-4 border-[var(--primary-2)] bg-[oklch(0.95_0.03_245)] px-3 py-2 rounded-md mb-3">
                {STATUS_LABELS[k].label} ({grouped[k].length})
              </h2>
              <div className="space-y-3">
                {grouped[k].map((r) => (
                  <RequestCard
                    key={r.id}
                    r={r}
                    onUpdateStatus={updateStatus}
                    onDelete={deleteRequest}
                    onDownload={downloadFile}
                  />
                ))}
              </div>
            </section>
          ),
        )}
      </main>
    </div>
  );
}

function RequestCard({
  r,
  onUpdateStatus,
  onDelete,
  onDownload,
}: {
  r: ServiceRequest;
  onUpdateStatus: (id: string, s: string) => void;
  onDelete: (id: string, p: string | null) => void;
  onDownload: (p: string, n: string) => void;
}) {
  const status = STATUS_LABELS[r.status] ?? STATUS_LABELS.new;
  return (
    <article className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <strong className="text-primary block text-base">{r.full_name}</strong>
          <p className="text-sm text-muted-foreground">📱 {r.phone}</p>
          {r.service_type && (
            <p className="text-sm text-muted-foreground">📂 {r.service_type}</p>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs ${status.cls}`}>{status.label}</span>
      </div>

      <p className="text-sm mt-3 whitespace-pre-wrap">{r.details}</p>

      {r.file_path && r.file_name && (
        <button
          onClick={() => onDownload(r.file_path!, r.file_name!)}
          className="mt-3 inline-flex items-center gap-2 text-sm bg-[oklch(0.95_0.03_245)] text-[var(--primary-2)] px-3 py-1.5 rounded-md hover:bg-[oklch(0.92_0.04_245)]"
        >
          📎 {r.file_name}
        </button>
      )}

      {r.received_by_email && (
        <p className="text-xs text-muted-foreground mt-2">مُستلم بواسطة: {r.received_by_email}</p>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        {new Date(r.created_at).toLocaleString("ar")}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        <select
          value={r.status}
          onChange={(e) => onUpdateStatus(r.id, e.target.value)}
          className="text-sm border border-input rounded-md px-2 py-1.5 bg-background"
        >
          <option value="new">جديد</option>
          <option value="review">قيد المراجعة</option>
          <option value="received">مُستلم</option>
          <option value="done">مكتمل</option>
        </select>
        <button
          onClick={() => onDelete(r.id, r.file_path)}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md"
        >
          🗑️ حذف
        </button>
      </div>
    </article>
  );
}

function AuthShell({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-background" dir="rtl">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-[var(--shadow-card)] p-6">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground mb-4 hover:text-foreground"
        >
          ← العودة للموقع
        </button>
        {children}
      </div>
    </div>
  );
}
