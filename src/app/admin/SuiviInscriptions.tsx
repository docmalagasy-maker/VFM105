"use client";

import { SEUIL_DECOMPTE, type EtatInscriptions } from "@/lib/inscriptions-regles";
import { useEtatInscriptions } from "@/lib/useEtatInscriptions";

/** Remplissage des Tafa & Dinika, visible en permanence en haut de l'administration (relu toutes les 30 s). */
export default function SuiviInscriptions({ etatInitial }: { etatInitial: EtatInscriptions | null }) {
  const etat = useEtatInscriptions(etatInitial);
  if (!etat) return null;

  const couleur = etat.complet ? "bg-red-600" : etat.inscrits >= SEUIL_DECOMPTE ? "bg-amber-500" : "bg-emerald-600";

  return (
    <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4" aria-label="Suivi des inscriptions">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">Inscriptions Tafa &amp; Dinika</h2>
        {etat.complet && (
          <span className="rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            Complet
          </span>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <dt className="text-xs text-zinc-500">Inscrits</dt>
          <dd className="text-2xl font-bold text-zinc-900">
            {etat.inscrits}
            <span className="text-sm font-medium text-zinc-500"> / {etat.limite}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Places restantes</dt>
          <dd className="text-2xl font-bold text-zinc-900">{etat.restantes}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Taux de remplissage</dt>
          <dd className="text-2xl font-bold text-zinc-900">{etat.taux.toLocaleString("fr-FR")} %</dd>
        </div>
      </dl>
      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={etat.limite}
        aria-valuenow={Math.min(etat.inscrits, etat.limite)}
        aria-label="Taux de remplissage"
      >
        <div className={`h-full rounded-full ${couleur} transition-[width]`} style={{ width: `${etat.taux}%` }} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Associations et personnes confondues ; les dossiers refusés ou supprimés libèrent leur place.
      </p>
    </section>
  );
}
