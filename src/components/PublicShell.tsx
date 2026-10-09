import Image from "next/image";
import type { ReactNode } from "react";

export default function PublicShell({
  children,
  cardClassName = "max-w-md",
  menu,
}: {
  children: ReactNode;
  cardClassName?: string;
  /** Menu affiché entre le logo et la carte (accueil, galerie). */
  menu?: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh w-full bg-vfm-public">
      <div className="vfm-lisere h-1.5 w-full" />

      <div className="flex min-h-dvh w-full flex-col items-center px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <div className="relative mb-6 aspect-[966/852] w-[clamp(13rem,42vw,19rem)] sm:mb-8">
          <Image
            src="/images/logo-vfm-detoure.png"
            alt="Logo VFM — Vovonan'ny Fihavaozan'i Madagasikara"
            fill
            sizes="(max-width: 640px) 70vw, 19rem"
            className="object-contain"
            priority
          />
        </div>

        {menu && <div className="mb-6 w-full">{menu}</div>}

        <div
          className={`w-full ${cardClassName} overflow-hidden rounded-3xl border border-vfm-beige-bord bg-white shadow-[0_20px_50px_-20px_rgba(20,43,71,0.25)]`}
        >
          <div className="vfm-lisere h-1" />
          <div className="p-6 sm:p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
