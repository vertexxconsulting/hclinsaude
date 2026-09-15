// HCLIN / Cuidado em Camadas: página institucional com tipografia editorial, fundo marfim, teal profundo e acessos claros.
import { ArrowLeft, Check, Cookie, Instagram, MessageCircle, ShieldCheck } from "lucide-react";

const WHATSAPP_BASE = "https://wa.me/5542988676700";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17313a]">
      <header className="border-b border-[#17313a]/10 bg-[#f7f4ed]/90 px-5 py-5 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0f4c5c] transition hover:text-[#9d8152]"><ArrowLeft size={15} /> Voltar para a HCLIN</a>
          <img src="/assets/hclin/logo.webp" alt="Símbolo H+ da HCLIN" className="h-10 w-10 object-contain" />
        </div>
      </header>

      <div className="mx-auto max-w-[1040px] px-5 py-20 lg:px-10 lg:py-28">
        <div className="eyebrow"><span className="eyebrow-line" /> Privacidade e transparência</div>
        <h1 className="mt-6 max-w-[760px] font-display text-5xl leading-[0.98] tracking-[-0.045em] text-[#0f4c5c] lg:text-7xl">Política de Privacidade e Cookies</h1>
        <p className="mt-7 max-w-[680px] text-base leading-8 text-[#17313a]/70">Esta página explica, de forma resumida, como a landing page da HCLIN Saúde Integrada utiliza informações técnicas para melhorar a experiência de navegação.</p>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#9d8152]">Última atualização: 20 de agosto de 2026</p>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <article className="rounded-[26px] border border-[#17313a]/12 bg-[#e9efea]/70 p-6"><Cookie className="text-[#0f4c5c]" size={24} strokeWidth={1.6} /><h2 className="mt-5 font-display text-2xl text-[#0f4c5c]">Cookies essenciais</h2><p className="mt-3 text-sm leading-6 text-[#17313a]/65">A página utiliza armazenamento local apenas para lembrar sua escolha de consentimento. Essa preferência é necessária para respeitar sua decisão.</p></article>
          <article className="rounded-[26px] border border-[#17313a]/12 bg-[#e9efea]/70 p-6"><ShieldCheck className="text-[#0f4c5c]" size={24} strokeWidth={1.6} /><h2 className="mt-5 font-display text-2xl text-[#0f4c5c]">Analytics opcional</h2><p className="mt-3 text-sm leading-6 text-[#17313a]/65">O Umami só é carregado após o aceite de analytics. Ele registra métricas de navegação e o evento anônimo de conversão do WhatsApp.</p></article>
          <article className="rounded-[26px] border border-[#17313a]/12 bg-[#e9efea]/70 p-6"><Check className="text-[#0f4c5c]" size={24} strokeWidth={1.6} /><h2 className="mt-5 font-display text-2xl text-[#0f4c5c]">Sua escolha</h2><p className="mt-3 text-sm leading-6 text-[#17313a]/65">Você pode aceitar ou recusar analytics. A recusa não impede o acesso ao conteúdo, ao formulário ou aos canais de contato.</p></article>
        </div>

        <div className="mt-16 max-w-[780px] space-y-12">
          <section><h2 className="font-display text-3xl text-[#0f4c5c]">1. Quem somos</h2><p className="mt-4 text-base leading-8 text-[#17313a]/70">A HCLIN Saúde Integrada é uma clínica localizada em Telêmaco Borba, Paraná. Esta página institucional apresenta informações públicas sobre a clínica, seus atendimentos, profissionais, convênios e canais de contato.</p></section>
          <section><h2 className="font-display text-3xl text-[#0f4c5c]">2. Quais dados são tratados</h2><p className="mt-4 text-base leading-8 text-[#17313a]/70">O formulário de contato abre uma conversa no WhatsApp e não armazena os dados preenchidos nesta página. O analytics opcional pode registrar informações técnicas de visita, como páginas acessadas e interações, além do evento anônimo `whatsapp_conversion` com a origem geral do clique. Nome, mensagem e conteúdo da conversa não são enviados ao analytics.</p></section>
          <section><h2 className="font-display text-3xl text-[#0f4c5c]">3. Como controlar suas preferências</h2><p className="mt-4 text-base leading-8 text-[#17313a]/70">No primeiro acesso, o banner permite aceitar ou recusar analytics. Depois, você pode selecionar “Preferências de cookies” no rodapé para revogar a escolha e exibir o banner novamente. Ao recusar, o script de analytics não é carregado.</p></section>
          <section><h2 className="font-display text-3xl text-[#0f4c5c]">4. Links de terceiros</h2><p className="mt-4 text-base leading-8 text-[#17313a]/70">A página oferece links para Instagram, WhatsApp e Google Maps. Ao acessá-los, você estará sujeito às políticas de privacidade e cookies de cada serviço externo. A HCLIN não controla as práticas desses provedores.</p></section>
          <section><h2 className="font-display text-3xl text-[#0f4c5c]">5. Contato</h2><p className="mt-4 text-base leading-8 text-[#17313a]/70">Para dúvidas sobre esta página ou sobre o atendimento, fale diretamente com a HCLIN pelo <a className="font-bold text-[#0f4c5c] underline decoration-[#c7a96b] underline-offset-4" href={`${WHATSAPP_BASE}?text=Ol%C3%A1%2C%20HCLIN!%20Tenho%20uma%20d%C3%BAvida%20sobre%20privacidade.`} target="_blank" rel="noreferrer">WhatsApp</a> ou pelo <a className="font-bold text-[#0f4c5c] underline decoration-[#c7a96b] underline-offset-4" href="https://www.instagram.com/hclin_integrada/" target="_blank" rel="noreferrer">Instagram</a>.</p></section>
        </div>

        <div className="mt-16 border-t border-[#17313a]/15 pt-7 text-xs leading-6 text-[#17313a]/50"><p>Este texto é uma comunicação informativa da página e deve ser revisado pela clínica com apoio jurídico especializado antes de ser considerado sua política formal de conformidade.</p></div>
      </div>
    </main>
  );
}
