import { DISTRICTS_PAR_REGION, TOUS_LES_DISTRICTS } from "@/lib/districts";
import type { Regroupement, Tri } from "@/lib/sondages-analyse";
import type { FiltresReponses } from "@/lib/sondages";

/** Paramètres d'adresse de la page de résultats (et de l'export CSV). */
export interface ParametresResultats {
  sexe?: string;
  region?: string;
  district?: string;
  du?: string;
  au?: string;
  groupe?: string;
  tri?: string;
}

const date = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

/**
 * Traduit les paramètres en filtres. `districtImpose` (administrateur de
 * district) prime sur tout filtre géographique demandé.
 */
export function lireFiltres(p: ParametresResultats, districtImpose?: string) {
  const region = DISTRICTS_PAR_REGION.find((r) => r.region === p.region);
  const district = districtImpose ?? (p.district && TOUS_LES_DISTRICTS.includes(p.district) ? p.district : undefined);
  const filtres: FiltresReponses = {
    district,
    districts: !district && region ? region.districts : undefined,
    sexe: p.sexe === "lahy" || p.sexe === "vavy" ? p.sexe : undefined,
    du: date(p.du),
    au: date(p.au),
  };
  const groupesPermis: Regroupement[] = districtImpose ? ["aucun", "sexe"] : ["aucun", "sexe", "region", "district"];
  const regroupement = groupesPermis.includes(p.groupe as Regroupement) ? (p.groupe as Regroupement) : "aucun";
  const tri: Tri = p.tri === "desc" ? "desc" : "ordre";
  return {
    filtres,
    regroupement,
    tri,
    groupesPermis,
    actifs: { sexe: filtres.sexe, region: district ? undefined : region?.region, district: districtImpose ? undefined : district, du: filtres.du, au: filtres.au },
  };
}

/** Chaîne de requête reprenant les paramètres valides (liens d'export, etc.). */
export function versRequete(p: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
}
