import { useEffect, useState } from 'react';
import type { MonsterImageReferenceDto } from '@application/monster/dtos/MonsterImageReferenceDto';
import { useApplication } from '@app/hooks/useApplication';
import type { MonsterImageUrlState } from './MonsterImageUrlState';

export function useMonsterImageUrl(reference: MonsterImageReferenceDto): MonsterImageUrlState {
  const application = useApplication();
  const imageKind = reference.kind;
  const imageReference = reference.reference;
  const referenceKey = `${imageKind}:${imageReference}`;
  const [loadedState, setLoadedState] = useState<
    Readonly<{ referenceKey: string; image: MonsterImageUrlState }>
  >({ referenceKey, image: { status: 'loading', url: null } });

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void application.loadMonsterImage
      .execute({ kind: imageKind, reference: imageReference })
      .then((content) => {
        if (!active) return;
        if (content.kind === 'catalog') {
          setLoadedState({ referenceKey, image: { status: 'ready', url: content.src } });
          return;
        }
        objectUrl = URL.createObjectURL(
          new Blob([Uint8Array.from(content.bytes).buffer], { type: content.mediaType })
        );
        setLoadedState({ referenceKey, image: { status: 'ready', url: objectUrl } });
      })
      .catch(() => {
        if (active) {
          setLoadedState({ referenceKey, image: { status: 'error', url: null } });
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [application, imageKind, imageReference, referenceKey]);

  return loadedState.referenceKey === referenceKey
    ? loadedState.image
    : { status: 'loading', url: null };
}
