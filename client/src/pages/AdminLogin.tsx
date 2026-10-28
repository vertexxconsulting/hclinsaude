import { useEffect, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";

interface LoginForm {
  password: string;
}

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<LoginForm>({ password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in with a valid token
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) {
          navigate("/admin/panel");
        } else {
          localStorage.removeItem("admin_token");
        }
      })
      .catch(() => {
        // Keep on login screen if API is unreachable
      });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Erro de comunicação com o servidor (HTTP ${res.status}). Aguarde o término do deploy ou tente novamente.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Falha no login");
      }

      localStorage.setItem("admin_token", data.token);
      navigate("/admin/panel");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f4c5c] p-5">
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/hclin/logo.webp"
              alt="HCLIN"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="font-display text-3xl text-[#c7a96b]">
            Painel Administrativo
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Acesso restrito à equipe da HCLIN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-full border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-center text-sm text-[#ffcccc]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#c7a96b]">
              Senha
            </label>
            <div className="relative mt-2">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9d8152]"
                size={18}
              />
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ password: e.target.value })}
                className="w-full rounded-full border border-[#9d8152]/30 bg-[#f7f4ed] px-4 py-3 pl-10 text-[#0f4c5c] placeholder-[#17313a]/40 focus:border-[#c7a96b] focus:outline-none focus:ring-2 focus:ring-[#c7a96b]/30"
                placeholder="Digite a senha de administrador"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#c7a96b] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#0f4c5c] transition hover:-translate-y-0.5 hover:bg-[#b0945a] disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 transition hover:text-[#c7a96b]"
          >
            <ArrowLeft size={14} /> Voltar para o site da HCLIN
          </Link>
        </div>
      </div>
    </div>
  );
}
