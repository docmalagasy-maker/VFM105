import { LIBELLES_STATUT_ADMIN, type Administrateur } from "@/lib/administrateurs";
import { emailConfigure } from "@/lib/email";
import ActionsAdministrateur from "./ActionsAdministrateur";

const COULEURS_STATUT: Record<Administrateur["statut"], string> = {
  en_attente: "bg-amber-100 text-amber-900",
  valide: "bg-green-100 text-green-800",
  refuse: "bg-zinc-100 text-zinc-600",
  desactive: "bg-zinc-100 text-zinc-600",
};

/** Onglet réservé au super-administrateur : comptes des administrateurs de district. */
export default function AdministrateursVue({ administrateurs }: { administrateurs: Administrateur[] }) {
  const enAttente = administrateurs.filter((a) => a.statut === "en_attente").length;
  const actifs = administrateurs.filter((a) => a.statut === "valide").length;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
        <p>
          <strong className="text-zinc-900">{actifs}</strong> administrateur(s) de district actif(s) ·{" "}
          <strong className="text-zinc-900">{enAttente}</strong> demande(s) en attente. Un seul
          administrateur par district ; chacun ne voit que les dossiers, statistiques, exports et la
          carte de son district.
        </p>
        <p className="mt-2">
          Les administrateurs font leur demande sur{" "}
          <a href="/admin/inscription" target="_blank" rel="noreferrer" className="font-medium text-zinc-900 underline">
            /admin/inscription
          </a>{" "}
          (lien à leur communiquer) ; chaque demande est à valider ici
          {emailConfigure() ? " ou par le lien reçu par e-mail." : "."}
        </p>
        {!emailConfigure() && (
          <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-amber-900">
            L&apos;envoi d&apos;e-mails n&apos;est pas encore configuré (variables SMTP_* dans Coolify) : les
            nouvelles demandes n&apos;apparaissent que dans cet onglet.
          </p>
        )}
      </section>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Téléphone</th>
              <th className="px-4 py-2">Identifiant</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Demande</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {administrateurs.map((a) => (
              <tr key={a.id}>
                <td className="whitespace-nowrap px-4 py-2 font-medium text-zinc-900">{a.district}</td>
                <td className="whitespace-nowrap px-4 py-2">
                  {a.prenom} {a.nom}
                </td>
                <td className="whitespace-nowrap px-4 py-2">{a.telephone}</td>
                <td className="px-4 py-2">{a.identifiant}</td>
                <td className="px-4 py-2">
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COULEURS_STATUT[a.statut]}`}>
                    {LIBELLES_STATUT_ADMIN[a.statut]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-zinc-500">
                  {new Date(a.creeLe).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-2">
                  <ActionsAdministrateur id={a.id} statut={a.statut} />
                </td>
              </tr>
            ))}
            {administrateurs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Aucun administrateur de district pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
