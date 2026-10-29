import Link from "next/link";
import { redirect } from "next/navigation";
import { listerAdministrateurs } from "@/lib/administrateurs";
import { districtAutorise, obtenirSession } from "@/lib/auth";
import { listerPhotos } from "@/lib/galerie";
import { listerDossiers } from "@/lib/repository";
import { SMS_ACTIF } from "@/lib/sms";
import type { Dossier } from "@/lib/types";
import AdministrateursVue from "./AdministrateursVue";
import BoutonSupprimer from "./BoutonSupprimer";
import CarteAdmin from "./CarteAdmin";
import DemandesProgrammeVue from "./DemandesProgrammeVue";
import EnteteAdmin, { ongletsVisibles, type Vue } from "./EnteteAdmin";
import FichesDossiers from "./FichesDossiers";
import GalerieAdmin from "./GalerieAdmin";
import PersonnesVue from "./PersonnesVue";
import { libelleEmailConfirmation, LIBELLES_SMS, LIBELLES_STATUT } from "./libelles";
import SondagesVue from "./SondagesVue";
import StatistiquesVue from "./StatistiquesVue";

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
  const onglets = ongletsVisibles(session);
  const vue: Vue = onglets.find((o) => o.vue === vueDemandee)?.vue ?? "liste";
  const avecRecherche = vue === "liste" || vue === "fiches" || vue === "personnes";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <EnteteAdmin session={session} vue={vue} q={q} />

      {avecRecherche && (
        <form className="mt-4" method="get">
          <input type="hidden" name="vue" value={vue} />
          <input
            className="input max-w-sm"
            type="search"
            name="q"
            defaultValue={q}
            placeholder={
              vue === "personnes"
                ? "Rechercher par référence, nom, prénom, district, activité, téléphone..."
                : "Rechercher par référence, association, commune, responsable, téléphone..."
            }
          />
        </form>
      )}

      {vue === "liste" && <ListeDossiers dossiers={await listerDossiers(q, 200, district)} estSuper={estSuper} smsActif={SMS_ACTIF} />}
      {vue === "fiches" && (
        <FichesDossiers
          key={q ?? ""}
          dossiers={await listerDossiers(q, 200, district)}
          referenceInitiale={ref}
          peutGerer={estSuper}
          smsActif={SMS_ACTIF}
        />
      )}
      {vue === "personnes" && <PersonnesVue q={q} district={district} estSuper={estSuper} />}
      {vue === "stats" && <StatistiquesVue district={district} />}
      {vue === "carte" && <CarteAdmin districtImpose={district} />}
      {vue === "galerie" && (
        <GalerieAdmin photos={await listerPhotos()} auteur={estSuper ? "super" : session.id} />
      )}
      {vue === "sondages" && <SondagesVue estSuper={estSuper} district={district} />}
      {vue === "programme" && estSuper && <DemandesProgrammeVue />}
      {vue === "admins" && estSuper && <AdministrateursVue administrateurs={await listerAdministrateurs()} />}
    </div>
  );
}

function ListeDossiers({
  dossiers,
  estSuper,
  smsActif,
}: {
  dossiers: Dossier[];
  estSuper: boolean;
  /** Colonne SMS seulement si l'envoi de SMS est actif (src/lib/sms.ts). */
  smsActif: boolean;
}) {
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
            <th className="px-4 py-2">E-mail</th>
            {smsActif && <th className="px-4 py-2">SMS</th>}
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
              <td className="px-4 py-2">{libelleEmailConfirmation(d)}</td>
              {smsActif && <td className="px-4 py-2">{LIBELLES_SMS[d.statutSms] ?? d.statutSms}</td>}
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
              <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
                Aucun dossier trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
