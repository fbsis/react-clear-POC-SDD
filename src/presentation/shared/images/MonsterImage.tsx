import { useState } from 'react';
import type { MonsterImageProps } from './MonsterImageProps';
import { useMonsterImageUrl } from './useMonsterImageUrl';

export function MonsterImage({
  reference,
  monsterName,
  loadingLabel = 'Invocando…'
}: MonsterImageProps) {
  const image = useMonsterImageUrl(reference);
  const referenceKey = `${reference.kind}:${reference.reference}`;
  const [failedReferenceKey, setFailedReferenceKey] = useState<string | null>(null);
  const renderFailed = failedReferenceKey === referenceKey;

  if (image.status === 'error' || renderFailed) {
    return <span>Retrato indisponível para {monsterName}</span>;
  }
  if (image.status === 'loading') {
    return <span>{loadingLabel}</span>;
  }
  return (
    <img
      src={image.url}
      alt={`Retrato de ${monsterName}`}
      onError={() => {
        setFailedReferenceKey(referenceKey);
      }}
    />
  );
}
