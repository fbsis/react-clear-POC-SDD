import { useGameSession } from '@app/hooks/useGameSession';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';
import { BattlePlaybackPage } from '@presentation/battle-playback/BattlePlaybackPage';
import { FighterSelectionPage } from '@presentation/fighter-selection/FighterSelectionPage';
import { LocalDataManager } from '@presentation/local-data/LocalDataManager';
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

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <span className={styles.brand}>Monster Arena</span>
          <div className={styles.topbarActions}>
            <span className={styles.chapter}>{chapter}</span>
            <LocalDataManager
              onDataCleared={() => {
                session.resetSelection();
                session.navigate('registration');
              }}
            />
          </div>
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
        {session.screen === 'battle' ? <BattlePlaybackPage /> : null}
      </main>
    </div>
  );
}
