import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Quote,
  Send,
  Star,
  CheckCircle2,
  Sparkles,
  Heart,
  X,
} from "lucide-react";
import {
  testimonials as fallbackTestimonials,
  type Testimonial,
} from "@/data/testimonials";

interface TestimonialsSectionProps {
  whatsappLink?: (message?: string) => string;
  trackWhatsAppClick?: (source: string) => void;
  testimonials?: Testimonial[];
}

const ITEMS_PER_PAGE = 4;
const ROTATION_INTERVAL_MS = 6500;

const TAG_SUGGESTIONS = [
  "Acolhimento & Respeito",
  "Conforto & Clareza",
  "Escuta Humanizada",
  "Cuidado para Toda Família",
  "Organização & Ética",
];

export default function TestimonialsSection({
  testimonials: liveTestimonials,
}: TestimonialsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Estado do formulário de envio de depoimento direto para o banco (Neon)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    author: "",
    role: "",
    tag: TAG_SUGGESTIONS[0],
    rating: 5,
    text: "",
  });

  async function handleTestimonialSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.text.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: formData.author.trim() || "Paciente HCLIN",
          role: formData.role.trim() || "Atendimento na clínica",
          category: "Paciente",
          tag: formData.tag || "Acolhimento & Respeito",
          rating: formData.rating,
          text: formData.text.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível enviar o depoimento");
      }

      setSubmitSuccess(true);
      setFormData({
        author: "",
        role: "",
        tag: TAG_SUGGESTIONS[0],
        rating: 5,
        text: "",
      });
    } catch (err: any) {
      setSubmitError(
        err.message || "Ocorreu um erro ao enviar seu depoimento."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Usar liveTestimonials do Neon, ou fallback local
  const testimonials =
    liveTestimonials && liveTestimonials.length > 0
      ? liveTestimonials
      : fallbackTestimonials;

  // Dividir os depoimentos em páginas de 4 depoimentos cada
  const pages: Testimonial[][] = useMemo(() => {
    if (testimonials.length <= ITEMS_PER_PAGE) {
      return [testimonials];
    }
    const result: Testimonial[][] = [];
    for (let i = 0; i < testimonials.length; i += ITEMS_PER_PAGE) {
      const slice = testimonials.slice(i, i + ITEMS_PER_PAGE);
      if (slice.length < ITEMS_PER_PAGE) {
        result.push(
          testimonials.slice(
            testimonials.length - ITEMS_PER_PAGE,
            testimonials.length
          )
        );
      } else {
        result.push(slice);
      }
    }
    return result;
  }, [testimonials]);

  const totalPages = pages.length;

  // Temporizador de rotação e barra de progresso suave
  useEffect(() => {
    if (isPaused) return;

    const intervalStep = 50;
    const progressIncrement = (intervalStep / ROTATION_INTERVAL_MS) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentPage(curr => (curr + 1) % totalPages);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPaused, totalPages]);

  const goToNext = () => {
    setCurrentPage(curr => (curr + 1) % totalPages);
    setProgress(0);
  };

  const goToPrev = () => {
    setCurrentPage(curr => (curr - 1 + totalPages) % totalPages);
    setProgress(0);
  };

  const currentBatch = pages[currentPage] || pages[0];

  return (
    <section
      id="avaliacoes"
      className="relative overflow-hidden bg-[#f7f4ed] px-5 py-20 lg:px-10 lg:py-24"
      aria-label="Avaliações e Depoimentos da HCLIN"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Detalhes de iluminação sutil de fundo */}
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#c7a96b]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#0f4c5c]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1320px]">
        {/* Cabeçalho da Seção com Métricas e Controles */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-[720px]">
            <div className="eyebrow">
              <span className="eyebrow-line" /> 05 / Avaliações & Depoimentos
            </div>
            <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-[-0.04em] text-[#0f4c5c] sm:text-5xl lg:text-6xl">
              A escuta também continua depois do atendimento.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#17313a]/75 sm:text-lg">
              Depoimentos reais de quem encontrou acolhimento, cuidado
              humanizado e profissionais dedicados na HCLIN Saúde Integrada.
            </p>

            {/* Badges de credibilidade */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-full border border-[#0f4c5c]/15 bg-white/70 px-4 py-2 backdrop-blur">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className="fill-[#c7a96b] text-[#c7a96b]"
                    />
                  ))}
                </div>
                <span className="font-bold text-[#0f4c5c]">5.0</span>
                <span className="text-[#17313a]/60">
                  · Cuidado de excelência
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#0f4c5c]/15 bg-white/70 px-4 py-2 text-[#0f4c5c] backdrop-blur">
                <CheckCircle2 size={15} className="text-[#128c4a]" />
                <span className="font-medium">
                  {testimonials.length} depoimentos cadastrados
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#c7a96b]/35 bg-[#e9efea]/80 px-4 py-2 text-[#0f4c5c] backdrop-blur">
                <Heart size={14} className="fill-[#9d8152] text-[#9d8152]" />
                <span className="font-medium">100% humanizado</span>
              </div>
            </div>
          </div>

          {/* Painel de Controle de Rotação */}
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#9d8152]">
                Lote {currentPage + 1} de {totalPages}
              </span>

              {/* Botão de Pausar / Retomar Auto-Play */}
              <button
                type="button"
                onClick={() => setIsPaused(prev => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0f4c5c]/20 bg-white/80 text-[#0f4c5c] transition hover:bg-[#0f4c5c] hover:text-white"
                title={
                  isPaused
                    ? "Retomar rotação automática"
                    : "Pausar rotação automática"
                }
                aria-label={
                  isPaused
                    ? "Retomar rotação automática"
                    : "Pausar rotação automática"
                }
              >
                {isPaused ? (
                  <Play size={14} className="ml-0.5" />
                ) : (
                  <Pause size={14} />
                )}
              </button>

              {/* Botão Anterior */}
              <button
                type="button"
                onClick={goToPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0f4c5c]/20 bg-white text-[#0f4c5c] shadow-sm transition duration-200 hover:-translate-x-0.5 hover:bg-[#0f4c5c] hover:text-[#f7f4ed]"
                aria-label="Ver 4 depoimentos anteriores"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Botão Próximo */}
              <button
                type="button"
                onClick={goToNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0f4c5c]/20 bg-white text-[#0f4c5c] shadow-sm transition duration-200 hover:translate-x-0.5 hover:bg-[#0f4c5c] hover:text-[#f7f4ed]"
                aria-label="Ver próximos 4 depoimentos"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Barra de progresso do timer automático */}
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#0f4c5c]/10">
                <div
                  className="h-full bg-gradient-to-r from-[#0f4c5c] to-[#c7a96b] transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-[#17313a]/50">
                {isPaused ? "Pausado (leitura)" : "Rotacionando"}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de 4 Depoimentos com Transição Suave */}
        <div className="mt-12">
          <div
            key={currentPage}
            className="animate-fade-in grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {currentBatch.map((testimonial, idx) => {
              const isStaff = testimonial.category === "Profissional";
              return (
                <article
                  key={`${testimonial.id}-${idx}`}
                  className={`group relative flex h-full min-h-[340px] flex-col justify-between rounded-[28px] border p-6 sm:p-7 transition-all duration-500 hover:-translate-y-2 ${
                    isStaff
                      ? "border-[#c7a96b]/50 bg-gradient-to-b from-[#fdfbf7] to-[#e9efea] shadow-[0_16px_50px_rgba(199,169,107,0.14)] hover:shadow-[0_24px_65px_rgba(15,76,92,0.18)]"
                      : "border-[#0f4c5c]/10 bg-white/85 shadow-[0_12px_40px_rgba(23,49,58,0.06)] hover:border-[#c7a96b]/60 hover:shadow-[0_22px_55px_rgba(23,49,58,0.12)]"
                  }`}
                >
                  {/* Topo do Card: Aspas decorativas, Estrelas e Tag */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            size={15}
                            className="fill-[#c7a96b] text-[#c7a96b]"
                          />
                        ))}
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#0f4c5c]/5 text-[#c7a96b] transition duration-300 group-hover:bg-[#0f4c5c] group-hover:text-[#f7f4ed]">
                        <Quote size={16} />
                      </span>
                    </div>

                    {/* Tag da Categoria */}
                    <div className="mt-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                          isStaff
                            ? "bg-[#0f4c5c] text-[#f7f4ed]"
                            : "bg-[#e9efea] text-[#0f4c5c]"
                        }`}
                      >
                        {isStaff && (
                          <Sparkles size={11} className="text-[#c7a96b]" />
                        )}
                        {testimonial.tag}
                      </span>
                    </div>

                    {/* Corpo do Depoimento */}
                    <blockquote className="mt-5 text-[14px] leading-6 text-[#17313a]/80 sm:text-[14.5px]">
                      &ldquo;{testimonial.text}&rdquo;
                    </blockquote>
                  </div>

                  {/* Rodapé do Card: Autor e Verificação */}
                  <div className="mt-6 border-t border-[#0f4c5c]/10 pt-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase shadow-sm ${
                          isStaff
                            ? "bg-[#0f4c5c] text-[#c7a96b]"
                            : "bg-[#e9efea] text-[#0f4c5c]"
                        }`}
                      >
                        {isStaff ? "EQ" : `P${testimonial.position}`}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-[#0f4c5c]">
                          {testimonial.author}
                        </p>
                        <p className="truncate text-[11px] text-[#17313a]/55">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-[#17313a]/45">
                      <span className="flex items-center gap-1 text-[#128c4a]">
                        <CheckCircle2 size={12} /> Depoimento verificado
                      </span>
                      <span>Telêmaco Borba</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Banner e Formulário de Envio Direto para Aprovação Admin */}
        <div className="mt-14 rounded-[32px] border border-[#0f4c5c]/15 bg-[#e9efea]/90 p-8 sm:p-10 backdrop-blur-md">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> Sua voz faz a diferença
              </div>
              <h3 className="mt-3 font-display text-2xl leading-tight text-[#0f4c5c] sm:text-3xl">
                Já foi atendido na HCLIN? Deixe seu depoimento.
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#17313a]/70">
                Registre seu relato diretamente aqui no site. Após revisão e
                aprovação da nossa equipe, ele será publicado neste mural para
                acolher novas pessoas e famílias.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(prev => !prev);
                  setSubmitSuccess(false);
                  setSubmitError(null);
                }}
                className="inline-flex items-center gap-3 rounded-full bg-[#0f4c5c] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#17313a] hover:shadow-[0_16px_45px_rgba(15,76,92,.35)]"
              >
                {isFormOpen ? (
                  <>
                    <X size={15} /> Fechar formulário
                  </>
                ) : (
                  <>
                    <Send size={15} /> Registrar meu depoimento
                  </>
                )}
              </button>
            </div>
          </div>

          {submitSuccess && (
            <div className="mt-8 rounded-2xl border border-[#128c4a]/25 bg-white/90 p-6 text-[#0f4c5c] shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-[#128c4a]"
                />
                <div>
                  <h4 className="font-display text-xl text-[#0f4c5c]">
                    Depoimento enviado com sucesso!
                  </h4>
                  <p className="mt-1 text-sm text-[#17313a]/75">
                    Agradecemos imensamente pelo carinho. Seu depoimento foi
                    salvo e ficará visível no site assim que for aprovado pela
                    administração da HCLIN.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setIsFormOpen(false);
                    }}
                    className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#0f4c5c] underline decoration-[#c7a96b] underline-offset-4"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            </div>
          )}

          {isFormOpen && !submitSuccess && (
            <form
              onSubmit={handleTestimonialSubmit}
              className="mt-8 border-t border-[#0f4c5c]/15 pt-8"
            >
              {submitError && (
                <div className="mb-5 rounded-xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#a61b1b]">
                  {submitError}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#0f4c5c]">
                    Seu nome{" "}
                    <span className="font-normal normal-case tracking-normal text-[#17313a]/50">
                      (ou deixe em branco para exibir &ldquo;Paciente
                      HCLIN&rdquo;)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={e =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Ex.: Maria S. ou Paciente HCLIN"
                    className="mt-2 w-full rounded-full border border-[#0f4c5c]/20 bg-white px-4 py-3 text-sm text-[#0f4c5c] placeholder-[#17313a]/40 focus:border-[#c7a96b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#0f4c5c]">
                    Área ou contexto do atendimento
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="Ex.: Atendimento em Psicologia, Nutrição, Acompanhamento..."
                    className="mt-2 w-full rounded-full border border-[#0f4c5c]/20 bg-white px-4 py-3 text-sm text-[#0f4c5c] placeholder-[#17313a]/40 focus:border-[#c7a96b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#0f4c5c]">
                    O que mais marcou sua experiência?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TAG_SUGGESTIONS.map(tagOption => {
                      const active = formData.tag === tagOption;
                      return (
                        <button
                          key={tagOption}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, tag: tagOption })
                          }
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                            active
                              ? "bg-[#0f4c5c] text-white"
                              : "border border-[#0f4c5c]/20 bg-white/80 text-[#0f4c5c] hover:bg-white"
                          }`}
                        >
                          {tagOption}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#0f4c5c]">
                    Sua avaliação
                  </label>
                  <div className="mt-2 flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
                        aria-label={`Avaliar com ${star} estrelas`}
                        className="rounded-full p-1 transition hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={
                            star <= formData.rating
                              ? "fill-[#c7a96b] text-[#c7a96b]"
                              : "text-[#0f4c5c]/25"
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-[#0f4c5c]">
                      {formData.rating}.0 / 5.0
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#0f4c5c]">
                    Seu depoimento *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.text}
                    onChange={e =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    placeholder="Conte como foi sua experiência de acolhimento e cuidado na HCLIN..."
                    className="mt-2 w-full rounded-2xl border border-[#0f4c5c]/20 bg-white px-4 py-3 text-sm text-[#0f4c5c] placeholder-[#17313a]/40 focus:border-[#c7a96b] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-[#17313a]/60">
                  Seu relato será encaminhado para revisão da administração
                  antes de ser publicado.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-full border border-[#0f4c5c]/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#0f4c5c] transition hover:bg-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0f4c5c] px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#17313a] disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? "Enviando..." : "Enviar para aprovação"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
