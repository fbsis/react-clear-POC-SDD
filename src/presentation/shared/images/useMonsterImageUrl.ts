import { useEffect, useState } from 'react';
import type { MonsterImageReferenceDto } from '@application/monster/dtos/MonsterImageReferenceDto';
import { useApplication } from '@app/hooks/useApplication';

export function useMonsterImageUrl(reference: MonsterImageReferenceDto): string | null {
  const application = useApplication();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void application.loadMonsterImage.execute(reference).then((content) => {
      if (!active) {
        return;
      }
      if (content.kind === 'catalog') {
        setUrl(content.src);
        return;
      }
      objectUrl = URL.createObjectURL(
        new Blob([Uint8Array.from(content.bytes).buffer], { type: content.mediaType })
      );
      setUrl(objectUrl);
    });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [application, reference]);

  return url;
}
