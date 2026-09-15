# Próximas melhorias

- [x] Adicionar seção editável de equipe com placeholders para foto, nome, função e especialidade.
- [x] Adicionar FAQ com expansão animada, semântica acessível e conteúdo inicial revisável.
- [x] Adicionar botão flutuante do WhatsApp, responsivo e acessível, visível em toda a página.
- [x] Validar desktop, mobile, teclado, build e rotas após as alterações.

## Levantamento do Instagram

- [x] Acessar o perfil da HCLIN pelo navegador e verificar se o conteúdo está disponível.
- [x] Coletar somente imagens públicas e profissionais identificáveis com segurança. Os nomes públicos encontrados foram registrados; fotos individuais aguardam arquivos autorizados.
- [x] Atualizar a seção de equipe e os assets apenas com informações confirmadas. A seção agora exibe Veridiana Silveira Wojcickoski, Taise Pinheiro e Gabrielle Alves, mantendo placeholders de foto.
- [ ] Validar e salvar uma nova versão do projeto após a atualização.

## Nova evolução solicitada

- [x] Implementar smooth scroll nos links do cabeçalho e menu mobile.
- [x] Ampliar a equipe com os profissionais identificados nas imagens fornecidas, incluindo Hellen Fernanda e demais nomes legíveis.
- [x] Adicionar seção de convênios com os convênios visíveis no material fornecido, mantendo aviso para confirmar a cobertura vigente.
- [x] Adicionar carrossel animado preparado para avaliações reais/autorizadas; nenhum testemunho fictício foi criado.
- [x] Organizar, subir e enquadrar as imagens dos profissionais com tratamento mais profissional e responsivo.
- [x] Validar todas as rotas, acessibilidade, mobile, smooth scroll, carrossel e build.

## Ajuste da seção de convênios

- [x] Remover a imagem da seção de convênios.
- [x] Implementar carrossel horizontal looping com os convênios.
- [x] Validar pausa, responsividade, acessibilidade e build.

## Nova evolução institucional

- [x] Adicionar links das redes sociais e horário de funcionamento no rodapé.
- [x] Criar seção detalhada de especialidades e serviços com ícones representativos.
- [x] Criar seção de localização com endereço completo e mapa interativo do Google Maps.
- [x] Validar links, mapa, responsividade, acessibilidade e build.

## Engajamento e navegação

- [x] Refinar o hover dos cards de especialidades para destacar serviço e CTA.
- [x] Criar seção de Dicas de Saúde com orientações gerais e aviso educativo.
- [x] Adicionar botão Voltar ao topo com aparição durante a rolagem e suporte acessível.
- [x] Validar responsividade, teclado, movimento reduzido e build.

## Rastreamento de conversões

- [x] Criar helper de evento para registrar cliques que abrem o WhatsApp no analytics existente.
- [x] Instrumentar botão flutuante, formulário, CTAs de especialidades, convênios, equipe e demais links de contato.
- [x] Validar o evento no navegador sem enviar dados pessoais, além de validar responsividade e build.

## Privacidade e performance

- [x] Criar banner de consentimento com aceitar, recusar e revisão da preferência de analytics.
- [x] Carregar o script do Umami somente após consentimento para analytics.
- [x] Aplicar lazy loading nas imagens da equipe, convênios e demais imagens não críticas.
- [x] Validar persistência da escolha, acessibilidade, carregamento e build.

## Política e preferências de cookies

- [x] Criar rota pública de Política de Privacidade e Cookies em português.
- [x] Vincular a política ao banner de consentimento.
- [x] Adicionar entrada animada suave no banner, respeitando movimento reduzido.
- [x] Adicionar no rodapé o controle para revisar ou revogar preferências.
- [x] Validar rota, acessibilidade, persistência e build.

## Limpeza visual das fotos da equipe

- [x] Identificar os arquivos originais das profissionais usados na landing page.
- [x] Remover textos, selos e informações sobrepostas preservando rostos, poses, fundo e identidade HCLIN.
- [x] Substituir os assets no armazenamento do projeto e atualizar referências se necessário.
- [x] Validar a seção de equipe em desktop, mobile e build.

## Interação com a equipe

- [x] Adicionar zoom suave nas fotos das profissionais com suporte a movimento reduzido.
- [x] Tornar os cards da equipe clicáveis e abrir modal acessível com foco e fechamento por teclado.
- [x] Exibir biografia e horários confirmados; usar “a confirmar” onde a clínica ainda não forneceu dados oficiais.
- [x] Validar modal em desktop/mobile, foco, fechamento, WhatsApp e build.

## Skeleton loading da equipe

- [x] Exibir placeholder skeleton enquanto cada foto profissional carrega.
- [x] Fazer a transição suave do skeleton para a imagem carregada e tratar erro de imagem.
- [x] Validar desktop, mobile, acessibilidade, movimento reduzido e build.

## Refinamento do mapa

- [x] Reduzir a altura do mapa e harmonizar sua proporção com o bloco de endereço.
- [x] Validar interatividade, desktop, mobile e build após o ajuste.

## Ajuste da navegação com header fixo

- [x] Corrigir o offset das âncoras para evitar que o header cubra os títulos das seções.
- [x] Validar links do cabeçalho e menu mobile em diferentes tamanhos de tela.
- [x] Confirmar build e rolagem suave após o ajuste.

## Sincronização com GitHub

- [x] Verificar o repositório remoto Alves1986/hclinsaude e a branch padrão.
- [x] Criar commit com a versão atual do projeto.
- [x] Enviar o commit para o GitHub e confirmar a referência remota.

## Navegação mais limpa

- [x] Reduzir o cabeçalho às abas essenciais: A HCLIN, Especialidades, Equipe, Localização e Contato.
- [x] Remover Dicas, Convênios, Avaliações e FAQ da navegação principal, mantendo acesso contextual na página.
- [x] Aplicar a mesma simplificação ao menu mobile sem perder acessibilidade.
- [x] Validar links, rolagem suave, desktop, mobile e build.

## Ajuste da primeira dobra

- [x] Reequilibrar a altura da hero para ocupar melhor a tela inicial.
- [x] Ajustar o espaçamento inferior para evitar que a seção seguinte apareça cortada ou invada a hero.
- [x] Validar desktop, mobile, contraste, CTA e build.

## Documentação do sistema

- [x] Mapear stack, rotas, integrações e regras atuais do sistema.
- [x] Criar `CLAUDE.md` na raiz com instruções para futuras alterações.
- [x] Revisar o documento e confirmar que ele não expõe segredos ou dados sensíveis.

## Encerramento provisório

- [x] Verificar o diff final e o remoto GitHub.
- [x] Enviar a versão com `CLAUDE.md` para a branch `main`.
- [x] Confirmar o commit remoto e deixar o projeto encerrado por enquanto.

## Favicon e deploy Vercel

- [x] Diagnosticar por que a Vercel está exibindo ou tentando executar `server/index.ts`.
- [x] Adicionar favicon com o símbolo H+ da clínica.
- [x] Configurar o build estático para a Vercel usar `dist/public` e não o servidor Express.
- [x] Validar build, favicon, rotas e enviar a correção ao GitHub.

## Assets para Vercel

- [x] Mapear referências `/manus-storage` usadas pela página e localizar os arquivos originais.
- [x] Criar cópias otimizadas em um caminho servido pela própria Vercel.
- [x] Substituir as referências de imagens e validar todas as rotas e imagens no build.
- [ ] Enviar a correção ao GitHub e confirmar o commit remoto.

## Documentação claude.md e sincronização

- [x] Criar e revisar `claude.md` com a arquitetura e regras atuais do projeto.
- [x] Validar TypeScript, build e consistência entre `CLAUDE.md` e `claude.md`.
- [ ] Commitar e enviar a documentação atualizada para `Alves1986/hclinsaude` na branch `main`.
