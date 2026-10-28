import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  Check,
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface Professional {
  id: string;
  name: string;
  role: string;
  specialties: string;
  bio: string;
  schedule: string;
  image_url: string | null;
  object_position: string | null;
  registration: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface StorageImage {
  id: string;
  filename: string;
  url: string;
  size_bytes: number;
  source: "storage" | "local";
  created_at: string;
}

const POSITION_PRESETS = [
  { label: "Centro", value: "object-center" },
  { label: "Topo (Rosto)", value: "object-top" },
  { label: "Topo Suave", value: "object-[5%_top]" },
  { label: "Inteira (Sem corte)", value: "!object-contain object-center" },
];

async function compressImageToWebpDataUrl(
  file: File,
  maxDimension = 960,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        resolve(webpDataUrl);
      };
      img.onerror = () => reject(new Error("Falha ao processar imagem"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export default function AdminProfessionals() {
  const [, navigate] = useLocation();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Professional>>({});

  // Storage & Upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [storageUploads, setStorageUploads] = useState<StorageImage[]>([]);
  const [localAssets, setLocalAssets] = useState<StorageImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const token = localStorage.getItem("admin_token");
  const apiHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchProfessionals();
  }, [token, navigate]);

  async function fetchProfessionals() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/professionals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("admin_token");
        navigate("/admin");
        return;
      }
      const data = await res.json();
      setProfessionals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar profissionais:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStorageGallery() {
    setLoadingGallery(true);
    try {
      const res = await fetch("/api/admin/uploads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStorageUploads(Array.isArray(data.uploads) ? data.uploads : []);
        setLocalAssets(Array.isArray(data.localAssets) ? data.localAssets : []);
      }
    } catch (err) {
      console.error("Erro ao carregar galeria do storage:", err);
    } finally {
      setLoadingGallery(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setUploadError(null);

    try {
      const dataUrl = await compressImageToWebpDataUrl(file);
      const preferredName = editForm.name
        ? `${editForm.name}-${file.name}`
        : file.name;

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        ...apiHeaders,
        body: JSON.stringify({
          filename: preferredName,
          dataUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar foto");
      }

      setEditForm(prev => ({
        ...prev,
        image_url: data.url,
        object_position: prev.object_position || "object-center",
      }));

      if (showGallery) {
        fetchStorageGallery();
      }
    } catch (err: any) {
      setUploadError(err.message || "Falha no upload da foto");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function deleteStoragePhoto(filename: string) {
    if (!confirm("Remover esta foto do storage?")) return;
    try {
      await fetch(`/api/admin/uploads/${encodeURIComponent(filename)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStorageGallery();
    } catch (err) {
      console.error("Erro ao excluir foto do storage:", err);
    }
  }

  function startEditing(prof: Professional) {
    setEditingId(prof.id);
    setEditForm(prof);
    setUploadError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
    setShowGallery(false);
    setUploadError(null);
  }

  async function saveProfessional() {
    if (!editForm.name) return;

    try {
      if (editingId && editingId !== "new") {
        await fetch(`/api/admin/professionals/${editingId}`, {
          method: "PUT",
          ...apiHeaders,
          body: JSON.stringify(editForm),
        });
      } else {
        await fetch("/api/admin/professionals", {
          method: "POST",
          ...apiHeaders,
          body: JSON.stringify(editForm),
        });
      }
      await fetchProfessionals();
      cancelEdit();
    } catch (err) {
      console.error("Erro ao salvar profissional:", err);
    }
  }

  async function deleteProfessional(id: string) {
    if (!confirm("Tem certeza que deseja remover este profissional?")) return;
    try {
      await fetch(`/api/admin/professionals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProfessionals();
    } catch (err) {
      console.error("Erro ao deletar profissional:", err);
    }
  }

  function newProfessional() {
    setEditingId("new");
    setUploadError(null);
    setEditForm({
      name: "",
      role: "",
      specialties: "",
      bio: "",
      schedule: "Horários a confirmar com a clínica.",
      image_url: null,
      object_position: "object-center",
      registration: null,
      order_index: professionals.length,
      active: true,
    });
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#17313a]/50">Carregando profissionais...</p>
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
              Profissionais
            </h1>
          </div>
          <button
            onClick={newProfessional}
            className="rounded-full bg-[#0f4c5c] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#17313a]"
          >
            <Plus size={14} className="inline mr-1" /> Novo Profissional
          </button>
        </div>

        {/* Form for new/edit */}
        {editingId !== null && (
          <div className="mb-8 rounded-[24px] border border-[#0f4c5c]/15 bg-white p-6 shadow">
            <h2 className="mb-5 font-display text-xl text-[#0f4c5c]">
              {editingId === "new" ? "Novo" : "Editar"} Profissional
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
              {/* Coluna Esquerda: Preview da Foto + Botões de Upload/Storage */}
              <div className="flex flex-col items-center">
                <div className="relative aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-[34%_12%_30%_12%] border border-[#0f4c5c]/15 bg-[#e9efea] shadow-sm">
                  {editForm.image_url ? (
                    <img
                      src={editForm.image_url}
                      alt={editForm.name || "Pré-visualização"}
                      className={`h-full w-full object-cover ${editForm.object_position || "object-center"}`}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center text-[#0f4c5c]/45">
                      <ImageIcon size={32} className="mb-2 opacity-60" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                        Sem foto selecionada
                      </span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="mt-3 flex w-full max-w-[220px] flex-col gap-2">
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c7a96b] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#0f4c5c] transition hover:bg-[#b0945a] disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {uploadingPhoto ? "Enviando..." : "Enviar Foto"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !showGallery;
                      setShowGallery(next);
                      if (next) fetchStorageGallery();
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#0f4c5c]/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0f4c5c] transition hover:bg-[#e9efea]"
                  >
                    <FolderOpen size={14} />
                    {showGallery ? "Fechar Storage" : "Galeria Storage"}
                  </button>

                  {editForm.image_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, image_url: null })
                      }
                      className="text-[11px] font-medium text-[#ff6b6b] underline underline-offset-2 hover:opacity-80"
                    >
                      Remover foto do perfil
                    </button>
                  )}
                </div>

                {uploadError && (
                  <p className="mt-2 text-center text-xs text-[#ff6b6b]">
                    {uploadError}
                  </p>
                )}
              </div>

              {/* Coluna Direita: Campos do Formulário */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ""}
                    onChange={e =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c] focus:border-[#c7a96b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                    Cargo / Especialidade
                  </label>
                  <input
                    type="text"
                    value={editForm.role || ""}
                    onChange={e =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c] focus:border-[#c7a96b] focus:outline-none"
                    placeholder="ex: Psicóloga · CRP 08/00000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                    Especialidades (resumo no card)
                  </label>
                  <input
                    type="text"
                    value={editForm.specialties || ""}
                    onChange={e =>
                      setEditForm({ ...editForm, specialties: e.target.value })
                    }
                    className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c] focus:border-[#c7a96b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                    Registro (opcional)
                  </label>
                  <input
                    type="text"
                    value={editForm.registration || ""}
                    onChange={e =>
                      setEditForm({ ...editForm, registration: e.target.value })
                    }
                    className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c] focus:border-[#c7a96b] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                    Biografia
                  </label>
                  <textarea
                    value={editForm.bio || ""}
                    onChange={e =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c] focus:border-[#c7a96b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                    URL da Foto (preenchido pelo Upload/Storage)
                  </label>
                  <input
                    type="text"
                    value={editForm.image_url || ""}
                    onChange={e =>
                      setEditForm({
                        ...editForm,
                        image_url: e.target.value || null,
                      })
                    }
                    className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c] focus:border-[#c7a96b] focus:outline-none"
                    placeholder="/api/uploads/foto.webp ou /assets/hclin/foto.webp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                    Enquadramento da Foto
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {POSITION_PRESETS.map(preset => {
                      const isSelected =
                        (editForm.object_position || "object-center") ===
                        preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              object_position: preset.value,
                            })
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "bg-[#0f4c5c] text-white"
                              : "border border-[#0f4c5c]/20 bg-[#f7f4ed] text-[#0f4c5c] hover:bg-[#e9efea]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                    Horário
                  </label>
                  <input
                    type="text"
                    value={editForm.schedule || ""}
                    onChange={e =>
                      setEditForm({ ...editForm, schedule: e.target.value })
                    }
                    className="mt-1 w-full rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c] focus:border-[#c7a96b] focus:outline-none"
                    placeholder="Horários a confirmar com a clínica"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#9d8152]">
                      Ordem
                    </label>
                    <input
                      type="number"
                      value={editForm.order_index || 0}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          order_index: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1 w-20 rounded-full border border-[#0f4c5c]/20 px-4 py-2.5 text-sm text-[#0f4c5c] focus:border-[#c7a96b] focus:outline-none"
                    />
                  </div>
                  <label className="mb-2 flex items-center gap-2 text-sm text-[#0f4c5c]">
                    <input
                      type="checkbox"
                      checked={editForm.active ?? true}
                      onChange={e =>
                        setEditForm({ ...editForm, active: e.target.checked })
                      }
                    />
                    <span className="text-xs font-medium">Ativo no site</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Galeria do Storage */}
            {showGallery && (
              <div className="mt-6 rounded-2xl border border-[#0f4c5c]/15 bg-[#f7f4ed] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-base text-[#0f4c5c]">
                    Galeria do Storage (clique em uma foto para selecionar)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowGallery(false)}
                    className="text-xs font-bold text-[#0f4c5c]/60 hover:text-[#0f4c5c]"
                  >
                    Fechar
                  </button>
                </div>

                {loadingGallery ? (
                  <p className="text-xs text-[#17313a]/60">
                    Carregando fotos do storage...
                  </p>
                ) : (
                  <div className="space-y-4">
                    {storageUploads.length > 0 && (
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9d8152]">
                          Fotos enviadas ao Storage ({storageUploads.length})
                        </p>
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7">
                          {storageUploads.map(img => {
                            const selected = editForm.image_url === img.url;
                            return (
                              <div
                                key={img.id}
                                className={`group relative overflow-hidden rounded-xl border-2 bg-white transition ${
                                  selected
                                    ? "border-[#0f4c5c] ring-2 ring-[#c7a96b]"
                                    : "border-transparent hover:border-[#c7a96b]"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditForm({
                                      ...editForm,
                                      image_url: img.url,
                                    })
                                  }
                                  className="block w-full text-left"
                                >
                                  <img
                                    src={img.url}
                                    alt={img.filename}
                                    className="aspect-[4/5] w-full object-cover"
                                  />
                                  <p className="truncate px-1.5 py-1 text-[10px] text-[#0f4c5c]">
                                    {img.filename}
                                  </p>
                                </button>
                                {selected && (
                                  <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f4c5c] text-white">
                                    <Check size={12} />
                                  </span>
                                )}
                                <button
                                  type="button"
                                  title="Excluir do storage"
                                  onClick={() =>
                                    deleteStoragePhoto(img.filename)
                                  }
                                  className="absolute right-1.5 top-1.5 hidden rounded-full bg-white/90 p-1 text-[#ff6b6b] shadow group-hover:block hover:bg-[#ff6b6b] hover:text-white"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9d8152]">
                        Acervo da clínica ({localAssets.length})
                      </p>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7">
                        {localAssets.map(img => {
                          const selected = editForm.image_url === img.url;
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() =>
                                setEditForm({ ...editForm, image_url: img.url })
                              }
                              className={`relative overflow-hidden rounded-xl border-2 bg-white text-left transition ${
                                selected
                                  ? "border-[#0f4c5c] ring-2 ring-[#c7a96b]"
                                  : "border-transparent hover:border-[#c7a96b]"
                              }`}
                            >
                              <img
                                src={img.url}
                                alt={img.filename}
                                loading="lazy"
                                className="aspect-[4/5] w-full object-cover"
                              />
                              <p className="truncate px-1.5 py-1 text-[10px] text-[#0f4c5c]">
                                {img.filename}
                              </p>
                              {selected && (
                                <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f4c5c] text-white">
                                  <Check size={12} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveProfessional}
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
          {professionals.map(prof => (
            <div
              key={prof.id}
              className="rounded-xl border border-[#0f4c5c]/10 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9efea] text-xs font-bold text-[#0f4c5c]">
                    {prof.order_index + 1}
                  </div>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#0f4c5c]/15 bg-[#e9efea]">
                    {prof.image_url ? (
                      <img
                        src={prof.image_url}
                        alt={prof.name}
                        className={`h-full w-full object-cover ${prof.object_position || "object-center"}`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#0f4c5c]/40">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f4c5c]">{prof.name}</p>
                    <p className="text-sm text-[#17313a]/60">{prof.role}</p>
                    {prof.registration &&
                      !prof.role?.includes(prof.registration) && (
                        <p className="text-xs text-[#9d8152]">
                          {prof.registration}
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${prof.active ? "text-[#128c4a]" : "text-[#ff6b6b]"}`}
                  >
                    {prof.active ? "Ativo" : "Inativo"}
                  </span>
                  <button
                    onClick={() => startEditing(prof)}
                    className="rounded-full p-2 text-[#0f4c5c] hover:bg-[#e9efea]"
                    title="Editar"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => deleteProfessional(prof.id)}
                    className="rounded-full p-2 text-[#ff6b6b] hover:bg-[#ff6b6b]/10"
                    title="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
