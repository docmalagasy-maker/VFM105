import Image from "next/image";
import type { ReactNode } from "react";
import MenuPublic from "@/components/MenuPublic";

export default function PublicShell({
  children,
  cardClassName = "max-w-md",
  sansCarte = false,
}: {
  children: ReactNode;
  cardClassName?: string;
  /** Affiche le contenu tel quel, sans la carte blanche (ex. affiche de l'accueil). */
  sansCarte?: boolean;
}) {
  return (
    <div className="relative isolate min-h-dvh w-full">
      {/* Animation de fond : fixe derrière tout le contenu, muette, en boucle */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-vfm-public">
        <video
          className="h-full w-full object-cover"
          src="/videos/fond-vfm.mp4"
          poster="/videos/fond-vfm.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
        />
      </div>

      <div className="vfm-lisere h-1.5 w-full" />

      <div className="flex min-h-dvh w-full flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        {/* Médaillon blanc : le texte gris du logo reste lisible sur le fond animé */}
        <div className="rounded-3xl bg-white/95 px-5 py-3 shadow-[0_12px_30px_-15px_rgba(20,43,71,0.45)]">
          <div className="relative aspect-[966/852] w-[clamp(11rem,38vw,16rem)]">
            <Image
              src="/images/logo-vfm-detoure.png"
              alt="Logo VFM 105 — Vovonan'ny Fihavaozan'i Madagasikara"
              fill
              sizes="(max-width: 640px) 60vw, 16rem"
              className="object-contain"
              priority
            />
          </div>
        </div>
        <p className="mb-6 mt-3 text-center text-3xl font-extrabold uppercase tracking-wide text-white [text-shadow:0_0_2px_rgba(12,28,48,0.9),0_2px_10px_rgba(12,28,48,0.75)] sm:mb-8 sm:text-5xl">
          Ambohidratrimo
        </p>

        {/* Menus Dossier | Birao | Sary | Radio | Manehoa hevitra | Resaho izahay, visibles sur toutes les pages publiques */}
        <div className="mb-6 w-full">
          <MenuPublic />
        </div>

        {sansCarte ? (
          children
        ) : (
          <div
            className={`w-full ${cardClassName} overflow-hidden rounded-3xl border border-vfm-beige-bord bg-white shadow-[0_20px_50px_-20px_rgba(20,43,71,0.25)]`}
          >
            <div className="vfm-lisere h-1" />
            <div className="p-6 sm:p-10">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
