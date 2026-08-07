# Data Model: Cadastro e Batalha de Monstros

## Modeling rules

- Domínio é TypeScript puro e imutável; não conhece React, DOM, `Blob`, IndexedDB ou records persistidos.
- `Monster` e `Battle` possuem identidade. `Round` e `AttackEvent` são values internos à batalha.
- Invariantes são garantidas ao criar objetos; estados inválidos não atravessam o domínio.
- Value objects ficam em `value-objects/` e delegam suas invariantes a funções puras dedicadas em
  `validations/`; aggregates permanecem na raiz de cada módulo de domínio.
- DTOs e mappers traduzem dados nas fronteiras. Persistência nunca reidrata entidade sem validação.

## Monster aggregate

### Monster

| Field | Type | Rules |
|-------|------|-------|
| `id` | `MonsterId` | UUID não vazio, imutável |
| `name` | `MonsterName` | trim; 1 a 80 caracteres visíveis |
| `stats` | `CombatStats` | value object validado |
| `image` | `MonsterImageRef` | referência catalog ou uploaded válida |

O monstro cadastrado é imutável nesta versão. Vida de batalha nunca altera `stats.maxHp`; cada confronto
cria snapshots próprios.

### CombatStats

| Field | Type | Rules |
|-------|------|-------|
| `attack` | integer | 0..9.999 |
| `defense` | integer | 0..9.999 |
| `speed` | integer | 0..9.999 |
| `maxHp` | integer | 1..9.999 |

### MonsterImageRef

Union discriminada:

```text
CatalogImageRef  = { kind: "catalog", imageId: string }
UploadedImageRef = { kind: "uploaded", imageId: string }
```

Na fronteira persistida, `image_url` é serializado como `catalog:<imageId>` ou `uploaded:<imageId>`.
Nenhuma `blob:` URL ou Data URL entra no domínio ou banco.

## Battle aggregate

### MonsterSnapshot

Snapshot imutável com `id`, `name`, `stats` e `image`. Evita que futuras edições alterem o significado
de uma batalha já calculada.

### Battle

| Field | Type | Rules |
|-------|------|-------|
| `id` | `BattleId` | gerado uma vez; não persistido nesta versão |
| `fighters` | tuple de 2 `MonsterSnapshot` | IDs distintos |
| `attackOrder` | tuple de 2 `MonsterId` | maior speed; depois attack; depois primeira seleção |
| `rounds` | `readonly Round[]` | pelo menos 1, contíguos, completos |
| `result` | `BattleResult` | derivado do último ataque |

### Round

| Field | Type | Rules |
|-------|------|-------|
| `number` | integer | começa em 1 e incrementa sem lacunas |
| `startingHp` | mapa fighter -> HP | igual ao final do round anterior, ou maxHp no primeiro |
| `events` | tuple de 1 ou 2 `AttackEvent` | segundo evento só existe se defensor do primeiro sobreviver |
| `endingHp` | mapa fighter -> HP | derivado dos eventos, nunca negativo |

### AttackEvent

| Field | Type | Rules |
|-------|------|-------|
| `sequence` | integer | começa em 0, global e contíguo |
| `roundNumber` | integer | referência ao round pai |
| `attackerId` | `MonsterId` | diferente do defensor |
| `defenderId` | `MonsterId` | combatente da batalha |
| `damage` | integer | `max(attack - defense, 1)` |
| `defenderHpBefore` | integer | maior que 0 |
| `defenderHpAfter` | integer | `max(before - damage, 0)` |
| `defeated` | boolean | true somente quando `defenderHpAfter === 0` |

### BattleResult

`winnerId`, `loserId`, `finalRoundNumber`, `finalEventSequence`. O vencedor é sempre o atacante do
primeiro evento que reduz o oponente a zero.

## Presentation state: BattlePlayback

Não faz parte do agregado nem é persistido.

```text
phase: ready | playing | paused | complete
currentEventIndex: -1..last
playbackGeneration: non-negative integer
```

Round ativo, HP e resultado visível são derivados dos eventos. Ações permitidas:

- `LOAD`: carrega batalha e posiciona antes do primeiro evento.
- `PLAY`: invalida geração anterior, posiciona no evento 0 e inicia reprodução.
- `TICK(generation)`: avança apenas se a geração coincide e phase é playing.
- `SELECT_ROUND`: pausa e posiciona no último evento do round.
- `STEP_ROUND(-1|1)`: pausa, respeita limites e muda round.
- `COMPLETE`: termina após evento final e revela resultado.

## Persistent schema: IndexedDB v1

### Store `monsters`

Key path: `id`; index: `nameNormalized`.

```text
id: string
name: string
nameNormalized: string
attack: number
defense: number
speed: number
maxHp: number
imageKind: "catalog" | "uploaded"
imageId: string
```

### Store `imageAssets`

Key path: `id`.

```text
id: string
blob: Blob
mimeType: "image/jpeg" | "image/png" | "image/webp"
sizeBytes: number
originalFileName: string
```

Uma transação `readwrite` em ambas as stores grava upload e monstro. Validação/decodificação ocorre antes
da transação. Batalhas não são persistidas porque histórico está fora do escopo.

## Static catalog manifest

```text
id: stable string
src: project-relative asset path
alt: concise monster description
width: positive integer
height: positive integer
```

Mínimo de 6 registros. IDs permanecem estáveis mesmo quando a otimização gera nomes de arquivo novos.

## State transitions and failure behavior

### Register monster

1. Parse/validate name and stats.
2. Validate selected catalog ID or inspect upload type, size and decodability.
3. Check estimated quota for upload; still handle actual write failure.
4. Generate IDs and construct `Monster`.
5. Persist monster and optional blob atomically.
6. Return DTO; on failure, no partial record remains.

### Resolve battle

1. Load two distinct monsters.
2. Determine fixed order.
3. Repeatedly create immutable attack events and rounds.
4. Stop on first zero HP; no counterattack follows defeat.
5. Return complete `Battle` without mutating monsters.

### Failure categories

- `ValidationError`: user input; field-specific feedback.
- `MonsterNotFoundError` / `SameMonsterError`: selection feedback.
- `ImageValidationError`: type, size or decoding feedback.
- `StorageQuotaError`: recoverable storage guidance.
- `StorageBlockedError`: reload/other-tab guidance.
- `StorageUnavailableError`: preserve form state and allow retry.
