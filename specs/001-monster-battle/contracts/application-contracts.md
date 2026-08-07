# Application Contracts

These contracts define application boundaries. They are design signatures, not implementation code.

## File and dependency-injection conventions

- Every named interface, type alias, enum, DTO and error class MUST live in its own file named after the
  declaration; `index.ts` files only re-export and generic `types.ts`, `dto.ts` or `errors.ts` files are
  forbidden.
- Use-case contracts live in `contracts/`, transport-free data shapes in `dtos/` and dependency
  interfaces in `ports/`; the consuming application module owns each port.
- Use-case implementations receive every dependency through explicit constructor parameters and
  implement their corresponding `*UseCase` interface.
- Presentation depends on the `Application` and use-case interfaces. Only
  `src/app/composition-root/createApplication.ts` may import concrete infrastructure adapters.
- Interfaces use domain names without an `I` prefix. Service locators, hidden globals and mutable
  dependency bags are forbidden.
- Public contracts receive concise documentation for constraints and failure semantics; comments explain
  why a decision exists and MUST NOT narrate self-explanatory code.

## Use cases

### RegisterMonster

```ts
type RegisterMonsterInput = Readonly<{
  name: string;
  attack: number;
  defense: number;
  speed: number;
  hp: number;
  image:
    | Readonly<{ kind: 'catalog'; imageId: string }>
    | Readonly<{
        kind: 'upload';
        fileName: string;
        mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
        sizeBytes: number;
        bytes: Uint8Array;
      }>;
}>;

interface RegisterMonsterUseCase {
  execute(input: RegisterMonsterInput): Promise<MonsterDto>;
}
```

Contract:

- Validates all domain fields and image metadata before persistence.
- Inspects uploaded content through `ImageValidator` before opening the database transaction.
- Adds monster plus optional uploaded binary atomically.
- Returns field errors for invalid input and a recoverable storage error for quota/unavailability.

### ListMonsters

```ts
interface ListMonstersUseCase {
  execute(): Promise<readonly MonsterDto[]>;
}
```

Returns deterministic name order. An empty collection is valid.

### ListMonsterImages

```ts
interface ListMonsterImagesUseCase {
  execute(): Promise<readonly CatalogImageDto[]>;
}
```

Returns at least six bundled, AI-generated catalog entries with stable IDs and alt text.

### LoadMonsterImage

```ts
type ImageContentDto =
  | Readonly<{ kind: 'catalog'; src: string; alt: string }>
  | Readonly<{ kind: 'uploaded'; bytes: Uint8Array; mediaType: string; alt: string }>;

interface LoadMonsterImageUseCase {
  execute(reference: MonsterImageRefDto): Promise<ImageContentDto>;
}
```

The use case does not create browser object URLs. Presentation owns creation and revocation.

### StartBattle

```ts
type StartBattleInput = Readonly<{
  firstMonsterId: string;
  secondMonsterId: string;
}>;

interface StartBattleUseCase {
  execute(input: StartBattleInput): Promise<BattleDto>;
}
```

Contract:

- Rejects equal IDs and missing monsters.
- Produces all rounds/events synchronously after repository reads.
- Returns immutable snapshots and event sequence.
- Does not persist battle, change monster HP or invoke timers.

## Ports

### MonsterRepository

```ts
interface MonsterRepository {
  add(monster: Monster, uploadedImage?: UploadedImageContent): Promise<void>;
  findById(id: MonsterId): Promise<Monster | null>;
  list(): Promise<readonly Monster[]>;
}
```

`add` MUST atomically persist monster and uploaded image. Implementations run the shared repository
contract suite.

### MonsterImageCatalog

```ts
interface MonsterImageCatalog {
  list(): Promise<readonly CatalogImage[]>;
  findById(id: string): Promise<CatalogImage | null>;
}
```

### MonsterImageReader

```ts
interface MonsterImageReader {
  read(reference: MonsterImageRef): Promise<ImageBinary | CatalogImage>;
}
```

### ImageValidator

```ts
interface ImageValidator {
  inspect(content: UploadedImageContent): Promise<ImageValidationResult>;
}
```

Checks declared type, size and decodability. Domain types remain browser-independent.

### IdGenerator

```ts
interface IdGenerator {
  next(): string;
}
```

Production uses cryptographically strong UUIDs; tests use deterministic IDs.

### StorageStatus

```ts
interface StorageStatus {
  estimate(): Promise<Readonly<{ usage?: number; quota?: number }>>;
  requestPersistence(): Promise<boolean>;
}
```

Estimate is advisory; repository writes still handle `QuotaExceededError`.

## DTO principles

- DTOs are readonly plain objects and use primitives/discriminated unions only.
- Domain objects never cross into React state.
- Errors are mapped to stable application error codes plus user-safe details.
- Adapters never leak IndexedDB requests, `Blob`, `File`, object URLs or DOM exceptions through ports.
