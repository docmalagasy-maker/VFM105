import Link from "next/link";
import { redirect } from "next/navigation";
import { listerAdministrateurs } from "@/lib/administrateurs";
import { districtAutorise, obtenirSession } from "@/lib/auth";
import { listerPhotos } from "@/lib/galerie";
import { listerDossiers } from "@/lib/repository";
import type { Dossier } from "@/lib/types";
import AdministrateursVue from "./AdministrateursVue";
import BoutonDeconnexion from "./BoutonDeconnexion";
import BoutonSupprimer from "./BoutonSupprimer";
import CarteAdmin from "./CarteAdmin";
import FichesDossiers from "./FichesDossiers";
import GalerieAdmin from "./GalerieAdmin";
import { LIBELLES_SMS, LIBELLES_STATUT } from "./libelles";
import StatistiquesVue from "./StatistiquesVue";

type Vue = "liste" | "fiches" | "stats" | "carte" | "galerie" | "admins";

const ONGLETS: { vue: Vue; libelle: string; superSeulement?: boolean }[] = [
  { vue: "liste", libelle: "Liste des dossiers" },
  { vue: "fiches", libelle: "Consultation fiche par fiche" },
  { vue: "stats", libelle: "Statistiques" },
  { vue: "carte", libelle: "Carte" },
  { vue: "galerie", libelle: "Galerie photos" },
  { vue: "admins", libelle: "Administrateurs", superSeulement: true },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vue?: string; ref?: string }>;
}) {
  const session = await obtenirSession();
  if (!session) redirect("/admin/connexion");
  const estSuper = session.role === "super";
  // Administrateur de district : toutes les données sont limitées à son district
  const district = districtAutorise(session);

  const { q, vue: vueDemandee, ref } = await searchParams;
  const onglets = ONGLETS.filter((o) => estSuper || !o.superSeulement);
  const vue: Vue = onglets.find((o) => o.vue === vueDemandee)?.vue ?? "liste";
  const avecRecherche = vue === "liste" || vue === "fiches";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {district ? `Dossiers — district ${district}` : "Dossiers reçus"}
          </h1>
          <p className="text-sm text-zinc-500">
            {estSuper ? "Super-administrateur — tous les districts" : `Administrateur : ${session.nom}`}
          </p>
        </div>
        <BoutonDeconnexion />
      </header>

      <nav className="mt-4 flex flex-wrap gap-1 border-b border-zinc-200">
        {onglets.map((o) => (
          <Link
            key={o.vue}
            href={
              (o.vue === "liste" || o.vue === "fiches") && q
                ? `/admin?vue=${o.vue}&q=${encodeURIComponent(q)}`
                : `/admin?vue=${o.vue}`
            }
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              vue === o.vue
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {o.libelle}
          </Link>
        ))}
      </nav>

      {avecRecherche && (
        <form className="mt-4" method="get">
          <input type="hidden" name="vue" value={vue} />
          <input
            className="input max-w-sm"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Rechercher par référence, association, commune, responsable, téléphone..."
          />
        </form>
      )}

      {vue === "liste" && <ListeDossiers dossiers={await listerDossiers(q, 200, district)} estSuper={estSuper} />}
      {vue === "fiches" && (
        <FichesDossiers
          key={q ?? ""}
          dossiers={await listerDossiers(q, 200, district)}
          referenceInitiale={ref}
          peutGerer={estSuper}
        />
      )}
      {vue === "stats" && <StatistiquesVue district={district} />}
      {vue === "carte" && <CarteAdmin districtImpose={district} />}
      {vue === "galerie" && (
        <GalerieAdmin photos={await listerPhotos()} auteur={estSuper ? "super" : session.id} />
      )}
      {vue === "admins" && estSuper && <AdministrateursVue administrateurs={await listerAdministrateurs()} />}
    </div>
  );
}

function ListeDossiers({ dossiers, estSuper }: { dossiers: Dossier[]; estSuper: boolean }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-2">Référence</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Association</th>
            <th className="px-4 py-2">Commune</th>
            <th className="px-4 py-2">Responsable</th>
            <th className="px-4 py-2">Téléphone</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">SMS</th>
            <th className="sticky right-0 bg-zinc-50 px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {dossiers.map((d) => (
            <tr key={d.reference} className="hover:bg-zinc-50">
              <td className="px-4 py-2">
                <Link href={`/admin/${d.reference}`} className="whitespace-nowrap font-medium text-zinc-900 underline">
                  {d.reference}
                </Link>
              </td>
              <td className="px-4 py-2">{new Date(d.dateDepot).toLocaleString("fr-FR")}</td>
              <td className="px-4 py-2">{d.association.nom}</td>
              <td className="px-4 py-2">{d.association.commune || "—"}</td>
              <td className="px-4 py-2">
                {d.responsables[0]?.prenom} {d.responsables[0]?.nom}
              </td>
              <td className="px-4 py-2">{d.coordonnees.telephone}</td>
              <td className="px-4 py-2">{LIBELLES_STATUT[d.statut] ?? d.statut}</td>
              <td className="px-4 py-2">{LIBELLES_SMS[d.statutSms] ?? d.statutSms}</td>
              <td className="sticky right-0 bg-white px-4 py-2 text-right shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin?vue=fiches&ref=${encodeURIComponent(d.reference)}`}
                    className="whitespace-nowrap rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Consulter
                  </Link>
                  {estSuper && <BoutonSupprimer reference={d.reference} association={d.association.nom} />}
                </div>
              </td>
            </tr>
          ))}
          {dossiers.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                Aucun dossier trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
