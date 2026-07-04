import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/AdminNav";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "إدارة المستخدمين" }] }),
  component: AdminUsers,
});

type UserRow = { id: string; email: string; created_at: string; is_admin: boolean };

function AdminUsers() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setCurrentId(u.user.id);
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!role);
      if (role) load();
    })();
  }, []);

  async function load() {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) toast.error(error.message);
    else setUsers((data as UserRow[]) || []);
  }

  async function grantByEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data: uid, error } = await supabase.rpc("admin_find_user_id_by_email", { _email: email.trim() });
      if (error) throw error;
      if (!uid) { toast.error("لا يوجد مستخدم بهذا البريد"); return; }
      const { error: insErr } = await supabase.from("user_roles").insert({ user_id: uid as string, role: "admin" } as never);
      if (insErr && !insErr.message.includes("duplicate")) throw insErr;
      toast.success("تمت إضافة صلاحية المدير");
      setEmail("");
      load();
    } catch (err: any) {
      toast.error(err?.message || "خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdmin(u: UserRow) {
    if (u.id === currentId && u.is_admin) {
      if (!confirm("هل تريد إزالة صلاحية المدير عن حسابك؟ سيتم تسجيل خروجك عند التحديث.")) return;
    }
    if (u.is_admin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("تم إلغاء صلاحية المدير");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" } as never);
      if (error) return toast.error(error.message);
      toast.success("تمت الترقية إلى مدير");
    }
    load();
  }

  async function logout() { await supabase.auth.signOut(); navigate({ to: "/auth" }); }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" dir="rtl">
        <div className="max-w-md text-center bg-card border border-border rounded-2xl p-8">
          <h1 className="text-xl font-extrabold mb-3">⛔ غير مصرح</h1>
          <button onClick={logout} className="px-4 py-2 rounded-lg border border-border font-bold">خروج</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-5" dir="rtl">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-2xl font-extrabold mb-4">👥 إدارة المستخدمين</h1>
        <AdminNav onLogout={logout} />

        <form onSubmit={grantByEmail} className="bg-card border border-border rounded-2xl p-5 mb-6 flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-semibold mb-1">ترقية مستخدم إلى مدير (البريد الإلكتروني)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="w-full px-3 py-2 rounded-lg border border-border bg-background" />
          </div>
          <button disabled={loading} className="px-5 py-2.5 rounded-lg font-bold text-white bg-[image:var(--grad-accent)] disabled:opacity-60">
            {loading ? "..." : "ترقية"}
          </button>
        </form>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-right">
              <tr>
                <th className="p-3">البريد</th>
                <th className="p-3">تاريخ التسجيل</th>
                <th className="p-3">الصلاحية</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">لا يوجد مستخدمون.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3 font-semibold">{u.email} {u.id === currentId && <span className="text-xs text-muted-foreground">(أنت)</span>}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString("ar")}</td>
                  <td className="p-3">
                    {u.is_admin
                      ? <span className="px-2 py-1 rounded-md bg-[image:var(--grad-accent)] text-white text-xs font-bold">مدير</span>
                      : <span className="text-xs text-muted-foreground">مستخدم عادي</span>}
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleAdmin(u)} className="px-3 py-1 rounded-md border border-border text-xs font-bold">
                      {u.is_admin ? "إلغاء المدير" : "ترقية إلى مدير"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
