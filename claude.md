# claude.md — HCLIN Saúde Integrada

## Propósito do projeto

Este repositório contém a landing page institucional da **HCLIN Saúde Integrada**, clínica multidisciplinar localizada em Telêmaco Borba, Paraná. A aplicação apresenta a clínica, especialidades, profissionais, convênios, localização e canais de contato, conduzindo o visitante principalmente para o WhatsApp oficial.

A aplicação é um frontend estático. Não há backend próprio para formulários, autenticação, banco de dados ou processamento de mensagens. O formulário monta a mensagem informada pelo visitante e abre uma conversa no WhatsApp da clínica.

> Preserve uma experiência acolhedora, integrada, editorial e confiável. Não transforme a interface em um template genérico de saúde.

## Stack e comandos

O projeto utiliza React 19, TypeScript, Vite 7, Tailwind CSS 4, Wouter e Lucide React. Os componentes visuais disponíveis em `client/src/components/ui/` são baseados em shadcn/ui e Radix UI.

| Comando | Finalidade |
|---|---|
| `pnpm dev` | Inicia o servidor Vite em desenvolvimento. |
| `pnpm check` | Executa o TypeScript sem emitir arquivos. |
| `pnpm build` | Gera o build estático de produção. |
| `pnpm preview` | Abre uma prévia do build. |
| `pnpm format` | Formata o código com Prettier. |

Depois de alterações relevantes, execute `pnpm check` e `pnpm build`. Em mudanças visuais, revise desktop e mobile no preview.

## Estrutura principal

```text
client/
  index.html                 # HTML base, metadados e fontes
  public/
    assets/hclin/            # Imagens persistentes empacotadas no build
  src/
    App.tsx                  # Rotas e composição global
    index.css                # Tokens, identidade visual, animações e responsividade
    main.tsx                 # Bootstrap da aplicação
    pages/
      Home.tsx               # Landing page e dados institucionais
      Privacy.tsx            # Política de Privacidade e Cookies
      NotFound.tsx           # Página 404 alinhada à marca
    components/
      ui/                    # Primitivos reutilizáveis
      Map.tsx                # Integração de mapa do template
    contexts/                # Contextos globais
    hooks/                   # Hooks compartilhados
    lib/                     # Utilitários
server/
  index.ts                   # Compatibilidade do template; não alterar em tarefas frontend
shared/
  const.ts                  # Constantes compartilhadas
CLAUDE.md                    # Documentação histórica/compatibilidade
claude.md                    # Guia atual de manutenção
ideas.md                     # Direção visual e decisões de design
research-notes.md            # Descobertas e decisões verificadas
todo.md                     # Checklist do projeto
vercel.json                  # Configuração de hospedagem estática
```

## Rotas e navegação

| Rota | Uso |
|---|---|
| `/` | Landing page completa da HCLIN. |
| `/privacidade` | Política de Privacidade e Cookies. |
| `/404` | Página de não encontrado. |
| Qualquer outra rota | Fallback para a página 404. |

O cabeçalho deve permanecer limpo e mostrar somente as abas essenciais: **A HCLIN**, **Especialidades**, **Equipe**, **Localização** e **Contato**. Dicas, Convênios, Avaliações e FAQ permanecem acessíveis na própria página ou por CTAs contextuais.

## Identidade visual

A direção visual é **Cuidado em Camadas**, inspirada em uma clínica integrada, acolhedora e editorial.

| Elemento | Diretriz |
|---|---|
| Fundo principal | Marfim quente, próximo de `#f7f4ed`. |
| Cor de autoridade | Azul-petróleo profundo, próximo de `#0f4c5c`. |
| Acento | Champagne/dourado discreto, próximo de `#c7a96b` e `#9d8152`. |
| Títulos | Fraunces ou fonte editorial equivalente configurada no projeto. |
| Corpo | Sans-serif legível, com contraste e espaçamento confortáveis. |
| Marca | Símbolo H+ da clínica, sem substituir por ícone genérico. |
| Motivos | Arcos, linhas finas, camadas translúcidas, textura sutil e recortes editoriais. |

Evite roxo genérico, gradientes chamativos, excesso de cards iguais, excesso de bordas arredondadas e layouts completamente centralizados. Pergunta-guia: **esta decisão reforça ou dilui o cuidado integrado da HCLIN?**

## Conteúdo institucional

Nomes, registros, especialidades, biografias e horários devem ser tratados como conteúdo verificável. Não invente profissionais, qualificações ou horários. Quando algo não estiver confirmado, escreva **“a confirmar com a clínica”**.

Não criar avaliações, notas ou depoimentos fictícios. O espaço de avaliações deve receber apenas relatos reais, autorizados e revisados pela clínica.

Dados públicos atualmente utilizados:

> Av. Eliomar Meira Xavier, 389 — Telêmaco Borba, Paraná.

> WhatsApp oficial: +55 (42) 98867-6700.

O perfil social principal é [@hclin_integrada](https://www.instagram.com/hclin_integrada/). Não coletar conteúdo privado, contornar bloqueios ou reutilizar retratos sem autorização de uso.

## Imagens e assets

Os assets atualmente usados pela aplicação estão localizados em `client/public/assets/hclin/` e são referenciados por caminhos públicos como `/assets/hclin/hero.webp` e `/assets/hclin/mark.png`. Essa abordagem garante que as imagens sejam incluídas no build estático e carreguem corretamente na Vercel.

Arquivos atuais incluem a imagem da hero, sala, padrão, símbolo H+ e retratos da equipe. Para novas imagens:

1. Preserve o enquadramento e a identidade visual da clínica.
2. Não reutilize a mesma foto em áreas diferentes sem motivo claro.
3. Use `loading="lazy"` e `decoding="async"` em imagens não críticas.
4. Mantenha skeleton loading, fallback de erro e `alt` descritivo na equipe.
5. Use zoom sutil e respeite `prefers-reduced-motion`.
6. Não remover ou adicionar elementos de uma foto sem autorização e sem revisão visual.
7. Confirme, no build final, que o arquivo está dentro de `dist/public/assets/hclin/`.

A imagem da hero é crítica para a primeira dobra e deve manter proporção equilibrada, sem ficar escondida pelo header fixo ou encostar visualmente na seção seguinte.

## WhatsApp e conversões

Todos os links de WhatsApp devem usar o helper `whatsappLink()`, abrir com `target="_blank"` e `rel="noreferrer"`, e registrar o evento `whatsapp_conversion` com um `source` anônimo. Nunca enviar nome, telefone, mensagem ou qualquer outro dado pessoal ao analytics.

Os pontos principais de conversão são formulário, botão flutuante, menu mobile, CTAs de especialidades, convênios, rodapé e dúvidas institucionais. Novos CTAs devem utilizar uma origem curta e estável, como `specialty_cta` ou `footer_whatsapp`.

## Consentimento, privacidade e analytics

O Umami é opcional e só pode ser carregado após aceite de analytics no banner. A preferência é persistida em `localStorage` pela chave `hclin-analytics-consent`, usando `accepted` ou `rejected`.

Regras obrigatórias:

- Não carregar o script do Umami automaticamente no `client/index.html`.
- Não registrar eventos antes do consentimento.
- Não enviar dados pessoais ao Umami.
- Manter **Aceitar analytics**, **Recusar** e **Preferências de cookies**.
- Manter o link para `/privacidade` no banner e no rodapé.
- O rodapé deve permitir revogar a escolha e reabrir o banner.
- Respeitar foco, contraste e `prefers-reduced-motion`.

O texto de privacidade é técnico e informativo. Alterações sobre finalidades, retenção, controlador ou canal de privacidade devem ser revisadas pela clínica e, quando necessário, por profissional especializado em LGPD.

## Acessibilidade e interação

Use HTML semântico, `alt` em imagens, `aria-label` em controles somente com ícone, foco visível e navegação completa por teclado. Modais devem fechar por botão, clique fora e Escape, bloquear a rolagem enquanto abertos e, quando possível, devolver o foco ao elemento de origem.

A rolagem por âncoras deve manter os títulos abaixo do header fixo. O projeto utiliza offset aproximado de 104px; se a altura do header mudar, revise `scroll-padding-top` e `scroll-margin-top` em `client/src/index.css`.

Respeite `prefers-reduced-motion` para hover, skeleton shimmer, carrosséis, modais, banner de cookies e botão Voltar ao topo. Informação importante não pode depender apenas de hover.

## Mapa e localização

A seção de localização deve manter o endereço completo, um link externo para o Google Maps e um mapa responsivo com altura compacta. Não solicitar chave do Google Maps ao usuário; usar a integração prevista no template ou o fallback já implementado.

## Fluxo de desenvolvimento

Antes de alterar a interface, leia `ideas.md` e preserve a direção visual. Prefira mudanças pequenas, coesas e baseadas em dados reutilizáveis. Em tarefas frontend estáticas, não modificar `server/`, schemas, banco ou endpoints.

Após implementar:

1. Executar `pnpm check`.
2. Executar `pnpm build`.
3. Revisar desktop e mobile.
4. Testar âncoras, menu mobile, modal de equipe, FAQ, carrosséis, WhatsApp, consentimento e `/privacidade`.
5. Confirmar que não há erros de console ou imagens quebradas.
6. Atualizar `research-notes.md` e `todo.md` quando houver decisões relevantes.
7. Salvar checkpoint antes da entrega.
8. Para GitHub, revisar o diff, confirmar a branch e enviar somente arquivos necessários.

Não publicar diretamente pelo código. Após o checkpoint, a publicação deve ser feita pelo botão **Publish** do painel do projeto.

## Segurança e critérios de aceite

Nunca inserir segredos, tokens, chaves privadas ou dados de pacientes no repositório. Não adicionar dados de teste que pareçam pacientes reais. Não usar comandos destrutivos como `git reset --hard`; para recuperação, usar o histórico de checkpoints.

Uma alteração está pronta quando preserva a identidade HCLIN, funciona em desktop e mobile, não apresenta sobreposição do header, mantém WhatsApp e consentimento operacionais, não inventa conteúdo clínico ou depoimentos, passa em `pnpm check` e `pnpm build`, e possui checkpoint salvo para recuperação ou publicação.

## Repositório remoto

O código é sincronizado com [Alves1986/hclinsaude](https://github.com/Alves1986/hclinsaude), usando a branch `main`.
