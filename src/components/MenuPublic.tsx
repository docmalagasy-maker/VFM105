"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { API_RADIO_URL } from "@/lib/radio";

const EMAIL_CONTACT = "contact.vfm@0550.site";
/** Fréquence de vérification de la diffusion pour l'indicateur LIVE. */
const VERIFICATION_RADIO_MS = 30_000;

/** Pages du menu, dans un ordre fixe. `actif` : la page affichée correspond à ce bouton. */
const MENUS: { href: string; libelle: string; actif: (chemin: string) => boolean }[] = [
  { href: "/", libelle: "Dossier", actif: (c) => c === "/" },
  { href: "/birao", libelle: "Birao", actif: (c) => c === "/birao" },
  { href: "/galerie", libelle: "Sary", actif: (c) => c === "/galerie" },
  { href: "/radio", libelle: "Radio", actif: (c) => c === "/radio" },
  { href: "/sondages", libelle: "Manehoa hevitra", actif: (c) => c === "/sondages" || c.startsWith("/sondages/") },
];

const BOUTON = "whitespace-nowrap rounded-full px-3 py-2 sm:px-4 transition-colors";
// Page en cours : bouton gardé à sa place, grisé et inactif.
const BOUTON_EN_COURS = `${BOUTON} cursor-default bg-zinc-100 text-zinc-400`;

/**
 * Station en marche (diffusion effective), vérifiée régulièrement auprès
 * d'AzuraCast ; `false` tant que l'information n'est pas confirmée, pour ne
 * jamais afficher un « LIVE » trompeur.
 */
function useRadioEnDirect(): boolean {
  const [enDirect, setEnDirect] = useState(false);
  useEffect(() => {
    let actif = true;
    async function verifier() {
      if (document.visibilityState === "hidden") return;
      try {
        const reponse = await fetch(API_RADIO_URL, { cache: "no-store" });
        const donnees = reponse.ok ? await reponse.json() : null;
        if (actif) setEnDirect(Boolean(donnees?.is_online));
      } catch {
        if (actif) setEnDirect(false);
      }
    }
    verifier();
    const minuterie = setInterval(verifier, VERIFICATION_RADIO_MS);
    document.addEventListener("visibilitychange", verifier);
    return () => {
      actif = false;
      clearInterval(minuterie);
      document.removeEventListener("visibilitychange", verifier);
    };
  }, []);
  return enDirect;
}

/** Menus publics, identiques et à la même place sur toutes les pages publiques. */
export default function MenuPublic() {
  const chemin = usePathname();
  const [contactOuvert, setContactOuvert] = useState(false);
  const radioEnDirect = useRadioEnDirect();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Sur téléphone, les menus passent sur deux lignes au besoin */}
      <nav className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-3xl border border-vfm-beige-bord bg-white/80 p-1 text-sm font-medium shadow-sm backdrop-blur">
        {MENUS.map((m) => {
          const enCours = m.actif(chemin);
          if (m.href === "/radio") {
            return <BoutonRadio key={m.href} enCours={enCours} enDirect={radioEnDirect} />;
          }
          return enCours ? (
            <span key={m.href} aria-current="page" aria-disabled="true" className={BOUTON_EN_COURS}>
              {m.libelle}
            </span>
          ) : (
            <Link key={m.href} href={m.href} className={`${BOUTON} text-vfm-marine hover:bg-vfm-beige`}>
              {m.libelle}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setContactOuvert((o) => !o)}
          aria-expanded={contactOuvert}
          className={`${BOUTON} ${contactOuvert ? "bg-vfm-marine text-white" : "text-vfm-marine hover:bg-vfm-beige"}`}
        >
          Resaho izahay
        </button>
      </nav>

      {contactOuvert && (
        <p className="rounded-2xl border border-vfm-beige-bord bg-white px-5 py-3 text-center text-sm text-zinc-600 shadow-sm">
          Mailaka :{" "}
          <a href={`mailto:${EMAIL_CONTACT}`} className="font-semibold text-vfm-vert-dark underline">
            {EMAIL_CONTACT}
          </a>
        </p>
      )}
    </div>
  );
}

/**
 * Bouton « Radio » à l'apparence distincte (fond marine, icône d'ondes).
 * Pendant la diffusion : pastille « LIVE » rouge et mot « Radio » qui pulse
 * doucement (animation coupée si le visiteur a demandé moins de mouvement).
 */
function BoutonRadio({ enCours, enDirect }: { enCours: boolean; enDirect: boolean }) {
  const contenu = (
    <>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path strokeLinecap="round" d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.4 5.4a9.3 9.3 0 0 0 0 13.2M18.6 5.4a9.3 9.3 0 0 1 0 13.2" />
      </svg>
      <span className={enDirect && !enCours ? "radio-pulse" : undefined}>Radio</span>
      {enDirect && (
        <span className="inline-flex items-center gap-1 rounded-full bg-vfm-rouge px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-white">
          <span className="radio-point h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
          LIVE
        </span>
      )}
    </>
  );
  const titre = enDirect ? "Radio VFM — mandeha mivantana" : "Radio VFM";
  const base = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 sm:px-4 transition-colors";

  return enCours ? (
    <span aria-current="page" aria-disabled="true" title={titre} className={`${base} cursor-default bg-zinc-100 text-zinc-400`}>
      {contenu}
    </span>
  ) : (
    <Link href="/radio" title={titre} className={`${base} bg-vfm-marine text-white shadow-sm hover:bg-vfm-marine-dark`}>
      {contenu}
    </Link>
  );
}
