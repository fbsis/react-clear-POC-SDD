---
name: "speckit-specify"
description: "Create or update the feature specification from a natural language feature description."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/specify.md"
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before specification)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_specify` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `$speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

The text the user typed after `$speckit-specify` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `$ARGUMENTS` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

Given that feature description, do this:

1. **Generate a concise short name** (2-4 words) for the feature:
   - Analyze the feature description and extract the most meaningful keywords
   - Create a 2-4 word short name that captures the essence of the feature
   - Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
   - Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
   - Keep it concise but descriptive enough to understand the feature at a glance
   - Examples:
     - "I want to add user authentication" → "user-auth"
     - "Implement OAuth2 integration for the API" → "oauth2-api-integration"
     - "Create a dashboard for analytics" → "analytics-dashboard"
     - "Fix payment processing timeout bug" → "fix-payment-timeout"

2. **Branch creation** (optional, via hook):

   If a `before_specify` hook ran successfully in the Pre-Execution Checks above, it will have created/switched to a git branch and output JSON containing `BRANCH_NAME` and `FEATURE_NUM`. Note these values for reference, but the branch name does **not** dictate the spec directory name.

   If the user explicitly provided `GIT_BRANCH_NAME`, pass it through to the hook so the branch script uses the exact value as the branch name (bypassing all prefix/suffix generation).

3. **Create the spec feature directory**:

   Specs live under the default `specs/` directory unless the user explicitly provides `SPECIFY_FEATURE_DIRECTORY`.

   **Resolution order for `SPECIFY_FEATURE_DIRECTORY`**:
   1. If the user explicitly provided `SPECIFY_FEATURE_DIRECTORY` (e.g., via environment variable, argument, or configuration), use it as-is
   2. Otherwise, auto-generate it under `specs/`:
      - Check `.specify/init-options.json` for `feature_numbering` (preferred) or `branch_numbering` (deprecated, migration only — will be removed in a future release)
      - If `"timestamp"`: prefix is `YYYYMMDD-HHMMSS` (current timestamp)
      - If `"sequential"` or absent: prefix is `NNN` (next available 3-digit number after scanning existing directories in `specs/`)
      - Construct the directory name: `<prefix>-<short-name>` (e.g., `003-user-auth` or `20260319-143022-user-auth`)
      - Set `SPECIFY_FEATURE_DIRECTORY` to `specs/<directory-name>`
      - If `branch_numbering` was used (and `feature_numbering` was absent), emit a one-line warning: "⚠️ `branch_numbering` in init-options.json is deprecated. Rename to `feature_numbering`."

   **Create the directory and spec file**:
   - `mkdir -p SPECIFY_FEATURE_DIRECTORY`
   - Resolve the active `spec-template` through the Spec Kit preset/template resolution stack (equivalent to `specify preset resolve spec-template`)
   - Copy the resolved `spec-template` file to `SPECIFY_FEATURE_DIRECTORY/spec.md` as the starting point
   - Set `SPEC_FILE` to `SPECIFY_FEATURE_DIRECTORY/spec.md`
   - Persist the resolved path to `.specify/feature.json`:
     ```json
     {
       "feature_directory": "<resolved feature dir>"
     }
     ```
     Write the actual resolved directory path value (for example, `specs/003-user-auth`), not the literal string `SPECIFY_FEATURE_DIRECTORY`.
     This allows downstream commands (`$speckit-plan`, `$speckit-tasks`, etc.) to locate the feature directory without relying on git branch name conventions.

   **IMPORTANT**:
   - You must only create one feature per `$speckit-specify` invocation
   - The spec directory name and the git branch name are independent — they may be the same but that is the user's choice
   - The spec directory and file are always created by this command, never by the hook

4. Load the resolved active `spec-template` file to understand required sections.

5. **IF EXISTS**: Load `.specify/memory/constitution.md` for project principles and governance constraints.

6. Follow this execution flow:
    1. Parse user description from arguments
       If empty: ERROR "No feature description provided"
    2. Extract key concepts from description
       Identify: actors, actions, data, constraints
    3. For unclear aspects:
       - Make informed guesses based on context and industry standards
       - Only mark with [NEEDS CLARIFICATION: specific question] if:
         - The choice significantly impacts feature scope or user experience
         - Multiple reasonable interpretations exist with different implications
         - No reasonable default exists
       - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
       - Prioritize clarifications by impact: scope > security/privacy > user experience > technical details
    4. Fill User Scenarios & Testing section
       If no clear user flow: ERROR "Cannot determine user scenarios"
    5. Generate Functional Requirements
       Each requirement must be testable
       Use reasonable defaults for unspecified details (document assumptions in Assumptions section)
    6. Define Success Criteria
       Create measurable, technology-agnostic outcomes
       Include both quantitative metrics (time, performance, volume) and qualitative measures (user satisfaction, task completion)
       Each criterion must be verifiable without implementation details
    7. Identify Key Entities (if data involved)
    8. Return: SUCCESS (spec ready for planning)

7. Write the specification to SPEC_FILE using the template structure, replacing placeholders with concrete details derived from the feature description (arguments) while preserving section order and headings.

8. **Specification Quality Validation**: After writing the initial spec, validate it against quality criteria:

   a. **Create Spec Quality Checklist**: Generate a checklist file at `SPECIFY_FEATURE_DIRECTORY/checklists/requirements.md` using the checklist template structure with these validation items:

      ```markdown
      # Specification Quality Checklist: [FEATURE NAME]

      **Purpose**: Validate specification completeness and quality before proceeding to planning
      **Created**: [DATE]
      **Feature**: [Link to spec.md]

      ## Content Quality

      - [ ] No implementation details (languages, frameworks, APIs)
      - [ ] Focused on user value and business needs
      - [ ] Written for non-technical stakeholders
      - [ ] All mandatory sections completed

      ## Requirement Completeness

      - [ ] No [NEEDS CLARIFICATION] markers remain
      - [ ] Requirements are testable and unambiguous
      - [ ] Success criteria are measurable
      - [ ] Success criteria are technology-agnostic (no implementation details)
      - [ ] All acceptance scenarios are defined
      - [ ] Edge cases are identified
      - [ ] Scope is clearly bounded
      - [ ] Dependencies and assumptions identified

      ## Feature Readiness

      - [ ] All functional requirements have clear acceptance criteria
      - [ ] User scenarios cover primary flows
      - [ ] Feature meets measurable outcomes defined in Success Criteria
      - [ ] No implementation details leak into specification

      ## Notes

      - Items marked incomplete require spec updates before `$speckit-clarify` or `$speckit-plan`
      ```

   b. **Run Validation Check**: Review the spec against each checklist item:
      - For each item, determine if it passes or fails
      - Document specific issues found (quote relevant spec sections)

   c. **Handle Validation Results**:

      - **If all items pass**: Mark checklist complete and proceed to the Mandatory Post-Execution Hooks section

      - **If items fail (excluding [NEEDS CLARIFICATION])**:
        1. List the failing items and specific issues
        2. Update the spec to address each issue
        3. Re-run validation until all items pass (max 3 iterations)
        4. If still failing after 3 iterations, document remaining issues in checklist notes and warn user

      - **If [NEEDS CLARIFICATION] markers remain**:
        1. Extract all [NEEDS CLARIFICATION: ...] markers from the spec
        2. **LIMIT CHECK**: If more than 3 markers exist, keep only the 3 most critical (by scope/security/UX impact) and make informed guesses for the rest
        3. For each clarification needed (max 3), present options to user in this format:

           ```markdown
           ## Question [N]: [Topic]

           **Context**: [Quote relevant spec section]

           **What we need to know**: [Specific question from NEEDS CLARIFICATION marker]

           **Suggested Answers**:

           | Option | Answer | Implications |
           |--------|--------|--------------|
           | A      | [First suggested answer] | [What this means for the feature] |
           | B      | [Second suggested answer] | [What this means for the feature] |
           | C      | [Third suggested answer] | [What this means for the feature] |
           | Custom | Provide your own answer | [Explain how to provide custom input] |

           **Your choice**: _[Wait for user response]_
           ```

        4. **CRITICAL - Table Formatting**: Ensure markdown tables are properly formatted:
           - Use consistent spacing with pipes aligned
           - Each cell should have spaces around content: `| Content |` not `|Content|`
           - Header separator must have at least 3 dashes: `|--------|`
           - Test that the table renders correctly in markdown preview
        5. Number questions sequentially (Q1, Q2, Q3 - max 3 total)
        6. Present all questions together before waiting for responses
        7. Wait for user to respond with their choices for all questions (e.g., "Q1: A, Q2: Custom - [details], Q3: B")
        8. Update the spec by replacing each [NEEDS CLARIFICATION] marker with the user's selected or provided answer
        9. Re-run validation after all clarifications are resolved

   d. **Update Checklist**: After each validation iteration, update the checklist file with current pass/fail status

## Mandatory Post-Execution Hooks

**You MUST complete this section before reporting completion to the user.**

Check if `.specify/extensions.yml` exists in the project root.
- If it does not exist, or no hooks are registered under `hooks.after_specify`, skip to the Completion Report.
- If it exists, read it and look for entries under the `hooks.after_specify` key.
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue to the Completion Report.
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `$speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Mandatory hook** (`optional: false`) — **You MUST emit `EXECUTE_COMMAND:` for each mandatory hook**:
    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

## Completion Report

Report completion to the user with:
- `SPECIFY_FEATURE_DIRECTORY` — the feature directory path
- `SPEC_FILE` — the spec file path
- Checklist results summary
- Readiness for the next phase (`$speckit-clarify` or `$speckit-plan`)

**NOTE:** Branch creation is handled by the `before_specify` hook (git extension). Spec directory and file creation are always handled by this core command.

## Quick Guidelines

- Focus on **WHAT** users need and **WHY**.
- Avoid HOW to implement (no tech stack, APIs, code structure).
- Written for business stakeholders, not developers.
- DO NOT create any checklists that are embedded in the spec. That will be a separate command.

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")
# Feature Specification: Cadastro e Batalha de Monstros

**Feature Branch**: `main`

**Created**: 2026-08-07

**Status**: Draft

**Input**: Cadastro local de monstros, batalha automática por atributos e visualização 3D do resultado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar um monstro (Priority: P1)

Como jogador, quero cadastrar um monstro com nome, atributos e uma imagem escolhida no meu dispositivo
para formar uma coleção local que possa ser usada em batalhas.

**Why this priority**: Monstros válidos são a unidade básica do produto e pré-requisito para qualquer
batalha.

**Independent Test**: O jogador cadastra um monstro com todos os campos válidos, encerra e reabre a
experiência no mesmo dispositivo e encontra o monstro com os mesmos dados e imagem.

**Acceptance Scenarios**:

1. **Given** que o jogador está no cadastro, **When** informa nome, ataque, defesa, velocidade, vida e
   escolhe uma imagem local válida, **Then** o monstro é salvo e aparece na coleção com todos os dados.
2. **Given** que um campo obrigatório está vazio ou inválido, **When** tenta salvar, **Then** o cadastro
   não é concluído e cada problema é indicado junto ao campo correspondente.
3. **Given** que um monstro foi salvo, **When** o jogador retorna em outra visita no mesmo dispositivo,
   **Then** os dados e a imagem continuam disponíveis.

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

### User Story 3 - Visualizar batalha e resultado em 3D (Priority: P3)

Como jogador, quero acompanhar uma representação tridimensional da batalha usando as imagens dos
monstros e ver automaticamente o vencedor para entender o confronto sem analisar cálculos manualmente.

**Why this priority**: A apresentação dá clareza e personalidade ao resultado, mas depende do cadastro
e das regras de batalha já funcionarem corretamente.

**Independent Test**: Após iniciar uma batalha, o jogador vê os dois monstros em uma arena com sensação
de profundidade, acompanha a progressão visual e recebe o vencedor e o resumo sem outra ação.

**Acceptance Scenarios**:

1. **Given** uma batalha válida, **When** o cálculo termina, **Then** a arena apresenta os dois monstros
   com suas imagens locais, nomes, vida e indicação visual de ataques e danos.
2. **Given** que um monstro chega a zero de vida, **When** a apresentação termina, **Then** o resultado
   identifica automaticamente vencedor e derrotado e permite consultar o resumo dos rounds.
3. **Given** que o jogador prefere movimento reduzido, **When** visualiza a batalha, **Then** recebe a
   mesma informação e resultado com transições reduzidas, sem perder conteúdo.
4. **Given** que efeitos tridimensionais não podem ser apresentados, **When** a batalha é aberta,
   **Then** uma apresentação bidimensional equivalente preserva todas as informações e ações.

### Edge Cases

- Um monstro com ataque igual ou menor que a defesa adversária sempre causa 1 ponto de dano.
- Um ataque que ultrapassa a vida restante exibe vida final igual a zero, nunca negativa.
- Se os dois monstros têm velocidade e ataque iguais, a primeira posição de seleção desempata a ordem.
- O segundo atacante não contra-ataca quando é derrotado pelo primeiro ataque do round.
- O jogador não pode selecionar o mesmo cadastro nas duas posições da batalha.
- A batalha não pode começar com menos de dois monstros válidos disponíveis.
- Arquivos ausentes, corrompidos ou de formato não aceito geram orientação para escolher outra imagem.
- Nomes compostos apenas por espaços, atributos fracionários, negativos ou fora do limite são rejeitados.
- Uma coleção vazia apresenta orientação clara para cadastrar o primeiro monstro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir cadastrar um monstro com `name`, `attack`, `defense`, `speed`,
  `hp` e `image_url`.
- **FR-002**: `name` MUST conter de 1 a 80 caracteres visíveis após remover espaços nas extremidades.
- **FR-003**: `attack`, `defense` e `speed` MUST aceitar somente números inteiros entre 0 e 9.999.
- **FR-004**: `hp` MUST aceitar somente números inteiros entre 1 e 9.999.
- **FR-005**: O jogador MUST escolher uma imagem do dispositivo para concluir o cadastro; o sistema
  MUST manter em `image_url` uma referência local gerenciada para essa imagem.
- **FR-006**: O sistema MUST aceitar imagens JPEG, PNG ou WebP de até 10 MB e MUST rejeitar arquivos
  ausentes, ilegíveis ou fora dessas condições com mensagem acionável.
- **FR-007**: Os monstros cadastrados e suas imagens MUST permanecer disponíveis entre visitas no mesmo
  dispositivo, sem depender de endereço de imagem externo.
- **FR-008**: O sistema MUST exibir a coleção local com imagem, nome e atributos de cada monstro.
- **FR-009**: O jogador MUST selecionar exatamente dois monstros distintos antes de iniciar uma batalha.
- **FR-010**: O sistema MUST determinar uma ordem fixa de ataque no início da batalha: maior `speed`;
  em empate, maior `attack`; persistindo o empate, o monstro da primeira posição de seleção.
- **FR-011**: Em cada round, o primeiro monstro da ordem MUST atacar e, se o oponente permanecer com
  vida, o segundo MUST contra-atacar.
- **FR-012**: O dano de cada ataque MUST ser `attack - defense` quando o resultado for maior que zero;
  em qualquer outro caso, MUST ser 1.
- **FR-013**: Cada ataque MUST reduzir o `hp` atual do defensor pelo dano calculado, limitando o valor
  exibido a no mínimo zero.
- **FR-014**: A batalha MUST continuar automaticamente até o primeiro ataque que reduza o `hp` de um
  monstro a zero.
- **FR-015**: Todos os rounds MUST ser calculados em uma única execução após o início da batalha, sem
  entrada adicional do jogador e sem alterar o `hp` original salvo dos monstros.
- **FR-016**: O monstro que primeiro reduzir o `hp` do oponente a zero MUST ser declarado vencedor.
- **FR-017**: O sistema MUST registrar, para consulta durante o resultado, o número do round, atacante,
  defensor, dano e vida restante após cada ataque.
- **FR-018**: Após o cálculo, o sistema MUST iniciar automaticamente a apresentação da batalha e exibir
  o resultado final sem exigir uma ação adicional.
- **FR-019**: A apresentação MUST representar uma arena com profundidade visual e usar as imagens locais
  dos dois monstros, sem exigir modelos tridimensionais próprios.
- **FR-020**: A apresentação MUST comunicar visualmente cada ataque, o dano, a vida restante e o vencedor.
- **FR-021**: Todas as informações da batalha MUST permanecer compreensíveis sem movimento, com suporte
  a preferência de movimento reduzido e uma apresentação equivalente quando efeitos 3D não estiverem
  disponíveis.
- **FR-022**: Cadastro, seleção, início da batalha, histórico de rounds e resultado MUST ser operáveis
  por teclado, possuir foco visível e nomes acessíveis.
- **FR-023**: O sistema MUST apresentar estados claros de coleção vazia, validação, processamento,
  resultado e falha recuperável.

### Key Entities

- **Monster**: Combatente cadastrado localmente; possui nome, ataque, defesa, velocidade, vida máxima e
  referência para sua imagem local. Seus atributos salvos não são consumidos pelas batalhas.
- **Battle**: Confronto imutável entre dois monstros selecionados; contém a ordem de ataque, os estados
  temporários de vida, a sequência completa de ataques, o vencedor e o derrotado.
- **Attack Event**: Registro de uma ação dentro de um round; identifica round, atacante, defensor,
  dano aplicado e vida restante do defensor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 90% dos novos jogadores conseguem cadastrar o primeiro monstro válido em até
  2 minutos, sem ajuda externa.
- **SC-002**: Em 100% dos cenários de regras automatizados, ordem, dano, vida restante e vencedor
  correspondem ao algoritmo especificado.
- **SC-003**: Para monstros dentro dos limites permitidos, 95% das batalhas exibem o resultado inicial
  em até 1 segundo após o comando de início.
- **SC-004**: Em 100% das batalhas concluídas, o jogador consegue identificar vencedor e derrotado e
  consultar todos os ataques realizados.
- **SC-005**: Cadastro, seleção, batalha e resultado podem ser concluídos somente por teclado em 100%
  dos cenários principais.
- **SC-006**: Uma coleção com pelo menos 100 monstros permanece navegável, e uma batalha entre quaisquer
  dois deles pode ser iniciada em até 30 segundos por pelo menos 90% dos jogadores em teste.
- **SC-007**: A experiência mantém todas as informações essenciais e o resultado correto com movimento
  reduzido ou apresentação 3D indisponível.

## Assumptions

- A primeira versão é individual, local ao dispositivo e não inclui contas, autenticação,
  sincronização entre dispositivos, partidas em rede ou compartilhamento público.
- "3D" significa uma arena com profundidade, perspectiva e animações aplicada às imagens 2D locais;
  criação, importação e animação de modelos 3D completos estão fora do escopo inicial.
- As imagens são escolhidas pelo jogador no próprio dispositivo; geração automática de imagens e uso
  de endereços remotos estão fora do escopo inicial.
- A ordem de ataque é definida uma vez no início e repetida em todos os rounds.
- Se velocidade e ataque empatarem, a primeira posição de seleção é um desempate intencional e visível.
- Os limites de atributos e arquivo mantêm cadastros e batalhas previsíveis para a primeira versão.
- Editar ou excluir monstros e manter um histórico de batalhas estão fora do escopo inicial.

### For AI Generation

When creating this spec from a user prompt:

1. **Make informed guesses**: Use context, industry standards, and common patterns to fill gaps
2. **Document assumptions**: Record reasonable defaults in the Assumptions section
3. **Limit clarifications**: Maximum 3 [NEEDS CLARIFICATION] markers - use only for critical decisions that:
   - Significantly impact feature scope or user experience
   - Have multiple reasonable interpretations with different implications
   - Lack any reasonable default
4. **Prioritize clarifications**: scope > security/privacy > user experience > technical details
5. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
6. **Common areas needing clarification** (only if no reasonable default exists):
   - Feature scope and boundaries (include/exclude specific use cases)
   - User types and permissions (if multiple conflicting interpretations possible)
   - Security/compliance requirements (when legally/financially significant)

**Examples of reasonable defaults** (don't ask about these):

- Data retention: Industry-standard practices for the domain
- Performance targets: Standard web/mobile app expectations unless specified
- Error handling: User-friendly messages with appropriate fallbacks
- Authentication method: Standard session-based or OAuth2 for web apps
- Integration patterns: Use project-appropriate patterns (REST/GraphQL for web services, function calls for libraries, CLI args for tools, etc.)

### Success Criteria Guidelines

Success criteria must be:

1. **Measurable**: Include specific metrics (time, percentage, count, rate)
2. **Technology-agnostic**: No mention of frameworks, languages, databases, or tools
3. **User-focused**: Describe outcomes from user/business perspective, not system internals
4. **Verifiable**: Can be tested/validated without knowing implementation details

**Good examples**:

- "Users can complete checkout in under 3 minutes"
- "System supports 10,000 concurrent users"
- "95% of searches return results in under 1 second"
- "Task completion rate improves by 40%"

**Bad examples** (implementation-focused):

- "API response time is under 200ms" (too technical, use "Users see results instantly")
- "Database can handle 1000 TPS" (implementation detail, use user-facing metric)
- "React components render efficiently" (framework-specific)
- "Redis cache hit rate above 80%" (technology-specific)

## Done When

- [ ] Specification written to `SPEC_FILE` and validated against quality checklist
- [ ] Extension hooks dispatched or skipped according to the rules in Mandatory Post-Execution Hooks above
- [ ] Completion reported to user with feature directory, spec file path, and checklist results
