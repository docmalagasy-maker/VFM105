import { getPool } from "@/lib/db";
import { DISTRICTS_PAR_REGION } from "@/lib/districts";
import { verifierSchema } from "@/lib/schema";

/** Libellé des dossiers déposés avant l'ajout du champ District. */
export const DISTRICT_NON_RENSEIGNE = "Non renseigné";
export const COMMUNE_NON_RENSEIGNEE = "Non renseignée";

const REGION_PAR_DISTRICT = new Map(
  DISTRICTS_PAR_REGION.flatMap((r) => r.districts.map((d) => [d, r.region] as const))
);

/** Tranches de taille d'association, par nombre de membres déclarés. */
export const TRANCHES_MEMBRES: { libelle: string; min: number; max: number }[] = [
  { libelle: "1 à 10", min: 1, max: 10 },
  { libelle: "11 à 25", min: 11, max: 25 },
  { libelle: "26 à 50", min: 26, max: 50 },
  { libelle: "51 à 100", min: 51, max: 100 },
  { libelle: "101 à 250", min: 101, max: 250 },
  { libelle: "Plus de 250", min: 251, max: Number.POSITIVE_INFINITY },
];

export interface LigneZone {
  nom: string;
  /** Région du district (lignes par district uniquement). */
  region?: string;
  associations: number;
  membres: number;
  moyenneMembres: number;
}

export interface LigneTranche {
  libelle: string;
  associations: number;
  membres: number;
  part: number;
}

export interface Statistiques {
  totalAssociations: number;
  totalMembres: number;
  moyenneMembres: number;
  medianeMembres: number;
  districtsCouverts: number;
  parDistrict: LigneZone[];
  parRegion: LigneZone[];
  /** Par commune (la colonne « region » contient alors le district). */
  parCommune: LigneZone[];
  parTranche: LigneTranche[];
}

function regrouper(lignes: { cle: string; membres: number; region?: string }[]): LigneZone[] {
  const zones = new Map<string, LigneZone>();
  for (const l of lignes) {
    const z = zones.get(l.cle) ?? { nom: l.cle, region: l.region, associations: 0, membres: 0, moyenneMembres: 0 };
    z.associations += 1;
    z.membres += l.membres;
    zones.set(l.cle, z);
  }
  return [...zones.values()]
    .map((z) => ({ ...z, moyenneMembres: z.membres / z.associations }))
    .sort((a, b) => b.associations - a.associations || b.membres - a.membres || a.nom.localeCompare(b.nom, "fr"));
}

/**
 * Statistiques sur les associations enregistrées. Chaque dossier compte pour
 * une association (une association qui dépose deux dossiers compte deux fois).
 * `district` limite le calcul à ce district (administrateur de district).
 */
export async function calculerStatistiques(district?: string): Promise<Statistiques> {
  await verifierSchema();
  const result = await getPool().query<{ district: string | null; commune: string | null; membres: number }>(
    `SELECT association_district AS district, association_commune AS commune,
            association_nombre_membres AS membres
     FROM dossiers WHERE ($1::text IS NULL OR association_district = $1)`,
    [district ?? null]
  );

  const lignes = result.rows.map((r) => {
    const district = r.district?.trim() || DISTRICT_NON_RENSEIGNE;
    return {
      district,
      region: REGION_PAR_DISTRICT.get(district) ?? DISTRICT_NON_RENSEIGNE,
      commune: r.commune?.trim() || COMMUNE_NON_RENSEIGNEE,
      membres: Number(r.membres) || 0,
    };
  });

  const totalAssociations = lignes.length;
  const totalMembres = lignes.reduce((s, l) => s + l.membres, 0);
  const tries = lignes.map((l) => l.membres).sort((a, b) => a - b);
  const milieu = Math.floor(tries.length / 2);
  const medianeMembres =
    tries.length === 0 ? 0 : tries.length % 2 ? tries[milieu] : (tries[milieu - 1] + tries[milieu]) / 2;

  const parDistrict = regrouper(lignes.map((l) => ({ cle: l.district, region: l.region, membres: l.membres })));
  const parRegion = regrouper(lignes.map((l) => ({ cle: l.region, membres: l.membres })));
  const SEPARATEUR = "|";
  // Clé « district / commune » : deux communes homonymes de districts différents restent distinctes
  const parCommune = regrouper(
    lignes.map((l) => ({ cle: `${l.district}${SEPARATEUR}${l.commune}`, region: l.district, membres: l.membres }))
  ).map((z) => ({ ...z, nom: z.nom.slice(z.nom.indexOf(SEPARATEUR) + 1) }));

  const parTranche = TRANCHES_MEMBRES.map((t) => {
    const dedans = lignes.filter((l) => l.membres >= t.min && l.membres <= t.max);
    return {
      libelle: t.libelle,
      associations: dedans.length,
      membres: dedans.reduce((s, l) => s + l.membres, 0),
      part: totalAssociations ? dedans.length / totalAssociations : 0,
    };
  });

  return {
    totalAssociations,
    totalMembres,
    moyenneMembres: totalAssociations ? totalMembres / totalAssociations : 0,
    medianeMembres,
    districtsCouverts: parDistrict.filter((d) => d.nom !== DISTRICT_NON_RENSEIGNE).length,
    parDistrict,
    parRegion,
    parCommune,
    parTranche,
  };
}
