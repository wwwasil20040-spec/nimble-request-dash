import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "لوحة المشرفين — الأصيل" }] }),
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

interface RequestNote {
  id: string;
  request_id: string;
  author_email: string;
  note: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  request_id: string;
  actor_email: string | null;
  action: string;
  from_value: string | null;
  to_value: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new: { label: "جديد", cls: "bg-[oklch(0.74_0.14_195)] text-white" },
  review: { label: "قيد المراجعة", cls: "bg-amber-500 text-white" },
  received: { label: "مُستلم", cls: "bg-violet-500 text-white" },
  done: { label: "مكتمل", cls: "bg-emerald-500 text-white" },
};

const STATUS_KEYS = ["new", "review", "received", "done"] as const;
type StatusKey = (typeof STATUS_KEYS)[number];

function AdminPage() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusKey>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail panel
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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
      if (error) console.error(error);
      setIsAdmin(!!data);
    })();
  }, [session, authReady]);

  useEffect(() => {
    if (!isAdmin) return;
    loadRequests();
    const channel = supabase
      .channel("service_requests_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => loadRequests())
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب. يحتاج المالك إلى منحك صلاحية المشرف.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تسجيل الدخول";
      toast.error(msg);
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
        ? { status, received_by: session?.user.id ?? null, received_by_email: session?.user.email ?? null }
        : { status, received_by: null, received_by_email: null };
    const { error } = await supabase.from("service_requests").update(patch).eq("id", id);
    if (error) {
      toast.error("تعذر تحديث الحالة");
      return;
    }
    toast.success("تم التحديث");
    loadRequests();
  }

  async function deleteRequest(id: string, file_path: string | null) {
    if (!confirm("حذف هذا الطلب؟")) return;
    if (file_path) await supabase.storage.from("request-files").remove([file_path]);
    const { error } = await supabase.from("service_requests").delete().eq("id", id);
    if (error) {
      toast.error("تعذر الحذف");
      return;
    }
    toast.success("تم الحذف");
    if (selectedId === id) setSelectedId(null);
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

  // Filtering
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (dateFrom && new Date(r.created_at) < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(r.created_at) > end) return false;
      }
      if (q) {
        const blob = `${r.full_name} ${r.phone} ${r.service_type ?? ""} ${r.details}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [requests, search, statusFilter, dateFrom, dateTo]);

  // Stats — last 30 days + by service type
  const stats = useMemo(() => {
    const counts: Record<string, number> = { new: 0, review: 0, received: 0, done: 0 };
    const byDay: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 29);
    for (let i = 0; i < 30; i++) {
      const d = new Date(cutoff);
      d.setDate(cutoff.getDate() + i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    for (const r of requests) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
      const day = r.created_at.slice(0, 10);
      if (day in byDay) byDay[day]++;
      const t = (r.service_type ?? "غير محدد").trim() || "غير محدد";
      byType[t] = (byType[t] ?? 0) + 1;
    }
    const days = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
    const maxDay = Math.max(1, ...days.map(([, v]) => v));
    const types = Object.entries(byType).sort(([, a], [, b]) => b - a).slice(0, 6);
    const maxType = Math.max(1, ...types.map(([, v]) => v));
    const last7 = days.slice(-7).reduce((a, [, v]) => a + v, 0);
    return { counts, days, maxDay, types, maxType, total: requests.length, last7 };
  }, [requests]);

  function exportCsv() {
    const rows = [
      ["id", "name", "phone", "service_type", "details", "status", "received_by", "created_at", "file_name"],
      ...filtered.map((r) => [
        r.id,
        r.full_name,
        r.phone,
        r.service_type ?? "",
        r.details.replace(/\r?\n/g, " "),
        r.status,
        r.received_by_email ?? "",
        r.created_at,
        r.file_name ?? "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`تم تصدير ${filtered.length} طلب`);
  }

  // ----- Render -----
  if (!authReady) return <CenterMsg msg="جاري التحميل..." />;

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

  if (isAdmin === null) return <CenterMsg msg="جاري التحقق من الصلاحيات..." />;

  if (!isAdmin) {
    return (
      <AuthShell onBack={() => navigate({ to: "/" })}>
        <h2 className="text-xl font-bold text-center mb-3">⛔ لا تملك صلاحية المشرف</h2>
        <p className="text-sm text-center text-muted-foreground mb-2">
          الحساب: <strong>{session.user.email}</strong>
        </p>
        <p className="text-xs text-center text-muted-foreground mb-6">
          إذا كنت أنت مالك المؤسسة شغّل الأمر التالي مرة واحدة من قاعدة البيانات:
        </p>
        <pre className="bg-secondary p-3 rounded text-xs overflow-x-auto text-left" dir="ltr">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${session.user.id}', 'admin');`}
        </pre>
        <button onClick={handleLogout} className="w-full mt-6 px-4 py-2 rounded-lg border border-input font-bold">
          تسجيل الخروج
        </button>
      </AuthShell>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-[oklch(0.25_0.04_260)] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-[1400px] mx-auto px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-extrabold">🔐 لوحة إدارة الطلبات</h1>
            <p className="text-xs text-white/70">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold">
              ← الموقع
            </Link>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-sm font-semibold">
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-5 py-6 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="إجمالي الطلبات" value={stats.total} />
          <StatCard label="آخر 7 أيام" value={stats.last7} />
          {STATUS_KEYS.map((k) => (
            <StatCard key={k} label={STATUS_LABELS[k].label} value={stats.counts[k] ?? 0} cls={STATUS_LABELS[k].cls} />
          )).slice(0, 2)}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="الطلبات في آخر 30 يوم">
            <div className="flex items-end gap-1 h-32">
              {stats.days.map(([day, v]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${v}`}>
                  <div
                    className="w-full bg-[image:var(--grad-accent)] rounded-t"
                    style={{ height: `${(v / stats.maxDay) * 100}%`, minHeight: v > 0 ? 2 : 0 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{stats.days[0]?.[0]?.slice(5)}</span>
              <span>{stats.days[stats.days.length - 1]?.[0]?.slice(5)}</span>
            </div>
          </ChartCard>

          <ChartCard title="أكثر الخدمات طلباً">
            {stats.types.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد بيانات بعد</p>
            ) : (
              <div className="space-y-2">
                {stats.types.map(([name, v]) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">{name}</span>
                      <span className="text-muted-foreground">{v}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded">
                      <div
                        className="h-full bg-[image:var(--grad-accent)] rounded"
                        style={{ width: `${(v / stats.maxType) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </section>

        {/* Filters */}
        <section className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold mb-1">بحث</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="اسم، هاتف، نوع، تفاصيل..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">الحالة</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">الكل</option>
                {STATUS_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {STATUS_LABELS[k].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">من تاريخ</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">إلى تاريخ</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <p className="text-xs text-muted-foreground">{filtered.length} نتيجة</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-xs px-3 py-1.5 border border-input rounded-md hover:bg-secondary"
              >
                إعادة ضبط
              </button>
              <button
                onClick={exportCsv}
                disabled={filtered.length === 0}
                className="text-xs px-3 py-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                📤 تصدير CSV
              </button>
            </div>
          </div>
        </section>

        {/* Requests list */}
        {loading && <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">لا توجد طلبات مطابقة.</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              r={r}
              onUpdateStatus={updateStatus}
              onDelete={deleteRequest}
              onDownload={downloadFile}
              onOpen={() => setSelectedId(r.id)}
            />
          ))}
        </div>
      </main>

      {selectedId && (
        <DetailDrawer
          requestId={selectedId}
          session={session}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, cls }: { label: string; value: number; cls?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {cls ? (
        <div className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${cls}`}>{label}</div>
      ) : (
        <div className="text-xs text-muted-foreground">{label}</div>
      )}
      <div className="text-3xl font-extrabold mt-2">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <h3 className="font-bold mb-3 text-sm">{title}</h3>
      {children}
    </div>
  );
}

function RequestCard({
  r,
  onUpdateStatus,
  onDelete,
  onDownload,
  onOpen,
}: {
  r: ServiceRequest;
  onUpdateStatus: (id: string, s: string) => void;
  onDelete: (id: string, p: string | null) => void;
  onDownload: (p: string, n: string) => void;
  onOpen: () => void;
}) {
  const status = STATUS_LABELS[r.status] ?? STATUS_LABELS.new;
  return (
    <article className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <strong className="text-primary block text-base">{r.full_name}</strong>
          <p className="text-sm text-muted-foreground">📱 {r.phone}</p>
          {r.service_type && <p className="text-sm text-muted-foreground">📂 {r.service_type}</p>}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs ${status.cls}`}>{status.label}</span>
      </div>

      <p className="text-sm mt-3 whitespace-pre-wrap line-clamp-3">{r.details}</p>

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

      <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString("ar")}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        <select
          value={r.status}
          onChange={(e) => onUpdateStatus(r.id, e.target.value)}
          className="text-sm border border-input rounded-md px-2 py-1.5 bg-background"
        >
          {STATUS_KEYS.map((k) => (
            <option key={k} value={k}>
              {STATUS_LABELS[k].label}
            </option>
          ))}
        </select>
        <button
          onClick={onOpen}
          className="text-sm bg-[var(--primary-2)] text-white px-3 py-1.5 rounded-md hover:opacity-90"
        >
          📝 ملاحظات وسجل
        </button>
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

function DetailDrawer({
  requestId,
  session,
  onClose,
}: {
  requestId: string;
  session: Session;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<RequestNote[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [n, l] = await Promise.all([
      supabase.from("request_notes").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
      supabase.from("request_activity_log").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
    ]);
    setLoading(false);
    if (n.error || l.error) {
      toast.error("تعذر تحميل التفاصيل");
      return;
    }
    setNotes((n.data ?? []) as RequestNote[]);
    setLogs((l.data ?? []) as ActivityLog[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  async function addNote() {
    const value = text.trim();
    if (!value) return;
    setSubmitting(true);
    const { error } = await supabase.from("request_notes").insert({
      request_id: requestId,
      author_id: session.user.id,
      author_email: session.user.email ?? "unknown",
      note: value,
    });
    if (!error) {
      await supabase.from("request_activity_log").insert({
        request_id: requestId,
        actor_id: session.user.id,
        actor_email: session.user.email ?? null,
        action: "note_added",
        from_value: null,
        to_value: value.slice(0, 100),
      });
    }
    setSubmitting(false);
    if (error) {
      toast.error("تعذر إضافة الملاحظة");
      return;
    }
    setText("");
    toast.success("تمت إضافة الملاحظة");
    load();
  }

  async function deleteNote(id: string) {
    if (!confirm("حذف الملاحظة؟")) return;
    const { error } = await supabase.from("request_notes").delete().eq("id", id);
    if (error) {
      toast.error("تعذر الحذف");
      return;
    }
    load();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div
        className="absolute top-0 bottom-0 left-0 w-full sm:w-[480px] bg-background shadow-2xl flex flex-col"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-extrabold">📝 الملاحظات والسجل</h3>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h4 className="font-bold mb-2 text-sm">ملاحظة جديدة</h4>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={5000}
              placeholder="اكتب ملاحظتك الداخلية..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-y"
            />
            <button
              onClick={addNote}
              disabled={submitting || !text.trim()}
              className="mt-2 px-4 py-2 rounded-md font-bold text-white bg-[image:var(--grad-accent)] shadow-[var(--shadow-glow)] disabled:opacity-60 text-sm"
            >
              {submitting ? "..." : "إضافة"}
            </button>
          </section>

          <section>
            <h4 className="font-bold mb-2 text-sm">الملاحظات ({notes.length})</h4>
            {loading ? (
              <p className="text-xs text-muted-foreground">جاري التحميل...</p>
            ) : notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد ملاحظات.</p>
            ) : (
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="bg-card border border-border rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{n.note}</p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                      <span>{n.author_email} • {new Date(n.created_at).toLocaleString("ar")}</span>
                      <button onClick={() => deleteNote(n.id)} className="text-red-500 hover:underline">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h4 className="font-bold mb-2 text-sm">سجل التغييرات ({logs.length})</h4>
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد عمليات مسجّلة بعد.</p>
            ) : (
              <ol className="space-y-2 border-r-2 border-border pr-3">
                {logs.map((l) => (
                  <li key={l.id} className="text-xs">
                    <p className="font-semibold">
                      {l.action === "status_change"
                        ? `تغيير الحالة من «${STATUS_LABELS[l.from_value ?? ""]?.label ?? l.from_value}» إلى «${STATUS_LABELS[l.to_value ?? ""]?.label ?? l.to_value}»`
                        : l.action === "note_added"
                        ? "أضاف ملاحظة"
                        : l.action}
                    </p>
                    <p className="text-muted-foreground">
                      {l.actor_email ?? "غير معروف"} • {new Date(l.created_at).toLocaleString("ar")}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function CenterMsg({ msg }: { msg: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <p className="text-muted-foreground">{msg}</p>
    </div>
  );
}

function AuthShell({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-background" dir="rtl">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-[var(--shadow-card)] p-6">
        <button onClick={onBack} className="text-sm text-muted-foreground mb-4 hover:text-foreground">
          ← العودة للموقع
        </button>
        {children}
      </div>
    </div>
  );
}
