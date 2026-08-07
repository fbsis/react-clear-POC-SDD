import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';
import { ProgressBar } from '@presentation/shared/components/ProgressBar';
import { StatusMessage } from '@presentation/shared/components/StatusMessage';
import { useMonsterImageUrl } from '@presentation/shared/images/useMonsterImageUrl';
import styles from './MonsterCollection.module.css';

export function MonsterCollection() {
  const { monsters, status, error } = useMonsterCollection();

  return (
    <section className={styles.collection} aria-labelledby="collection-title">
      <div className={styles.heading}>
        <div>
          <span>Arquivo real</span>
          <h2 id="collection-title">Companhia de monstros</h2>
        </div>
        <strong>{monsters.length} convocados</strong>
      </div>
      {status === 'loading' && monsters.length === 0 ? <p>Consultando os pergaminhos…</p> : null}
      {error ? <StatusMessage tone="danger">{error}</StatusMessage> : null}
      {status !== 'loading' && monsters.length === 0 ? (
        <div className={styles.empty}>
          Ainda não há monstros na companhia. Forje o primeiro acima.
        </div>
      ) : null}
      <div className={styles.grid}>
        {monsters.map((monster) => (
          <MonsterCard key={monster.id} monster={monster} />
        ))}
      </div>
    </section>
  );
}

function MonsterCard({ monster }: Readonly<{ monster: MonsterDto }>) {
  const imageUrl = useMonsterImageUrl(monster.image);
  return (
    <article className={styles.card} aria-label={monster.name}>
      <div className={styles.portrait}>
        {imageUrl ? (
          <img src={imageUrl} alt={`Retrato de ${monster.name}`} />
        ) : (
          <span>Carregando…</span>
        )}
      </div>
      <div className={styles.cardBody}>
        <h3>{monster.name}</h3>
        <dl>
          <Stat label="Ataque" value={monster.attack} maximum={9999} />
          <Stat label="Defesa" value={monster.defense} maximum={9999} />
          <Stat label="Velocidade" value={monster.speed} maximum={9999} />
          <Stat label="Vida" value={monster.hp} maximum={9999} />
        </dl>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  maximum
}: Readonly<{ label: string; value: number; maximum: number }>) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <ProgressBar value={value} maximum={maximum} label={`${label}: ${String(value)}`} />
    </div>
  );
}
