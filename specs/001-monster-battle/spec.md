# Feature Specification: Cadastro e Batalha de Monstros

**Feature Branch**: `main`

**Created**: 2026-08-07

**Status**: Draft

**Input**: Cadastro de monstros com imagens predefinidas geradas por IA ou imagens enviadas pelo
jogador, batalha automática por atributos, seleção arcade de lutadores e reprodução dos rounds em uma
linha do tempo com identidade de jogo de cartas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar um monstro (Priority: P1)

Como jogador, quero cadastrar um monstro com nome, atributos e uma imagem escolhida em um catálogo já
disponível ou enviada do meu dispositivo para formar uma coleção local que possa ser usada em batalhas.

**Why this priority**: Monstros válidos são a unidade básica do produto e pré-requisito para qualquer
batalha.

**Independent Test**: O jogador cadastra um monstro com uma imagem do catálogo e outro com uma imagem
enviada, encerra e reabre a experiência no mesmo dispositivo e encontra os mesmos dados e imagens.

**Acceptance Scenarios**:

1. **Given** que o jogador está no cadastro, **When** informa nome, ataque, defesa, velocidade, vida e
   escolhe uma imagem disponível no catálogo, **Then** o monstro é salvo e aparece na coleção com todos
   os dados.
2. **Given** que o jogador está no cadastro, **When** envia uma imagem válida do dispositivo e informa
   os demais campos, **Then** o monstro é salvo e a imagem enviada aparece em sua carta.
3. **Given** que um campo obrigatório está vazio ou inválido, **When** tenta salvar, **Then** o cadastro
   não é concluído e cada problema é indicado junto ao campo correspondente.
4. **Given** que monstros com imagens do catálogo e enviadas foram salvos, **When** o jogador retorna em
   outra sessão no mesmo dispositivo, **Then** todos os dados e imagens continuam disponíveis.

---

### User Story 2 - Batalhar com dois monstros (Priority: P2)

Como jogador, quero escolher dois monstros diferentes da coleção e iniciar uma batalha para descobrir
o vencedor de acordo com seus atributos.

**Why this priority**: A batalha transforma os monstros cadastrados na principal experiência de jogo.

**Independent Test**: Com dois monstros conhecidos, o jogador inicia a batalha e confirma que todos os
rounds, danos e pontos de vida seguem exatamente as regras definidas.

**Acceptance Scenarios**:

1. **Given** dois monstros diferentes selecionados, **When** a batalha começa, **Then** todos os rounds
   são calculados de uma vez, sem novas decisões do jogador.
2. **Given** velocidades diferentes, **When** a batalha é calculada, **Then** o monstro mais veloz ataca
   primeiro em cada round.
3. **Given** velocidades iguais e ataques diferentes, **When** a batalha é calculada, **Then** o monstro
   com maior ataque ataca primeiro em cada round.
4. **Given** velocidade e ataque iguais, **When** a batalha é calculada, **Then** o monstro escolhido na
   primeira posição ataca primeiro em cada round.
5. **Given** um atacante com ataque maior que a defesa do oponente, **When** ele ataca, **Then** o dano é
   ataque menos defesa; caso contrário, o dano é exatamente 1.
6. **Given** que o primeiro ataque do round reduz a vida do defensor a zero, **When** o round é
   processado, **Then** o defensor não contra-ataca e o atacante vence imediatamente.

---

### User Story 3 - Selecionar lutadores em uma tela arcade (Priority: P3)

Como jogador, quero escolher os dois combatentes em uma tela de seleção inspirada em jogos de luta
arcade para sentir que estou preparando um confronto, sem violência gráfica.

**Why this priority**: A seleção conecta a coleção à batalha e estabelece a identidade visual do jogo
antes do confronto começar.

**Independent Test**: Com pelo menos dois monstros cadastrados, o jogador navega pela grade, identifica
os dois lados do confronto, seleciona um monstro para cada lado e inicia a batalha.

**Acceptance Scenarios**:

1. **Given** uma coleção com monstros, **When** a seleção é aberta, **Then** o jogador vê uma grade de
   retratos animados, dois espaços de lutador e uma atmosfera de torneio arcade colorida e não sangrenta.
2. **Given** que o jogador destaca um monstro, **When** percorre a grade, **Then** vê sua carta ampliada,
   seus atributos e uma animação breve de destaque.
3. **Given** dois monstros distintos selecionados, **When** confirma o confronto, **Then** a batalha é
   calculada e a tela de reprodução é apresentada.
4. **Given** apenas um lutador selecionado ou o mesmo monstro nos dois lados, **When** tenta confirmar,
   **Then** o confronto não começa e o problema é indicado claramente.

---

### User Story 4 - Reproduzir e explorar a batalha (Priority: P4)

Como jogador, quero acompanhar uma apresentação inspirada em batalhas de cartas usando as imagens e os
atributos dos monstros, navegar pelos rounds e reproduzir todos os eventos para entender como o vencedor
foi determinado sem analisar cálculos manualmente.

**Why this priority**: A apresentação dá clareza e personalidade ao resultado, mas depende do cadastro
e das regras de batalha já funcionarem corretamente.

**Independent Test**: Após iniciar uma batalha conhecida, o jogador navega para frente e para trás por
todos os rounds e aciona Play para ver cada ataque em ordem, com intervalo de 3 segundos, até o vencedor.

**Acceptance Scenarios**:

1. **Given** uma batalha calculada, **When** a reprodução é aberta, **Then** a área de confronto apresenta
   cada monstro como uma carta e uma linha do tempo com um marcador para cada round.
2. **Given** qualquer round da batalha, **When** o jogador avança, retrocede ou escolhe seu marcador,
   **Then** as cartas exibem o estado de vida e os eventos correspondentes àquele round.
3. **Given** a linha do tempo pronta, **When** o jogador aciona Play, **Then** todos os eventos são
   apresentados em ordem cronológica, com 3 segundos entre o início de um evento e o próximo.
4. **Given** um evento de ataque em reprodução, **When** ele é apresentado, **Then** atacante, defensor,
   dano e redução de vida recebem efeitos visuais distintos e não sangrentos.
5. **Given** que o evento final reduz uma vida a zero, **When** ele é apresentado, **Then** a reprodução
   termina e o resultado identifica automaticamente vencedor e derrotado.
6. **Given** que o jogador prefere movimento reduzido, **When** visualiza a batalha, **Then** recebe a
   mesma sequência, estados e resultado com transições reduzidas, sem perder conteúdo.

### Edge Cases

- Um monstro com ataque igual ou menor que a defesa adversária sempre causa 1 ponto de dano.
- Um ataque que ultrapassa a vida restante exibe vida final igual a zero, nunca negativa.
- Se os dois monstros têm velocidade e ataque iguais, a primeira posição de seleção desempata a ordem.
- O segundo atacante não contra-ataca quando é derrotado pelo primeiro ataque do round.
- O jogador não pode selecionar o mesmo cadastro nas duas posições da batalha.
- A batalha não pode começar com menos de dois monstros válidos disponíveis.
- Se uma imagem do catálogo ficar indisponível, o sistema impede o cadastro com essa opção e orienta o
  jogador a escolher outra.
- Arquivos enviados ausentes, corrompidos, acima do limite ou em formato não aceito são rejeitados com
  orientação para escolher outra imagem.
- Nomes compostos apenas por espaços, atributos fracionários, negativos ou fora do limite são rejeitados.
- Uma coleção vazia apresenta orientação clara para cadastrar o primeiro monstro.
- Uma batalha de um único round ainda apresenta início, eventos e resultado na linha do tempo.
- Ao tentar retroceder no primeiro round ou avançar após o último, a linha do tempo permanece no limite.
- Acionar Play novamente durante uma reprodução reinicia a sequência desde o primeiro evento.
- A navegação manual durante a reprodução interrompe a sequência e preserva o round escolhido.
- Uma batalha com muitos rounds mantém todos os marcadores acessíveis sem reduzir sua legibilidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir cadastrar um monstro com `name`, `attack`, `defense`, `speed`,
  `hp` e `image_url`.
- **FR-002**: `name` MUST conter de 1 a 80 caracteres visíveis após remover espaços nas extremidades.
- **FR-003**: `attack`, `defense` e `speed` MUST aceitar somente números inteiros entre 0 e 9.999.
- **FR-004**: `hp` MUST aceitar somente números inteiros entre 1 e 9.999.
- **FR-005**: O sistema MUST incluir um catálogo inicial com pelo menos 6 imagens de monstros visualmente
  distintas, geradas por IA durante a criação do projeto e disponíveis antes do primeiro cadastro.
- **FR-006**: O jogador MUST poder escolher uma imagem do catálogo ou enviar uma imagem JPEG, PNG ou
  WebP de até 10 MB a partir do próprio dispositivo.
- **FR-007**: O sistema MUST rejeitar arquivos enviados ausentes, ilegíveis, acima de 10 MB ou fora dos
  formatos aceitos e MUST apresentar uma mensagem acionável.
- **FR-008**: O sistema MUST manter em `image_url` uma referência estável para a imagem escolhida ou
  enviada e MUST preservar o arquivo enviado e sua associação entre sessões no mesmo dispositivo.
- **FR-009**: O sistema MUST exibir a coleção local com imagem, nome e atributos de cada monstro.
- **FR-010**: O jogador MUST selecionar exatamente dois monstros distintos antes de iniciar uma batalha.
- **FR-011**: O sistema MUST determinar uma ordem fixa de ataque no início da batalha: maior `speed`;
  em empate, maior `attack`; persistindo o empate, o monstro da primeira posição de seleção.
- **FR-012**: Em cada round, o primeiro monstro da ordem MUST atacar e, se o oponente permanecer com
  vida, o segundo MUST contra-atacar.
- **FR-013**: O dano de cada ataque MUST ser `attack - defense` quando o resultado for maior que zero;
  em qualquer outro caso, MUST ser 1.
- **FR-014**: Cada ataque MUST reduzir o `hp` atual do defensor pelo dano calculado, limitando o valor
  exibido a no mínimo zero.
- **FR-015**: A batalha MUST continuar automaticamente até o primeiro ataque que reduza o `hp` de um
  monstro a zero.
- **FR-016**: Todos os rounds MUST ser calculados em uma única execução após o início da batalha, sem
  entrada adicional do jogador e sem alterar o `hp` original salvo dos monstros.
- **FR-017**: O monstro que primeiro reduzir o `hp` do oponente a zero MUST ser declarado vencedor.
- **FR-018**: O sistema MUST registrar, para consulta durante o resultado, o número do round, atacante,
  defensor, dano e vida restante após cada ataque.
- **FR-019**: Após o cálculo, o sistema MUST iniciar automaticamente a apresentação da batalha e exibir
  sua linha do tempo sem exigir uma ação adicional.
- **FR-020**: A apresentação MUST representar cada monstro como uma carta de batalha contendo imagem,
  nome, ataque, defesa, velocidade e vida.
- **FR-021**: A apresentação MUST comunicar visualmente cada ataque, o dano, a vida restante e o vencedor
  por meio do estado e da interação entre as duas cartas.
- **FR-022**: Todas as informações da batalha MUST permanecer compreensíveis sem movimento, com suporte
  a preferência de movimento reduzido, sem depender apenas de animação, cor ou efeitos visuais.
- **FR-023**: Cadastro, seleção, início da batalha, histórico de rounds e resultado MUST ser operáveis
  por teclado, possuir foco visível e nomes acessíveis.
- **FR-024**: O sistema MUST apresentar estados claros de coleção vazia, validação, processamento,
  resultado e falha recuperável.
- **FR-025**: A experiência MUST usar uma identidade visual original de castelo medieval convertido em
  arena de monstros, combinando pedra escura, pergaminho, couro, bronze, brasões e magia colorida com
  contrastes claros para cada lado do confronto, estados de vida e vitória.
- **FR-026**: Cor MUST NOT ser o único meio de comunicar seleção, atacante, dano, perigo, derrota ou
  vitória; texto, forma, ícone ou mudança de estado MUST fornecer a informação equivalente.
- **FR-027**: A seleção de lutadores MUST apresentar os monstros em uma grade de retratos, com dois
  espaços claramente identificados para os lados do confronto e uma prévia ampliada do item em foco.
- **FR-028**: A tela de seleção MUST usar animações estilizadas e atmosfera de torneio medieval, com a
  energia e clareza de uma seleção arcade, sem copiar identidade de franquias e sem sangue, ferimentos
  explícitos, desmembramento ou imagens de violência gráfica.
- **FR-029**: Destacar, selecionar, remover e confirmar um lutador MUST produzir feedback visual
  distinto, preservando operação por teclado e preferência de movimento reduzido.
- **FR-030**: A batalha MUST apresentar uma linha do tempo ordenada com um marcador identificável para
  cada round e os respectivos eventos de ataque agrupados nesse marcador.
- **FR-031**: O jogador MUST poder selecionar qualquer round e avançar ou retroceder um round por vez;
  as cartas MUST refletir os pontos de vida e os eventos no ponto selecionado.
- **FR-032**: A linha do tempo MUST impedir navegação antes do primeiro ou depois do último round e MUST
  informar visualmente quando um controle está indisponível.
- **FR-033**: Um controle Play MUST reproduzir todos os eventos desde o início em ordem cronológica,
  iniciando um novo evento exatamente 3 segundos após o anterior, até o evento final.
- **FR-034**: Acionar Play durante a reprodução MUST reiniciar a sequência desde o primeiro evento;
  navegar manualmente MUST interromper a reprodução no round escolhido.
- **FR-035**: Cada evento MUST aplicar efeitos visuais identificáveis ao ataque, ao impacto, ao valor do
  dano, à redução de vida e, quando aplicável, à derrota e à vitória.
- **FR-036**: Os efeitos MUST ser estilizados, animados e não sangrentos e MUST NOT representar ferimentos
  explícitos, desmembramento ou violência gráfica.
- **FR-037**: Ao apresentar o último evento, por reprodução ou navegação manual, o sistema MUST revelar
  automaticamente vencedor, derrotado e resumo final.
- **FR-038**: A linha do tempo, seus marcadores e seus controles MUST ser operáveis por teclado, possuir
  foco visível e expor texto equivalente para cada mudança de estado e efeito visual.
- **FR-039**: Cadastro, coleção, seleção e batalha MUST permanecer integralmente utilizáveis sem overflow
  horizontal de página em viewports de referência mobile (375x812), tablet (768x1024) e desktop
  (1440x900), reorganizando cartas, painéis e controles sem ocultar conteúdo ou ações.
- **FR-040**: Cadastro/coleção, seleção de lutadores e batalha MUST possuir checkpoints visuais separados
  com screenshots nos três viewports de referência; cada etapa MUST registrar aprovação ou ajustes
  solicitados pelo responsável do produto antes de a próxima etapa visual ser considerada concluída.
- **FR-041**: O jogador MUST poder remover todos os monstros convocados e suas imagens enviadas por uma
  ação explícita, confirmada e atômica, sem alterar o esquema do banco local.
- **FR-042**: O jogador MUST poder excluir todo o banco de dados local por uma ação destrutiva separada e
  confirmada; após a exclusão, a aplicação MUST recriar um banco vazio e continuar utilizável.
- **FR-043**: As ações de dados locais MUST permanecer recolhidas sob um único botão de ícone no
  cabeçalho global, com nome acessível **Gerenciar dados locais**, e abrir em um modal que pergunta qual
  ação executar, fechável por botão ou Escape, com foco devolvido ao acionador.
- **FR-044**: O feedback de cadastro bem-sucedido MUST usar a identidade visual de pergaminho e bronze,
  manter separação clara da ação de salvar e a coleção MUST preservar largura consistente de carta quando
  houver um ou vários monstros, usando largura fluida apenas em telas estreitas.
- **FR-045**: Após qualquer limpeza de dados locais concluída em seleção ou batalha, a aplicação MUST
  voltar ao cadastro e descartar a seleção ativa para não exibir referências a monstros removidos.
- **FR-046**: Uma batalha cujo primeiro ataque já seja letal MUST concluir o playback imediatamente,
  revelar o resultado e remover estados transitórios de ataque, impacto e pausa sem agendar outro evento.
- **FR-047**: O sucesso de cadastro ou limpeza MUST ser confirmado pelo resultado do respectivo caso de
  uso e MUST NOT ser convertido em falha por um erro posterior ao atualizar projeções de leitura.
- **FR-048**: Resultados assíncronos iniciados antes de navegação, limpeza ou reinício de sessão MUST NOT
  sobrescrever o estado mais recente; comandos destrutivos, cadastro e início de batalha MUST impedir
  concorrência incompatível.
- **FR-049**: O cadastro com imagem do catálogo MUST validar a existência da referência antes de
  persistir; falhas transitórias do manifesto MUST permitir nova tentativa e MUST NOT impedir a exibição
  de monstros locais carregados com sucesso.
- **FR-050**: Falhas de leitura de upload, carregamento de imagem ou limpeza MUST produzir feedback
  acionável na própria superfície e MUST NOT deixar carregamento infinito ou rejeições silenciosas.
- **FR-051**: Factories públicas do domínio MUST rejeitar datas inválidas, HP inicial não positivo, HP
  final negativo, atacante derrotado, ordem de ataque inconsistente e dano diferente da regra da batalha;
  aggregates declarados imutáveis MUST proteger também valores mutáveis em runtime.

### Key Entities

- **Monster**: Combatente cadastrado localmente; possui nome, ataque, defesa, velocidade, vida máxima e
  referência para uma imagem do catálogo ou enviada. Seus atributos salvos não são consumidos pelas
  batalhas.
- **Monster Image**: Arte visual associada a um monstro; pode ser uma opção pré-cadastrada gerada por IA
  ou um arquivo enviado pelo jogador e preservado localmente, sempre com referência estável.
- **Battle**: Confronto imutável entre dois monstros selecionados; contém a ordem de ataque, os estados
  temporários de vida, a sequência completa de ataques, o vencedor e o derrotado.
- **Attack Event**: Registro de uma ação dentro de um round; identifica round, atacante, defensor,
  dano aplicado e vida restante do defensor.
- **Round**: Agrupamento ordenado de um ou dois eventos de ataque; registra o estado inicial e final da
  vida dos combatentes e ocupa um marcador na linha do tempo.
- **Battle Playback**: Estado de exploração da batalha; identifica round e evento ativos, situação de
  reprodução e resultado revelado, sem modificar os eventos calculados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 90% dos novos jogadores conseguem cadastrar o primeiro monstro válido em até
  2 minutos, sem ajuda externa.
- **SC-002**: Em 100% dos cenários de regras automatizados, ordem, dano, vida restante e vencedor
  correspondem ao algoritmo especificado.
- **SC-003**: Para monstros dentro dos limites permitidos, 95% das batalhas exibem a tela de reprodução
  e a linha do tempo completa em até 1 segundo após o comando de início.
- **SC-004**: Em 100% das batalhas concluídas, o jogador consegue identificar vencedor e derrotado e
  consultar todos os ataques realizados.
- **SC-005**: Cadastro, seleção, batalha e resultado podem ser concluídos somente por teclado em 100%
  dos cenários principais.
- **SC-006**: Uma coleção com pelo menos 100 monstros permanece navegável, e uma batalha entre quaisquer
  dois deles pode ser iniciada em até 30 segundos por pelo menos 90% dos jogadores em teste.
- **SC-007**: A experiência mantém todas as informações essenciais e o resultado correto quando
  animações estão desativadas ou reduzidas.
- **SC-008**: Em 100% dos testes de continuidade entre sessões no mesmo dispositivo, imagens enviadas
  permanecem visíveis na coleção, na seleção e nas cartas de batalha.
- **SC-009**: Em 100% das batalhas de teste, a linha do tempo contém todos os rounds na ordem correta e
  permite alcançar qualquer round para frente ou para trás.
- **SC-010**: Em reprodução automática, 100% dos eventos começam na ordem correta, com intervalo de
  3 segundos, e o vencedor é revelado após o último evento.
- **SC-011**: Pelo menos 90% dos jogadores em teste identificam corretamente os dois lutadores, o evento
  ativo, o dano, a vida restante e o vencedor na primeira tentativa.
- **SC-012**: Seleção, navegação da linha do tempo e reprodução preservam 100% das informações essenciais
  quando animações estão reduzidas.

## Assumptions

- A primeira versão é individual, local ao dispositivo e não inclui contas, autenticação,
  sincronização entre dispositivos, partidas em rede ou compartilhamento público.
- A apresentação visual se inspira em jogos de cartas, mas não inclui construção de baralho, compra de
  cartas, raridade, mana, habilidades especiais ou turnos decididos pelo jogador.
- A referência a jogos de luta arcade descreve composição e energia visual; o produto não reproduz
  personagens, marcas, sons, cenários ou elementos protegidos de uma franquia existente.
- A direção de arte usa fantasia animada, competitiva e apropriada para público geral, sem sangue ou
  violência gráfica.
- Cada intervalo de reprodução é medido entre o início de eventos consecutivos; o primeiro evento começa
  imediatamente após Play.
- O catálogo inicial acompanha o produto e suas artes são geradas por IA como ativos do projeto, não
  durante o uso do produto.
- Imagens enviadas ficam disponíveis somente no dispositivo em que foram cadastradas; sincronização e
  endereços externos informados pelo jogador estão fora do escopo inicial.
- A ordem de ataque é definida uma vez no início e repetida em todos os rounds.
- Se velocidade e ataque empatarem, a primeira posição de seleção é um desempate intencional e visível.
- Os limites de atributos e arquivo mantêm cadastros e batalhas previsíveis para a primeira versão.
- Editar ou excluir monstros e manter um histórico de batalhas estão fora do escopo inicial.
