import { useEffect, useState } from "react";
import { Users, MessageSquare, Edit, ExternalLink, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    professionals: 0,
    testimonials: 0,
    publishedTestimonials: 0,
    pendingTestimonials: 0,
  });

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchStats();
  }, [token, navigate]);

  async function fetchStats() {
    try {
      const [profRes, testRes] = await Promise.all([
        fetch("/api/admin/professionals", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/testimonials", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (
        profRes.status === 401 ||
        profRes.status === 403 ||
        testRes.status === 401 ||
        testRes.status === 403
      ) {
        localStorage.removeItem("admin_token");
        navigate("/admin");
        return;
      }

      const profs = await profRes.json();
      const tests = await testRes.json();

      const profList = Array.isArray(profs) ? profs : [];
      const testList = Array.isArray(tests) ? tests : [];

      setStats({
        professionals: profList.length,
        testimonials: testList.length,
        publishedTestimonials: testList.filter(
          (t: any) => t.published && t.status === "aceito"
        ).length,
        pendingTestimonials: testList.filter(
          (t: any) => t.status === "pendente"
        ).length,
      });
    } catch (err) {
      console.error("Erro ao carregar stats:", err);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/hclin/logo.webp"
              alt="HCLIN"
              className="h-8 w-auto"
            />
            <h1 className="font-display text-2xl text-[#0f4c5c]">
              Painel Administrativo
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="rounded-full border border-[#0f4c5c]/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0f4c5c] transition hover:bg-[#0f4c5c] hover:text-white"
            >
              <ExternalLink size={14} className="inline mr-1" /> Ver site
            </a>
            <button
              onClick={logout}
              className="rounded-full border border-[#0f4c5c]/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0f4c5c] transition hover:bg-[#ff6b6b] hover:text-white"
            >
              <LogOut size={14} className="inline mr-1" /> Sair
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[#0f4c5c]/10 bg-white p-6 shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f4c5c]/10 text-[#0f4c5c]">
                <Users size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0f4c5c]">
                  {stats.professionals}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-[#9d8152]">
                  Profissionais cadastrados
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#0f4c5c]/10 bg-white p-6 shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f4c5c]/10 text-[#0f4c5c]">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0f4c5c]">
                  {stats.testimonials}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-[#9d8152]">
                  Depoimentos cadastrados
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#0f4c5c]/10 bg-white p-6 shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f4c5c]/10 text-[#0f4c5c]">
                <Edit size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0f4c5c]">
                  {stats.publishedTestimonials}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-[#9d8152]">
                  Depoimentos publicados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-[24px] border border-[#0f4c5c]/10 bg-white p-6 shadow">
          <h2 className="mb-4 font-display text-lg text-[#0f4c5c]">
            Ações rápidas
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/admin/professionals"
              className="flex items-center gap-3 rounded-xl border border-[#0f4c5c]/10 p-4 text-[#0f4c5c] transition hover:bg-[#0f4c5c] hover:text-white"
            >
              <Users size={20} />
              <span className="font-bold">Gerenciar Profissionais</span>
            </Link>
            <Link
              href="/admin/testimonials"
              className="flex items-center justify-between gap-3 rounded-xl border border-[#0f4c5c]/10 p-4 text-[#0f4c5c] transition hover:bg-[#0f4c5c] hover:text-white"
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={20} />
                <span className="font-bold">Gerenciar Depoimentos</span>
              </div>
              {stats.pendingTestimonials > 0 && (
                <span className="rounded-full bg-[#c7a96b] px-3 py-1 text-[11px] font-bold text-[#0f4c5c]">
                  {stats.pendingTestimonials} pendente
                  {stats.pendingTestimonials > 1 ? "s" : ""}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
