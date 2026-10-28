import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Check } from "lucide-react";
import { Link, useLocation } from "wouter";

interface Testimonial {
  id: string;
  position: number;
  text: string;
  author: string;
  role: string;
  category: "Paciente" | "Profissional";
  tag: string;
  rating: number;
  published: boolean;
  status: "aceito" | "pendente" | "rejeitado";
  created_at: string;
  updated_at: string;
}

export default function AdminTestimonials() {
  const [, navigate] = useLocation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Testimonial>>({});

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchTestimonials();
  }, [token, navigate]);

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("admin_token");
        navigate("/admin");
        return;
      }
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar depoimentos:", err);
    } finally {
      setLoading(false);
    }
  }

  function startEditing(t: Testimonial) {
    setEditingId(t.id);
    setEditForm(t);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function newTestimonial() {
    setEditingId("new");
    setEditForm({
      position: testimonials.length + 1,
      text: "",
      author: "",
      role: "",
      category: "Paciente",
      tag: "",
      rating: 5,
      published: false,
      status: "pendente",
    });
  }

  async function saveTestimonial() {
    if (!editForm.text) return;

    try {
      if (editingId && editingId !== "new") {
        await fetch(`/api/admin/testimonials/${editingId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        });
      } else {
        await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        });
      }
      await fetchTestimonials();
      cancelEdit();
    } catch (err) {
      console.error("Erro ao salvar depoimento:", err);
    }
  }

  async function deleteTestimonial(id: string) {
    if (!confirm("Tem certeza que deseja remover este depoimento?")) return;
    try {
      await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTestimonials();
    } catch (err) {
      console.error("Erro ao deletar depoimento:", err);
    }
  }

  async function quickApprove(t: Testimonial) {
    try {
      await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...t,
          status: "aceito",
          published: true,
        }),
      });
      await fetchTestimonials();
    } catch (err) {
      console.error("Erro ao aprovar depoimento:", err);
    }
  }

  async function quickUnpublish(t: Testimonial) {
    try {
      await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...t,
          published: false,
        }),
      });
      await fetchTestimonials();
    } catch (err) {
      console.error("Erro ao ocultar depoimento:", err);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#17313a]/50">Carregando depoimentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/panel"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#0f4c5c]/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0f4c5c] transition hover:bg-[#0f4c5c] hover:text-white"
            >
              <ArrowLeft size={14} /> Painel
            </Link>
            <h1 className="font-display text-2xl text-[#0f4c5c]">
              Depoimentos
            </h1>
          </div>
          <button
            onClick={newTestimonial}
            className="rounded-full bg-[#0f4c5c] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#17313a]"
          >
            <Plus size={14} className="inline mr-1" /> Novo Depoimento
          </button>
        </div>

        {/* Form */}
        {editingId !== null && (
          <div className="mb-8 rounded-[24px] border border-[#0f4c5c]/15 bg-white p-6 shadow">
            <h2 className="mb-4 font-display text-xl text-[#0f4c5c]">
              {editingId === "new" ? "Novo" : "Editar"} Depoimento
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                  Posição
                </label>
                <input
                  type="number"
                  value={editForm.position || 0}
                  onChange={e =>
                    setEditForm({
                      ...editForm,
                      position: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                  Autor
                </label>
                <input
                  type="text"
                  value={editForm.author || ""}
                  onChange={e =>
                    setEditForm({ ...editForm, author: e.target.value })
                  }
                  className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                  Cargo/Role
                </label>
                <input
                  type="text"
                  value={editForm.role || ""}
                  onChange={e =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                  Categoria
                </label>
                <select
                  value={editForm.category || "Paciente"}
                  onChange={e =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value as "Paciente" | "Profissional",
                    })
                  }
                  className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c]"
                >
                  <option value="Paciente">Paciente</option>
                  <option value="Profissional">Profissional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                  Tag/Categoria visual
                </label>
                <input
                  type="text"
                  value={editForm.tag || ""}
                  onChange={e =>
                    setEditForm({ ...editForm, tag: e.target.value })
                  }
                  className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c]"
                  placeholder="ex: Acolhimento & Respeito"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editForm.rating || 5}
                  onChange={e =>
                    setEditForm({
                      ...editForm,
                      rating: parseInt(e.target.value) || 5,
                    })
                  }
                  className="mt-1 w-20 rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                  Status
                </label>
                <select
                  value={editForm.status || "pendente"}
                  onChange={e =>
                    setEditForm({ ...editForm, status: e.target.value as any })
                  }
                  className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c]"
                >
                  <option value="pendente">Pendente</option>
                  <option value="aceito">Aceito</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-[#0f4c5c]">
                  <input
                    type="checkbox"
                    checked={editForm.published || false}
                    onChange={e =>
                      setEditForm({ ...editForm, published: e.target.checked })
                    }
                  />
                  <span className="text-xs font-medium">Publicado no site</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                  Texto do depoimento
                </label>
                <textarea
                  value={editForm.text || ""}
                  onChange={e =>
                    setEditForm({ ...editForm, text: e.target.value })
                  }
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c]"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={saveTestimonial}
                className="rounded-full bg-[#0f4c5c] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#17313a]"
              >
                <Save size={14} className="inline mr-1" /> Salvar
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-full border border-[#0f4c5c]/20 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0f4c5c] transition hover:bg-[#0f4c5c] hover:text-white"
              >
                <X size={14} className="inline mr-1" /> Cancelar
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {testimonials.map(t => {
            const isPending = t.status === "pendente";
            return (
              <div
                key={t.id}
                className={`rounded-xl border p-4 shadow-sm ${
                  isPending
                    ? "border-[#c7a96b] bg-[#fdfbf7]"
                    : "border-[#0f4c5c]/10 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex text-[#c7a96b]">
                      {"★".repeat(t.rating)}
                      {"☆".repeat(5 - t.rating)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#0f4c5c]">{t.author}</p>
                        {isPending && (
                          <span className="rounded-full bg-[#c7a96b]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                            Aguardando aprovação
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#17313a]/60">
                        {t.role} {t.tag ? `· ${t.tag}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(!t.published || t.status !== "aceito") && (
                      <button
                        type="button"
                        onClick={() => quickApprove(t)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#128c4a] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#0e6e3a]"
                        title="Aprovar e publicar no site"
                      >
                        <Check size={13} /> Aprovar e publicar
                      </button>
                    )}
                    {t.published && t.status === "aceito" && (
                      <button
                        type="button"
                        onClick={() => quickUnpublish(t)}
                        className="rounded-full border border-[#0f4c5c]/20 px-3 py-1 text-xs font-medium text-[#0f4c5c] transition hover:bg-[#e9efea]"
                        title="Retirar do ar sem excluir"
                      >
                        Ocultar do site
                      </button>
                    )}
                    <span
                      className={`text-xs font-bold ${
                        t.published && t.status === "aceito"
                          ? "text-[#128c4a]"
                          : "text-[#9d8152]"
                      }`}
                    >
                      {t.published && t.status === "aceito"
                        ? "Publicado"
                        : "Rascunho"}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        t.status === "aceito"
                          ? "text-[#128c4a]"
                          : t.status === "rejeitado"
                            ? "text-[#ff6b6b]"
                            : "text-[#9d8152]"
                      }`}
                    >
                      {t.status}
                    </span>
                    <button
                      onClick={() => startEditing(t)}
                      className="rounded-full p-2 text-[#0f4c5c] hover:bg-[#e9efea]"
                      title="Editar"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => deleteTestimonial(t.id)}
                      className="rounded-full p-2 text-[#ff6b6b] hover:bg-[#ff6b6b]/10"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#17313a]/80">{t.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
