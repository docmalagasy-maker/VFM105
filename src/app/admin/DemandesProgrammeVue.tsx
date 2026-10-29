import { listerDemandesProgramme } from "@/lib/demandes-programme";

/**
 * Onglet « Demandes de programme » (super-administrateur) : adresses laissées
 * depuis la zone rouge de l'affiche de l'accueil, les plus récentes en tête.
 */
export default async function DemandesProgrammeVue() {
  const demandes = await listerDemandesProgramme();

  return (
    <div className="mt-6 flex flex-col gap-4">
      <p className="text-sm text-zinc-500">
        {demandes.length} demande{demandes.length > 1 ? "s" : ""} de réception du programme de la conférence
      </p>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Date de la demande</th>
              <th className="px-4 py-2">Adresse e-mail</th>
              <th className="px-4 py-2">Demande</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {demandes.map((d) => (
              <tr key={d.id} className="hover:bg-zinc-50">
                <td className="whitespace-nowrap px-4 py-2">{new Date(d.creeLe).toLocaleString("fr-FR")}</td>
                <td className="px-4 py-2">
                  <a href={`mailto:${d.email}`} className="text-zinc-900 underline">
                    {d.email}
                  </a>
                </td>
                <td className="px-4 py-2">Programme demandé</td>
              </tr>
            ))}
            {demandes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  Aucune demande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
