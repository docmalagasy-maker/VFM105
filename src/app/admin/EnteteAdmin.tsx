import Link from "next/link";
import type { Session } from "@/lib/auth";
import BoutonDeconnexion from "./BoutonDeconnexion";

export type Vue = "liste" | "fiches" | "personnes" | "stats" | "carte" | "galerie" | "sondages" | "admins";

/** Rubriques de l'administration, dans un ordre fixe. */
export const ONGLETS: { vue: Vue; libelle: string; superSeulement?: boolean }[] = [
  { vue: "liste", libelle: "Liste des dossiers" },
  { vue: "fiches", libelle: "Consultation fiche par fiche" },
  { vue: "personnes", libelle: "Personnes" },
  { vue: "stats", libelle: "Statistiques" },
  { vue: "carte", libelle: "Carte" },
  { vue: "galerie", libelle: "Galerie photos" },
  { vue: "sondages", libelle: "Sondages" },
  { vue: "admins", libelle: "Administrateurs", superSeulement: true },
];

export const ongletsVisibles = (session: Session) =>
  ONGLETS.filter((o) => session.role === "super" || !o.superSeulement);

/**
 * En-tête et menu de l'administration, identiques sur toutes les pages admin.
 * - `vue` : rubrique affichée telle quelle → son bouton est grisé et inactif ;
 * - `section` : page intérieure d'une rubrique (fiche d'un dossier, résultats
 *   d'un sondage…) → son bouton est souligné et reste cliquable pour revenir
 *   à la liste de la rubrique.
 */
export default function EnteteAdmin({
  session,
  titre,
  vue,
  section,
  q,
}: {
  session: Session;
  titre?: string;
  vue?: Vue;
  section?: Vue;
  /** Recherche en cours, conservée entre « Liste », « Consultation fiche par fiche » et « Personnes ». */
  q?: string;
}) {
  const estSuper = session.role === "super";
  const district = session.role === "district" ? session.district : undefined;

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-zinc-900">{titre ?? "Administration VFM"}</p>
          <p className="text-sm text-zinc-500">
            {estSuper
              ? "Super-administrateur — tous les districts"
              : `Administrateur : ${session.nom} — district ${district}`}
          </p>
        </div>
        <BoutonDeconnexion />
      </header>

      <nav aria-label="Rubriques de l'administration" className="mt-4 flex flex-wrap gap-1 border-b border-zinc-200">
        {ongletsVisibles(session).map((o) => {
          const base = "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium sm:px-4";
          if (o.vue === vue) {
            return (
              <span
                key={o.vue}
                aria-current="page"
                aria-disabled="true"
                className={`${base} cursor-default border-zinc-400 bg-zinc-100 text-zinc-400`}
              >
                {o.libelle}
              </span>
            );
          }
          const href =
            (o.vue === "liste" || o.vue === "fiches" || o.vue === "personnes") && q
              ? `/admin?vue=${o.vue}&q=${encodeURIComponent(q)}`
              : `/admin?vue=${o.vue}`;
          return (
            <Link
              key={o.vue}
              href={href}
              aria-current={o.vue === section ? "location" : undefined}
              className={`${base} ${
                o.vue === section
                  ? "border-zinc-900 text-zinc-900 hover:bg-zinc-50"
                  : "border-transparent text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {o.libelle}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
