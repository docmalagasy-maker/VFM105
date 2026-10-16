import Link from "next/link";
import { listerPersonnes } from "@/lib/personnes";
import type { DossierPersonne } from "@/lib/personnes-modele";
import BoutonSupprimerPersonne from "./olona/BoutonSupprimerPersonne";
import { LIBELLES_EMAIL, LIBELLES_STATUT } from "./libelles";

/** Âge à la date du jour, d'après une date AAAA-MM-JJ. */
export function age(dateNaissance: string): number {
  const [a, m, j] = dateNaissance.split("-").map(Number);
  const auj = new Date();
  let n = auj.getFullYear() - a;
  if (auj.getMonth() + 1 < m || (auj.getMonth() + 1 === m && auj.getDate() < j)) n -= 1;
  return n;
}

export const dateNaissanceFr = (d: string) => d.split("-").reverse().join("/");

export function libelleEmailPersonne(p: DossierPersonne): string {
  if (!p.email) return "Pas d'adresse";
  return p.emailConfirmation ? (LIBELLES_EMAIL[p.emailConfirmation] ?? p.emailConfirmation) : "—";
}

/** Onglet « Personnes » : dossiers des personnes physiques (références VFM-P-…). */
export default async function PersonnesVue({
  q,
  district,
  estSuper,
}: {
  q?: string;
  district?: string;
  estSuper: boolean;
}) {
  const personnes = await listerPersonnes(q, 200, district);

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {personnes.length} dossier(s) de personne{district && ` — district ${district}`}
          {personnes.length === 200 && " (200 plus récents affichés)"}
        </p>
        <a
          href="/api/admin/export?type=personnes"
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Exporter les personnes (CSV)
        </a>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Référence</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Nom et prénom</th>
              <th className="px-4 py-2 text-right">Âge</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Activité</th>
              <th className="px-4 py-2">Téléphone</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">CV</th>
              <th className="px-4 py-2">E-mail</th>
              <th className="sticky right-0 bg-zinc-50 px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {personnes.map((p) => (
              <tr key={p.reference} className="hover:bg-zinc-50">
                <td className="px-4 py-2">
                  <Link href={`/admin/olona/${p.reference}`} className="whitespace-nowrap font-medium text-zinc-900 underline">
                    {p.reference}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2">{new Date(p.dateDepot).toLocaleString("fr-FR")}</td>
                <td className="px-4 py-2">
                  {p.prenom} {p.nom}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{age(p.dateNaissance)}</td>
                <td className="px-4 py-2">{p.district}</td>
                <td className="px-4 py-2">{p.activite}</td>
                <td className="whitespace-nowrap px-4 py-2">{p.telephone}</td>
                <td className="px-4 py-2">{LIBELLES_STATUT[p.statut] ?? p.statut}</td>
                <td className="px-4 py-2">{p.cv ? "Oui" : "—"}</td>
                <td className="px-4 py-2">{libelleEmailPersonne(p)}</td>
                <td className="sticky right-0 bg-white px-4 py-2 text-right shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/olona/${p.reference}`}
                      className="whitespace-nowrap rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Consulter
                    </Link>
                    {estSuper && <BoutonSupprimerPersonne reference={p.reference} nom={`${p.prenom} ${p.nom}`} />}
                  </div>
                </td>
              </tr>
            ))}
            {personnes.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-zinc-500">
                  Aucun dossier de personne trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
