import Image from "next/image";
import type { ReactNode } from "react";

const TEXTE_HAUT_GAUCHE = "Olomboafidy sy Mpitarika";
const TEXTE_HAUT_DROITE = "Ho an'ny voninahitra sy ny fandrosoan'ny fianam-piarahamonina";
const TEXTE_BAS_GAUCHE = "Firaisana, Fandrosoana, Fiarahamiasa";
const TEXTE_BAS_DROITE = "Madagasikara Mandroso Miaraka";

export default function PublicShell({
  children,
  cardClassName = "max-w-md",
}: {
  children: ReactNode;
  cardClassName?: string;
}) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-vfm-texture">
      {/* Textes décoratifs — masqués sur très petit écran pour ne jamais gêner la lecture */}
      <p className="pointer-events-none absolute left-3 top-3 max-w-[38%] font-script text-[clamp(0.7rem,2.2vw,1.35rem)] leading-tight text-white/80 sm:left-6 sm:top-6">
        {TEXTE_HAUT_GAUCHE}
      </p>
      <p className="pointer-events-none absolute right-3 top-3 max-w-[42%] text-right font-script text-[clamp(0.65rem,1.9vw,1.15rem)] leading-tight text-white/70 sm:right-6 sm:top-6">
        {TEXTE_HAUT_DROITE}
      </p>
      <p className="pointer-events-none absolute bottom-3 left-3 hidden max-w-[38%] font-script text-[clamp(0.7rem,2vw,1.25rem)] leading-tight text-white/70 sm:block sm:left-6 sm:bottom-6">
        {TEXTE_BAS_GAUCHE}
      </p>
      <p className="pointer-events-none absolute bottom-3 right-3 hidden max-w-[38%] text-right font-script text-[clamp(0.7rem,2vw,1.25rem)] leading-tight text-white/70 sm:block sm:right-6 sm:bottom-6">
        {TEXTE_BAS_DROITE}
      </p>

      {/* Photo du responsable — desktop uniquement, jamais recadrée de façon agressive */}
      <div className="pointer-events-none absolute right-6 top-6 hidden aspect-[3/4] w-[clamp(9rem,14vw,15rem)] overflow-hidden rounded-2xl shadow-2xl ring-2 ring-white/30 lg:block">
        <Image
          src="/images/responsable.jpg"
          alt=""
          fill
          sizes="15rem"
          className="object-cover"
        />
      </div>

      <div className="relative z-10 flex min-h-dvh w-full flex-col items-center px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-10 lg:pt-8">
        <div className="relative mb-6 h-[clamp(5.5rem,12vw,8.5rem)] w-[clamp(9rem,22vw,14rem)] sm:mb-8">
          <Image
            src="/images/logo-vfm.png"
            alt="Logo VFM — Vovonan'ny Fihavaozan'i Madagasikara"
            fill
            sizes="14rem"
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        <div
          className={`w-full ${cardClassName} rounded-2xl bg-white p-6 shadow-2xl sm:p-8`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
