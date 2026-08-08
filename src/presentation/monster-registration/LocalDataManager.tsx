import { useRef, useState } from 'react';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';
import { Button } from '@presentation/shared/components/Button';
import { StatusMessage } from '@presentation/shared/components/StatusMessage';
import styles from './MonsterCollection.module.css';

export function LocalDataManager() {
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
      setCleanupMessage('Todos os monstros convocados foram removidos.');
      closeDialog();
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
      setCleanupMessage('O banco de dados local foi limpo e recriado vazio.');
      closeDialog();
    } catch {
      setCleanupMessage(null);
    }
  };

  return (
    <section className={styles.dataLauncher} aria-label="Gerenciamento de dados locais">
      {cleanupMessage ? <StatusMessage tone="success">{cleanupMessage}</StatusMessage> : null}
      <Button type="button" variant="ghost" onClick={openDialog}>
        Gerenciar dados locais
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
    </section>
  );
}
