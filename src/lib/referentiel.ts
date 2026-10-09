import donnees from "@/data/referentiel-geo.json";

/**
 * Référentiel officiel District > Commune > Fokontany (limites administratives
 * BNGRC, diffusées par OCHA/HDX sous licence CC BY-IGO). Clé : nom du district
 * tel qu'il figure dans le formulaire (src/lib/districts.ts).
 * Commune : [nom, pcode, [[fokontany, pcode], ...]].
 */
type CommuneBrute = [string, string, [string, string][]];
const REFERENTIEL = donnees as unknown as Record<string, { pcode: string; communes: CommuneBrute[] }>;

export const SOURCE_REFERENTIEL =
  "Limites administratives de Madagascar — BNGRC, via OCHA/HDX (CC BY-IGO)";

export interface CommuneReferentiel {
  nom: string;
  pcode: string;
  fokontany: { nom: string; pcode: string }[];
}

/** Code (pcode) du district dans le référentiel officiel, utilisé par la carte. */
export function pcodeDistrict(district: string): string | undefined {
  return REFERENTIEL[district]?.pcode;
}

export function districtParPcode(pcode: string): string | undefined {
  return Object.entries(REFERENTIEL).find(([, d]) => d.pcode === pcode)?.[0];
}

export function communesDuDistrict(district: string): CommuneReferentiel[] {
  return (REFERENTIEL[district]?.communes ?? []).map(([nom, pcode, fkt]) => ({
    nom,
    pcode,
    fokontany: fkt.map(([n, p]) => ({ nom: n, pcode: p })),
  }));
}

const simplifier = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Rattache la commune et le fokontany saisis au référentiel quand c'est
 * possible (code fourni, ou nom identique à un nom officiel du district).
 * Sinon, la saisie manuelle est conservée telle quelle, sans code.
 */
export function rattacherAuReferentiel(
  district: string,
  saisie: { commune: string; communePcode?: string; fokontany?: string; fokontanyPcode?: string }
): { commune: string; communePcode?: string; fokontany?: string; fokontanyPcode?: string } {
  const communes = REFERENTIEL[district]?.communes ?? [];
  const nomCommune = saisie.commune.trim();
  const commune =
    communes.find((c) => saisie.communePcode && c[1] === saisie.communePcode) ??
    communes.find((c) => simplifier(c[0]) === simplifier(nomCommune));

  const nomFokontany = saisie.fokontany?.trim() || undefined;
  if (!commune) return { commune: nomCommune, fokontany: nomFokontany };

  const fokontany =
    commune[2].find((f) => saisie.fokontanyPcode && f[1] === saisie.fokontanyPcode) ??
    (nomFokontany ? commune[2].find((f) => simplifier(f[0]) === simplifier(nomFokontany)) : undefined);

  return {
    commune: commune[0],
    communePcode: commune[1],
    fokontany: fokontany ? fokontany[0] : nomFokontany,
    fokontanyPcode: fokontany?.[1],
  };
}
