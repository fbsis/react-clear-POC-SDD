import { useRef, useState } from 'react';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';
import { Button } from '@presentation/shared/components/Button';
import { StatusMessage } from '@presentation/shared/components/StatusMessage';
import type { LocalDataManagerProps } from './LocalDataManagerProps';
import styles from './LocalDataManager.module.css';

export function LocalDataManager({ onDataCleared }: LocalDataManagerProps) {
  const { monsters, status, clearMonsters, resetDatabase } = useMonsterCollection();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  const isClearing = status === 'clearing';

  const openDialog = (): void => {
    setCleanupMessage(null);
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      return;
    }
    dialog.setAttribute('open', '');
  };

  const closeDialog = (): void => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.close === 'function') {
      dialog.close();
      return;
    }
    dialog.removeAttribute('open');
  };

  const finishCleanup = (message: string): void => {
    setCleanupMessage(message);
    closeDialog();
    onDataCleared();
  };

  const confirmCollectionCleanup = async (): Promise<void> => {
    if (
      !window.confirm(
        'Remover todos os monstros convocados e suas imagens enviadas? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }
    setCleanupMessage(null);
    try {
      await clearMonsters();
      finishCleanup('Todos os monstros convocados foram removidos.');
    } catch {
      setCleanupMessage(null);
    }
  };

  const confirmDatabaseReset = async (): Promise<void> => {
    if (
      !window.confirm(
        'Apagar todo o banco de dados local do Monster Arena? Monstros e imagens serão removidos permanentemente.'
      )
    ) {
      return;
    }
    setCleanupMessage(null);
    try {
      await resetDatabase();
      finishCleanup('O banco de dados local foi limpo e recriado vazio.');
    } catch {
      setCleanupMessage(null);
    }
  };

  return (
    <div className={styles.manager}>
      {cleanupMessage ? (
        <div className={styles.feedback}>
          <StatusMessage tone="success">{cleanupMessage}</StatusMessage>
        </div>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        className={styles.trigger}
        aria-label="Gerenciar dados locais"
        title="Gerenciar dados locais"
        onClick={openDialog}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v5c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
          <path d="M5 10v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" />
          <path d="M5 15v4c0 1.66 3.13 3 7 3s7-1.34 7-3v-4" />
        </svg>
      </Button>

      <dialog
        ref={dialogRef}
        className={styles.dataDialog}
        aria-labelledby="data-management-title"
        aria-describedby="data-management-description"
      >
        <div className={styles.dialogContent}>
          <header className={styles.dialogHeader}>
            <div>
              <span>Dados locais</span>
              <h3 id="data-management-title">Gerenciar coleção</h3>
            </div>
            <Button type="button" variant="ghost" onClick={closeDialog}>
              Fechar
            </Button>
          </header>
          <p id="data-management-description">
            Escolha entre dispensar a companhia atual ou reiniciar todo o banco deste navegador.
          </p>
          <div className={styles.dataActions}>
            <Button
              type="button"
              variant="secondary"
              disabled={monsters.length === 0 || isClearing}
              onClick={() => {
                void confirmCollectionCleanup();
              }}
            >
              {isClearing ? 'Limpando…' : 'Limpar monstros convocados'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isClearing}
              onClick={() => {
                void confirmDatabaseReset();
              }}
            >
              {isClearing ? 'Limpando…' : 'Limpar todo o banco de dados'}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
