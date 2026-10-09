import Link from "next/link";
import { listerDossiers } from "@/lib/repository";
import { listerPhotos } from "@/lib/galerie";
import type { Dossier } from "@/lib/types";
import BoutonSupprimer from "./BoutonSupprimer";
import FichesDossiers from "./FichesDossiers";
import GalerieAdmin from "./GalerieAdmin";
import { LIBELLES_SMS, LIBELLES_STATUT } from "./libelles";
import StatistiquesVue from "./StatistiquesVue";

type Vue = "liste" | "fiches" | "stats" | "galerie";

const ONGLETS: { vue: Vue; libelle: string }[] = [
  { vue: "liste", libelle: "Liste des dossiers" },
  { vue: "fiches", libelle: "Consultation fiche par fiche" },
  { vue: "stats", libelle: "Statistiques" },
  { vue: "galerie", libelle: "Galerie photos" },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vue?: string; ref?: string }>;
}) {
  const { q, vue: vueDemandee, ref } = await searchParams;
  const vue: Vue =
    vueDemandee === "fiches" || vueDemandee === "stats" || vueDemandee === "galerie" ? vueDemandee : "liste";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Dossiers reçus</h1>

      <nav className="mt-4 flex flex-wrap gap-1 border-b border-zinc-200">
        {ONGLETS.map((o) => (
          <Link
            key={o.vue}
            href={o.vue === "stats" || o.vue === "galerie" ? `/admin?vue=${o.vue}` : `/admin?vue=${o.vue}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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

      {vue === "stats" ? (
        <StatistiquesVue />
      ) : vue === "galerie" ? (
        <GalerieAdmin photos={await listerPhotos()} />
      ) : (
        <>
          <form className="mt-4" method="get">
            <input type="hidden" name="vue" value={vue} />
            <input
              className="input max-w-sm"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher par référence, association, district, responsable, téléphone..."
            />
          </form>
          {vue === "fiches" ? (
            <FichesDossiers key={q ?? ""} dossiers={await listerDossiers(q)} referenceInitiale={ref} />
          ) : (
            <ListeDossiers dossiers={await listerDossiers(q)} />
          )}
        </>
      )}
    </div>
  );
}

function ListeDossiers({ dossiers }: { dossiers: Dossier[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-2">Référence</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Association</th>
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
                  <BoutonSupprimer reference={d.reference} association={d.association.nom} />
                </div>
              </td>
            </tr>
          ))}
          {dossiers.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                Aucun dossier trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
