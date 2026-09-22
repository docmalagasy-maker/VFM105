import Link from "next/link";
import { listerDossiers } from "@/lib/repository";

const LIBELLES_STATUT: Record<string, string> = {
  recu: "Reçu",
  en_cours: "En cours d'étude",
  informations_demandees: "Informations demandées",
  accepte: "Accepté",
  refuse: "Refusé",
  archive: "Archivé",
};

const LIBELLES_SMS: Record<string, string> = {
  a_envoyer: "À envoyer",
  envoye: "Envoyé",
  echoue: "Échoué",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const dossiers = await listerDossiers(q);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Dossiers reçus</h1>

      <form className="mt-4" method="get">
        <input
          className="input max-w-sm"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par référence, association, responsable, téléphone..."
        />
      </form>

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
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {dossiers.map((d) => (
              <tr key={d.reference} className="hover:bg-zinc-50">
                <td className="px-4 py-2">
                  <Link href={`/admin/${d.reference}`} className="font-medium text-zinc-900 underline">
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
              </tr>
            ))}
            {dossiers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Aucun dossier trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
