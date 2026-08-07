import { MonsterCollection } from '@presentation/monster-registration/MonsterCollection';
import { MonsterRegistrationPage } from '@presentation/monster-registration/MonsterRegistrationPage';
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
          <div className={styles.app}>
            <header className={styles.topbar}>
              <div className={styles.topbarInner}>
                <span className={styles.brand}>Monster Arena</span>
                <span className={styles.chapter}>Capítulo I · Convocação</span>
              </div>
            </header>
            <main className={styles.main}>
              <MonsterRegistrationPage />
              <MonsterCollection />
            </main>
          </div>
        </GameSessionProvider>
      </MonsterCollectionProvider>
    </ApplicationProvider>
  );
}
