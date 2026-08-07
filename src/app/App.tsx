import { useGameSession } from '@app/hooks/useGameSession';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';
import { FighterSelectionPage } from '@presentation/fighter-selection/FighterSelectionPage';
import { MonsterCollection } from '@presentation/monster-registration/MonsterCollection';
import { MonsterRegistrationPage } from '@presentation/monster-registration/MonsterRegistrationPage';
import { Button } from '@presentation/shared/components/Button';
import '@presentation/shared/styles/tokens.css';
import '@presentation/shared/styles/globals.css';
import { createApplication } from './composition-root/createApplication';
import { ApplicationProvider } from './providers/ApplicationProvider';
import { GameSessionProvider } from './providers/GameSessionProvider';
import { MonsterCollectionProvider } from './providers/MonsterCollectionProvider';
import styles from './App.module.css';

const application = createApplication();

export function App() {
  return (
    <ApplicationProvider application={application}>
      <MonsterCollectionProvider>
        <GameSessionProvider>
          <AppContent />
        </GameSessionProvider>
      </MonsterCollectionProvider>
    </ApplicationProvider>
  );
}

function AppContent() {
  const { monsters } = useMonsterCollection();
  const session = useGameSession();
  const chapter = {
    registration: 'Capítulo I · Convocação',
    selection: 'Capítulo II · Escolha',
    battle: 'Capítulo III · Arena'
  }[session.screen];
  const winner = session.battle?.fighters.find(
    (fighter) => fighter.id === session.battle?.winnerId
  );

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <span className={styles.brand}>Monster Arena</span>
          <span className={styles.chapter}>{chapter}</span>
        </div>
      </header>
      <main className={styles.main}>
        {session.screen === 'registration' ? (
          <>
            <MonsterRegistrationPage />
            <MonsterCollection />
            {monsters.length >= 2 ? (
              <div className={styles.continueAction}>
                <Button
                  type="button"
                  onClick={() => {
                    session.navigate('selection');
                  }}
                >
                  Escolher lutadores
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
        {session.screen === 'selection' ? <FighterSelectionPage /> : null}
        {session.screen === 'battle' ? (
          <section className={styles.battleBridge}>
            <span>Os cálculos do conselho foram concluídos</span>
            <h1>Batalha calculada</h1>
            <p>Vencedor: {winner?.name ?? 'Monstro desconhecido'}</p>
            <p>A apresentação round a round será construída no próximo capítulo.</p>
            <Button type="button" onClick={session.clearBattle}>
              Nova batalha
            </Button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
