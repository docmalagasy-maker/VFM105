"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

/** Dimensions de l'affiche : le calque des zones cliquables reprend le même repère. */
const LARGEUR = 1121;
const HAUTEUR = 1403;

const emailSchema = z.string().trim().max(254).email();

type Etape = "question" | "email" | "envoi" | "merci";

/**
 * Affiche de l'accueil avec trois zones cliquables, alignées sur l'image à
 * toutes les tailles (calque SVG de même viewBox, posé par-dessus) :
 * - logo VFM → page Birao ;
 * - bandeau rouge → pop-up de demande du programme de la conférence ;
 * - bandeau jaune → formulaire d'inscription individuelle.
 */
export default function AfficheInteractive() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="relative w-full sm:w-fit">
      <Image
        src="/images/affiche-tafa-dinika-interactive.png"
        alt="Tafa & dinika — Fanabeazana olom-pirenena, 14 Novambra 2026, Tranom-pokonolona Ambohidratrimo"
        width={LARGEUR}
        height={HAUTEUR}
        sizes={`(max-width: 640px) 100vw, min(100vw, calc(100dvh * ${LARGEUR} / ${HAUTEUR}))`}
        className="block h-auto w-full sm:w-auto sm:max-h-[100dvh] sm:max-w-full sm:rounded-3xl sm:shadow-[0_20px_50px_-20px_rgba(20,43,71,0.35)]"
        priority
      />
      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        className="absolute inset-0 h-full w-full"
        aria-label="Zones cliquables de l'affiche"
      >
        <Link href="/birao" aria-label="Birao — membres du bureau" className="zone-affiche">
          <title>Birao</title>
          <rect x={35} y={36} width={319} height={268} rx={12} />
        </Link>
        <a
          href="#programme"
          role="button"
          aria-label="Recevoir le programme de la conférence"
          className="zone-affiche"
          onClick={(e) => {
            e.preventDefault();
            setOuvert(true);
          }}
        >
          <title>Programme de la conférence</title>
          <rect x={60} y={587} width={454} height={128} rx={3} />
        </a>
        <Link href="/deposer/olona" aria-label="Inscription individuelle" className="zone-affiche">
          <title>Fisoratana anarana</title>
          <rect x={38} y={1288} width={1030} height={50} rx={25} />
        </Link>
      </svg>

      {ouvert && <PopupProgramme fermer={() => setOuvert(false)} />}
    </div>
  );
}

function PopupProgramme({ fermer }: { fermer: () => void }) {
  const [etape, setEtape] = useState<Etape>("question");
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState("");
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const echap = (e: KeyboardEvent) => e.key === "Escape" && fermer();
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [fermer]);

  useEffect(() => {
    if (etape === "email") champ.current?.focus();
  }, [etape]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    const valeur = email.trim();
    if (!emailSchema.safeParse(valeur).success) {
      setErreur("Adresse e-mail invalide.");
      return;
    }
    setErreur("");
    setEtape("envoi");
    try {
      const reponse = await fetch("/api/programme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: valeur }),
      });
      if (!reponse.ok) {
        const data = await reponse.json().catch(() => null);
        throw new Error(data?.erreur ?? "Demande non enregistrée. Réessayez.");
      }
      setEtape("merci");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Demande non enregistrée. Réessayez.");
      setEtape("email");
    }
  }

  const bouton = "w-full rounded-xl px-5 py-3 text-base font-semibold transition-colors sm:w-auto";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-programme"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={fermer}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="titre-programme" className="text-lg font-semibold text-vfm-marine">
          {etape === "merci"
            ? "Demande enregistrée"
            : "Voulez-vous recevoir à l'avance le programme de la conférence ?"}
        </p>

        {etape === "question" && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={fermer} className={`${bouton} border border-zinc-300 text-zinc-700 hover:bg-zinc-50`}>
              Non
            </button>
            <button
              type="button"
              onClick={() => setEtape("email")}
              className={`${bouton} bg-vfm-vert text-white hover:bg-vfm-vert-dark`}
            >
              Oui, je veux recevoir le programme
            </button>
          </div>
        )}

        {(etape === "email" || etape === "envoi") && (
          <form className="mt-4 flex flex-col gap-3" onSubmit={envoyer} noValidate>
            <label htmlFor="email-programme" className="text-sm text-zinc-600">
              Votre adresse e-mail
            </label>
            <input
              ref={champ}
              id="email-programme"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              aria-invalid={erreur ? true : undefined}
              aria-describedby={erreur ? "erreur-programme" : undefined}
              disabled={etape === "envoi"}
              required
            />
            {erreur && (
              <p id="erreur-programme" className="text-sm text-vfm-rouge">
                {erreur}
              </p>
            )}
            <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={fermer} className={`${bouton} border border-zinc-300 text-zinc-700 hover:bg-zinc-50`}>
                Annuler
              </button>
              <button
                type="submit"
                disabled={etape === "envoi"}
                className={`${bouton} bg-vfm-vert text-white hover:bg-vfm-vert-dark disabled:opacity-60`}
              >
                {etape === "envoi" ? "Envoi…" : "Valider"}
              </button>
            </div>
          </form>
        )}

        {etape === "merci" && (
          <>
            <p className="mt-3 text-sm text-zinc-600">
              Le programme de la conférence vous sera envoyé à l&apos;adresse {email.trim()}.
            </p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={fermer} className={`${bouton} bg-vfm-vert text-white hover:bg-vfm-vert-dark`}>
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
