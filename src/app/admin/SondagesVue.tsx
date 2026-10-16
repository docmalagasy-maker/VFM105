import Link from "next/link";
import { listerSondages } from "@/lib/sondages";
import { MAX_SONDAGES } from "@/lib/sondages-modele";
import ActionsSondage from "./sondages/ActionsSondage";

/**
 * Onglet « Sondages ». Super-administrateur : création et gestion (30
 * thématiques au plus). Administrateur de district : résultats de son district.
 */
export default async function SondagesVue({ estSuper, district }: { estSuper: boolean; district?: string }) {
  const sondages = await listerSondages(district);
  const limiteAtteinte = sondages.length >= MAX_SONDAGES;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {sondages.length} / {MAX_SONDAGES} thématiques
          {district && ` — réponses du district ${district} uniquement`}
          {" · "}page publique : <Link href="/sondages" className="underline">/sondages</Link> (« Manehoa hevitra »)
        </p>
        {estSuper &&
          (limiteAtteinte ? (
            <span className="text-sm text-zinc-500">Limite atteinte : supprimez une thématique pour en créer une.</span>
          ) : (
            <Link
              href="/admin/sondages/nouveau"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Nouveau sondage
            </Link>
          ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Thématique</th>
              <th className="px-4 py-2">État</th>
              <th className="px-4 py-2 text-right">Questions</th>
              <th className="px-4 py-2 text-right">Réponses</th>
              <th className="px-4 py-2">Créé le</th>
              <th className="sticky right-0 bg-zinc-50 px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sondages.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50">
                <td className="px-4 py-2">
                  <Link href={`/admin/sondages/${s.id}`} className="font-medium text-zinc-900 underline">
                    {s.titre}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.actif ? "bg-green-50 text-green-800" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <span aria-hidden>{s.actif ? "●" : "○"}</span>
                    {s.actif ? "Actif (visible)" : "Désactivé"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{s.questions.length}</td>
                <td className="px-4 py-2 text-right tabular-nums">{s.nombreReponses}</td>
                <td className="whitespace-nowrap px-4 py-2">{new Date(s.creeLe).toLocaleDateString("fr-FR")}</td>
                <td className="sticky right-0 bg-white px-4 py-2 text-right shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/sondages/${s.id}`}
                      className="whitespace-nowrap rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Résultats
                    </Link>
                    {estSuper && <ActionsSondage id={s.id} titre={s.titre} actif={s.actif} />}
                  </div>
                </td>
              </tr>
            ))}
            {sondages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Aucun sondage pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
