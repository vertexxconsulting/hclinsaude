import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Pause,
  Play,
  Quote,
  Send,
  Star,
  CheckCircle2,
  Sparkles,
  Heart,
} from "lucide-react";
import { testimonials, type Testimonial } from "@/data/testimonials";

interface TestimonialsSectionProps {
  whatsappLink: (message?: string) => string;
  trackWhatsAppClick: (source: string) => void;
}

const ITEMS_PER_PAGE = 4;
const ROTATION_INTERVAL_MS = 6500;

export default function TestimonialsSection({
  whatsappLink,
  trackWhatsAppClick,
}: TestimonialsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dividir os 13 depoimentos em páginas de 4 depoimentos cada
  const pages: Testimonial[][] = useMemo(() => {
    return [
      testimonials.slice(0, 4),   // Depoimentos 1 a 4
      testimonials.slice(4, 8),   // Depoimentos 5 a 8
      testimonials.slice(8, 12),  // Depoimentos 9 a 12
      testimonials.slice(9, 13),  // Depoimentos 10 a 13 (inclui o da equipe)
    ];
  }, []);

  const totalPages = pages.length;

  // Temporizador de rotação e barra de progresso suave
  useEffect(() => {
    if (isPaused) return;

    const intervalStep = 50;
    const progressIncrement = (intervalStep / ROTATION_INTERVAL_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentPage((curr) => (curr + 1) % totalPages);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPaused, totalPages]);

  const goToNext = () => {
    setCurrentPage((curr) => (curr + 1) % totalPages);
    setProgress(0);
  };

  const goToPrev = () => {
    setCurrentPage((curr) => (curr - 1 + totalPages) % totalPages);
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
              Depoimentos reais de quem encontrou acolhimento, cuidado humanizado e profissionais
              dedicados na HCLIN Saúde Integrada.
            </p>

            {/* Badges de credibilidade */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-full border border-[#0f4c5c]/15 bg-white/70 px-4 py-2 backdrop-blur">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-[#c7a96b] text-[#c7a96b]" />
                  ))}
                </div>
                <span className="font-bold text-[#0f4c5c]">5.0</span>
                <span className="text-[#17313a]/60">· Cuidado de excelência</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#0f4c5c]/15 bg-white/70 px-4 py-2 text-[#0f4c5c] backdrop-blur">
                <CheckCircle2 size={15} className="text-[#128c4a]" />
                <span className="font-medium">13 depoimentos cadastrados</span>
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
                onClick={() => setIsPaused((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0f4c5c]/20 bg-white/80 text-[#0f4c5c] transition hover:bg-[#0f4c5c] hover:text-white"
                title={isPaused ? "Retomar rotação automática" : "Pausar rotação automática"}
                aria-label={isPaused ? "Retomar rotação automática" : "Pausar rotação automática"}
              >
                {isPaused ? <Play size={14} className="ml-0.5" /> : <Pause size={14} />}
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
                          <Star key={i} size={15} className="fill-[#c7a96b] text-[#c7a96b]" />
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
                        {isStaff && <Sparkles size={11} className="text-[#c7a96b]" />}
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


        {/* Banner de Chamada para Novos Depoimentos */}
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
                Envie seu relato diretamente pelo WhatsApp da clínica. Após autorização e revisão cuidadosa,
                ele poderá ser incluído aqui para acolher novas pessoas e famílias.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:justify-end">
              <a
                onClick={() => trackWhatsAppClick("testimonial_submit")}
                href={whatsappLink(
                  "Olá, HCLIN! Gostaria de registrar meu depoimento sobre o atendimento que recebi na clínica."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-[#0f4c5c] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#17313a] hover:shadow-[0_16px_45px_rgba(15,76,92,.35)]"
              >
                <Send size={15} /> Registrar meu depoimento
              </a>
              <span className="flex items-center gap-1.5 text-xs text-[#17313a]/55">
                <MessageCircle size={14} className="text-[#25D366]" /> Direto no WhatsApp
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
