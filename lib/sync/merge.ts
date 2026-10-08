import type { Character } from "@/lib/types";

/** Preenche imagens que faltam em `primary` com as de `other` (mesmo id de referência). */
export function withImagesFrom(primary: Character, other: Character): Character {
  const otherImages = new Map(other.visual.referencias.map((r) => [r.id, r.dataUrl]));
  const missing = primary.visual.referencias.some((r) => !r.dataUrl && otherImages.get(r.id));
  if (!missing) return primary;
  return {
    ...primary,
    visual: {
      ...primary.visual,
      referencias: primary.visual.referencias.map((r) =>
        r.dataUrl ? r : { ...r, dataUrl: otherImages.get(r.id) ?? r.dataUrl }
      ),
    },
  };
}

/**
 * Junta os personagens deste navegador com os do banco sem descartar
 * nenhum: por id, vence a versão editada mais recentemente. Retorna também
 * quais ids precisam subir pro banco (só existem aqui ou estão mais novos aqui).
 */
export function mergeCharacters(
  local: Character[],
  remote: Character[]
): { merged: Character[]; toUpload: Set<string> } {
  const remoteById = new Map(remote.map((c) => [c.id, c]));
  const toUpload = new Set<string>();
  const merged: Character[] = [];

  for (const lc of local) {
    const rc = remoteById.get(lc.id);
    if (!rc) {
      merged.push(lc);
      toUpload.add(lc.id);
      continue;
    }
    remoteById.delete(lc.id);
    if ((lc.updatedAt ?? 0) > (rc.updatedAt ?? 0)) {
      merged.push(withImagesFrom(lc, rc));
      toUpload.add(lc.id);
    } else {
      merged.push(withImagesFrom(rc, lc));
    }
  }

  const remoteOnly = [...remoteById.values()].sort(
    (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
  );
  return { merged: [...merged, ...remoteOnly], toUpload };
}
