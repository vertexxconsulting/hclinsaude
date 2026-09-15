import { ArrowLeft, MessageCircle } from "lucide-react";

// HCLIN / Cuidado em Camadas: páginas utilitárias também preservam marfim, azul-petróleo, dourado e orientação humana.
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4ed] px-5 text-[#17313a]">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#c7a96b]/45" />
      <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-[#0f4c5c]/20" />
      <div className="relative w-full max-w-xl rounded-[32px] border border-[#17313a]/10 bg-[#f7f4ed]/85 p-8 text-center shadow-[0_24px_80px_rgba(23,49,58,.10)] backdrop-blur sm:p-12">
        <img src="/assets/hclin/logo.webp" alt="Símbolo H+" className="mx-auto h-16 w-16 object-contain" />
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.28em] text-[#9d8152]">HCLIN / caminho não encontrado</p>
        <h1 className="mt-5 font-display text-6xl leading-none tracking-[-0.05em] text-[#0f4c5c]">Vamos voltar?</h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-[#17313a]/65">Esta página não está disponível, mas o cuidado continua por perto. Retorne ao início ou fale com a clínica.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/" className="inline-flex items-center gap-2 rounded-full bg-[#0f4c5c] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5"><ArrowLeft size={15} /> Voltar ao início</a>
          <a href="https://wa.me/5542988095848?text=Olá%2C%20HCLIN!%20Preciso%20de%20ajuda%20para%20encontrar%20uma%20página." target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#25D366] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#128c4a] transition hover:-translate-y-0.5"><MessageCircle size={15} /> WhatsApp</a>
        </div>
      </div>
    </main>
  );
}
