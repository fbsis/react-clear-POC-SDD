import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';
import { Button } from '@presentation/shared/components/Button';
import { StatusMessage } from '@presentation/shared/components/StatusMessage';
import styles from './MonsterRegistrationPage.module.css';

export function MonsterRegistrationPage() {
  const collection = useMonsterCollection();
  const { images, status, error } = collection;
  const [name, setName] = useState('');
  const [attack, setAttack] = useState('');
  const [defense, setDefense] = useState('');
  const [speed, setSpeed] = useState('');
  const [hp, setHp] = useState('');
  const [imageMode, setImageMode] = useState<'catalog' | 'upload'>('catalog');
  const [selectedImageId, setSelectedImageId] = useState('');
  const [upload, setUpload] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const effectiveImageId = selectedImageId.length > 0 ? selectedImageId : (images[0]?.id ?? '');

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [uploadPreviewUrl]);

  const submit = async (event: SyntheticEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSuccess(null);
    const image =
      imageMode === 'catalog'
        ? { kind: 'catalog' as const, imageId: effectiveImageId }
        : await toUploadedImage(upload);

    await collection.registerMonster({
      name,
      attack: Number(attack),
      defense: Number(defense),
      speed: Number(speed),
      hp: Number(hp),
      image
    });
    setSuccess(`${name.trim()} entrou para a coleção.`);
    setName('');
    setAttack('');
    setDefense('');
    setSpeed('');
    setHp('');
    setUpload(null);
    setUploadPreviewUrl(null);
  };

  return (
    <section className={styles.forge} aria-labelledby="forge-title">
      <div className={styles.introduction}>
        <span className={styles.eyebrow}>Salão dos Invocadores</span>
        <h1 id="forge-title">Forje seu monstro</h1>
        <p>Escolha um retrato do bestiário ou traga sua própria criatura para o torneio.</p>
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => {
          void submit(event).catch(() => undefined);
        }}
      >
        <div className={styles.fields}>
          <label className={styles.nameField}>
            <span>Nome</span>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              required
              maxLength={80}
            />
          </label>
          {[
            ['Ataque', attack, setAttack],
            ['Defesa', defense, setDefense],
            ['Velocidade', speed, setSpeed],
            ['Vida', hp, setHp]
          ].map(([label, value, setter]) => (
            <label key={label as string}>
              <span>{label as string}</span>
              <input
                type="number"
                min={label === 'Vida' ? 1 : 0}
                max={9999}
                value={value as string}
                onChange={(event) => {
                  (setter as (next: string) => void)(event.target.value);
                }}
                required
                inputMode="numeric"
              />
            </label>
          ))}
        </div>

        <fieldset className={styles.imageSource}>
          <legend>Retrato da criatura</legend>
          <div className={styles.modeTabs}>
            <label>
              <input
                type="radio"
                name="image-mode"
                checked={imageMode === 'catalog'}
                onChange={() => {
                  setImageMode('catalog');
                }}
              />
              Bestiário
            </label>
            <label>
              <input
                type="radio"
                name="image-mode"
                checked={imageMode === 'upload'}
                onChange={() => {
                  setImageMode('upload');
                }}
              />
              Minha imagem
            </label>
          </div>

          {imageMode === 'catalog' ? (
            <div className={styles.catalog} aria-label="Bestiário de retratos">
              {images.map((image) => (
                <label className={styles.catalogChoice} key={image.id}>
                  <input
                    type="radio"
                    name="catalog-image"
                    value={image.id}
                    checked={effectiveImageId === image.id}
                    onChange={() => {
                      setSelectedImageId(image.id);
                    }}
                    required
                  />
                  <img src={image.src} alt="" />
                  <span>{image.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className={styles.uploadArea}>
              <label className={styles.uploadField}>
                <span>Escolher imagem JPEG, PNG ou WebP (até 10 MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setUpload(file);
                    setUploadPreviewUrl(file ? URL.createObjectURL(file) : null);
                  }}
                  required
                />
              </label>
              {uploadPreviewUrl ? (
                <img
                  className={styles.uploadPreview}
                  src={uploadPreviewUrl}
                  alt="Prévia da imagem escolhida"
                />
              ) : null}
            </div>
          )}
        </fieldset>

        {error ? <StatusMessage tone="danger">{error}</StatusMessage> : null}
        {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}
        <Button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Guardando…' : 'Guardar monstro'}
        </Button>
      </form>
    </section>
  );
}

async function toUploadedImage(file: File | null) {
  if (!file) {
    throw new Error('Escolha uma imagem para continuar.');
  }
  return {
    kind: 'upload' as const,
    fileName: file.name,
    mediaType: file.type,
    sizeBytes: file.size,
    bytes: new Uint8Array(await file.arrayBuffer())
  };
}
