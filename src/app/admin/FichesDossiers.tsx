"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Dossier } from "@/lib/types";
import { LIBELLES_SMS, LIBELLES_STATUT } from "./libelles";

export default function FichesDossiers({
  dossiers,
  referenceInitiale,
  peutGerer,
}: {
  dossiers: Dossier[];
  referenceInitiale?: string;
  /** Lien vers la gestion du statut et du SMS (super-administrateur). */
  peutGerer: boolean;
}) {
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      dossiers.findIndex((d) => d.reference === referenceInitiale),
    ),
  );
  const total = dossiers.length;
  const courant = Math.min(index, total - 1);

  const precedent = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const suivant = useCallback(
    () => setIndex((i) => Math.min(total - 1, i + 1)),
    [total],
  );

  // Flèches du clavier ← → (sauf pendant la saisie dans un champ)
  useEffect(() => {
    function surTouche(e: KeyboardEvent) {
      const cible = e.target as HTMLElement;
      if (cible.closest("input, textarea, select")) return;
      if (e.key === "ArrowLeft") precedent();
      if (e.key === "ArrowRight") suivant();
    }
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [precedent, suivant]);

  if (total === 0) {
    return (
      <p className="mt-6 rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500">
        Aucun dossier trouvé.
      </p>
    );
  }

  const d = dossiers[courant];

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <BoutonFleche
          onClick={precedent}
          desactive={courant === 0}
          libelle="Dossier précédent"
        >
          ←
        </BoutonFleche>
        <select
          className="input max-w-md flex-1"
          value={courant}
          onChange={(e) => setIndex(Number(e.target.value))}
          aria-label="Aller au dossier"
        >
          {dossiers.map((x, i) => (
            <option key={x.reference} value={i}>
              {x.reference} — {x.association.nom}
            </option>
          ))}
        </select>
        <BoutonFleche
          onClick={suivant}
          desactive={courant === total - 1}
          libelle="Dossier suivant"
        >
          →
        </BoutonFleche>
        <span className="text-sm text-zinc-500">
          {courant + 1} / {total}
        </span>
        <span className="hidden text-xs text-zinc-400 sm:inline">
          Astuce : flèches ← → du clavier
        </span>
      </div>

      <article className="mt-4 rounded-lg border border-zinc-200 bg-white">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              {d.association.nom}
            </h2>
            <p className="text-sm text-zinc-500">
              {d.reference} · déposé le{" "}
              {new Date(d.dateDepot).toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
              {LIBELLES_STATUT[d.statut] ?? d.statut}
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
              SMS : {LIBELLES_SMS[d.statutSms] ?? d.statutSms}
            </span>
            {peutGerer && (
              <Link
                href={`/admin/${d.reference}`}
                className="rounded-md border border-zinc-300 px-3 py-1 font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Gérer (statut, SMS)
              </Link>
            )}
          </div>
        </header>

        <div className="grid gap-x-8 md:grid-cols-2">
          <dl className="divide-y divide-zinc-100">
            <Ligne label="District">
              {d.association.district || "Non renseigné"}
            </Ligne>
            <Ligne label="Commune">
              {d.association.commune || "Non renseignée"}
              {d.association.commune && !d.association.communePcode && (
                <span className="text-zinc-400"> (saisie à la main)</span>
              )}
            </Ligne>
            <Ligne label="Fokontany">{d.association.fokontany || "—"}</Ligne>
            <Ligne label="Adresse">
              <span className="whitespace-pre-wrap">
                {d.association.adresse}
              </span>
            </Ligne>
            <Ligne label="Activité">{d.association.activite}</Ligne>
            <Ligne label="Nombre de membres">
              {d.association.nombreMembres}
            </Ligne>
            <Ligne label="Responsables">
              {d.responsables.map((r, i) => (
                <div key={i}>
                  {r.prenom} {r.nom}
                  {i === 0 && d.responsables.length > 1 && (
                    <span className="text-zinc-400"> (principal)</span>
                  )}
                </div>
              ))}
            </Ligne>
          </dl>
          <dl className="divide-y divide-zinc-100">
            <Ligne label="Téléphone">
              <a
                href={`tel:${d.coordonnees.telephone.replace(/\s/g, "")}`}
                className="underline"
              >
                {d.coordonnees.telephone}
              </a>
            </Ligne>
            <Ligne label="E-mail">
              {d.coordonnees.email ? (
                <a href={`mailto:${d.coordonnees.email}`} className="underline">
                  {d.coordonnees.email}
                </a>
              ) : (
                "—"
              )}
            </Ligne>
            <Ligne label="Autres coordonnées">
              {(d.coordonnees.autres ?? []).length === 0
                ? "—"
                : d.coordonnees.autres!.map((a, i) => (
                    <div key={i}>
                      {a.type} : {a.valeur}
                    </div>
                  ))}
            </Ligne>
            <Ligne label="Pièces jointes">
              {d.pieces.length === 0
                ? "Aucune"
                : d.pieces.map((p, i) => (
                    <div key={i}>
                      <a
                        href={`/api/admin/pieces/${p.pathname}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {p.nom}
                      </a>
                    </div>
                  ))}
            </Ligne>
          </dl>
        </div>

        <div className="border-t border-zinc-200 px-5 py-4">
          <p className="text-sm font-medium text-zinc-500">
            Description du projet
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">
            {d.description}
          </p>
        </div>
      </article>
    </div>
  );
}

function BoutonFleche({
  onClick,
  desactive,
  libelle,
  children,
}: {
  onClick: () => void;
  desactive: boolean;
  libelle: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desactive}
      aria-label={libelle}
      title={libelle}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-lg text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Ligne({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:gap-4">
      <dt className="w-full shrink-0 text-sm font-medium text-zinc-500 sm:w-40">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm text-zinc-900">{children}</dd>
    </div>
  );
}
