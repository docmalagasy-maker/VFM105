"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { IconPeople } from "@/components/icons";
import { SEUIL_DECOMPTE, type EtatInscriptions } from "@/lib/inscriptions-regles";
import { useEtatInscriptions } from "@/lib/useEtatInscriptions";

/**
 * Les deux boutons de dépôt de l'accueil, toujours visibles sous l'affiche :
 * - Fikambanana : formulaire des associations, inchangé (/deposer) ;
 * - Ny tenako manokana : formulaire des personnes physiques (/deposer/olona).
 * À partir de 180 inscrits, un macaron donne les places restantes ; à 200,
 * « COMPLET » et les deux boutons sont désactivés, barrés d'un bandeau.
 */
export default function ChoixDepot({ etatInitial }: { etatInitial: EtatInscriptions | null }) {
  const etat = useEtatInscriptions(etatInitial);
  const complet = etat?.complet ?? false;
  const decompte = etat && etat.inscrits >= SEUIL_DECOMPTE;

  const carte =
    "flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all";
  const actif = complet ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5";

  return (
    <div className="mt-6 flex w-full flex-col gap-3" role="group" aria-label="Karazana dosie">
      <p className="text-center text-base font-semibold text-vfm-marine-dark">
        Amin&apos;ny anaran&apos;iza no hisoratanao anarana&nbsp;?
      </p>

      {decompte && (
        <p className="flex justify-center" aria-live="polite">
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow-md ${
              complet ? "bg-vfm-rouge" : "bg-vfm-marine"
            }`}
          >
            {complet ? "COMPLET" : `${etat.restantes} ${etat.restantes > 1 ? "places restantes" : "place restante"}`}
          </span>
        </p>
      )}

      <div className="relative flex flex-col gap-3">
        <BoutonDepot href="/deposer" desactive={complet} className={`${carte} ${actif} border-vfm-vert bg-vfm-vert text-white shadow-lg shadow-vfm-vert/25 ${complet ? "" : "hover:bg-vfm-vert-dark"}`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <IconPeople className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-semibold">Fikambanana</span>
            <span className="block text-sm text-white/85">sy ny mombamomba azy</span>
          </span>
        </BoutonDepot>
        <BoutonDepot href="/deposer/olona" desactive={complet} className={`${carte} ${actif} border-vfm-vert bg-white text-vfm-marine ${complet ? "" : "hover:bg-vfm-vert/5"}`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vfm-vert/10 text-vfm-vert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path strokeLinecap="round" d="M4 20v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
            </svg>
          </span>
          <span>
            <span className="block font-semibold">Ny tenako manokana</span>
            <span className="block text-sm text-zinc-600">sy ny mombamomba ahy</span>
          </span>
        </BoutonDepot>

        {complet && (
          // Bandeau en travers des deux boutons
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
            <span className="w-[115%] -rotate-6 bg-vfm-rouge py-2 text-center text-xl font-extrabold uppercase tracking-[0.3em] text-white shadow-lg">
              COMPLET
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function BoutonDepot({
  href,
  desactive,
  className,
  children,
}: {
  href: string;
  desactive: boolean;
  className: string;
  children: ReactNode;
}) {
  if (desactive) {
    return (
      <span role="link" aria-disabled="true" className={className}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
