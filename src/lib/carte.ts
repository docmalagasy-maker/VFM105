import { getPool } from "@/lib/db";
import { pcodeDistrict } from "@/lib/referentiel";
import { verifierSchema } from "@/lib/schema";

export interface ZoneCarte {
  /** Code officiel (pcode) ; absent pour une commune saisie à la main. */
  pcode?: string;
  nom: string;
  associations: number;
  membres: number;
}

export interface AssociationCarte {
  reference: string;
  nom: string;
  responsable: string;
  telephone: string;
  fokontany?: string;
  membres: number;
}

export interface CommuneCarte extends ZoneCarte {
  liste: AssociationCarte[];
}

/** Vue nationale : associations par district (super-administrateur). */
export async function carteNationale(): Promise<{ districts: ZoneCarte[]; sansDistrict: number }> {
  await verifierSchema();
  const r = await getPool().query<{ district: string | null; associations: string; membres: string }>(
    `SELECT association_district AS district, COUNT(*) AS associations,
            COALESCE(SUM(association_nombre_membres), 0) AS membres
     FROM dossiers GROUP BY association_district`
  );
  let sansDistrict = 0;
  const districts: ZoneCarte[] = [];
  for (const l of r.rows) {
    const pcode = l.district ? pcodeDistrict(l.district) : undefined;
    if (!pcode) {
      sansDistrict += Number(l.associations);
      continue;
    }
    districts.push({ pcode, nom: l.district!, associations: Number(l.associations), membres: Number(l.membres) });
  }
  return { districts, sansDistrict };
}

/** Vue d'un district : associations par commune, avec leur liste. */
export async function carteDistrict(district: string): Promise<{ pcode?: string; communes: CommuneCarte[] }> {
  await verifierSchema();
  const r = await getPool().query<{
    reference: string;
    association_nom: string;
    association_commune: string | null;
    association_commune_pcode: string | null;
    association_fokontany: string | null;
    association_nombre_membres: number;
    responsables: { nom: string; prenom: string }[];
    telephone: string;
  }>(
    `SELECT reference, association_nom, association_commune, association_commune_pcode,
            association_fokontany, association_nombre_membres, responsables, telephone
     FROM dossiers WHERE association_district = $1 ORDER BY association_nom`,
    [district]
  );

  const communes = new Map<string, CommuneCarte>();
  for (const l of r.rows) {
    const nom = l.association_commune?.trim() || "Commune non renseignée";
    const cle = l.association_commune_pcode || `manuel:${nom.toLowerCase()}`;
    const c = communes.get(cle) ?? {
      pcode: l.association_commune_pcode || undefined,
      nom,
      associations: 0,
      membres: 0,
      liste: [],
    };
    c.associations += 1;
    c.membres += Number(l.association_nombre_membres) || 0;
    const resp = l.responsables?.[0];
    c.liste.push({
      reference: l.reference,
      nom: l.association_nom,
      responsable: resp ? `${resp.prenom} ${resp.nom}`.trim() : "",
      telephone: l.telephone,
      fokontany: l.association_fokontany || undefined,
      membres: Number(l.association_nombre_membres) || 0,
    });
    communes.set(cle, c);
  }
  return { pcode: pcodeDistrict(district), communes: [...communes.values()] };
}
