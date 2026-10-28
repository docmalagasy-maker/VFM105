import Image from "next/image";
import PublicShell from "@/components/PublicShell";
import ChoixDepot from "./ChoixDepot";

export default function Accueil() {
  return (
    <PublicShell sansCarte>
      {/* Affiche en pleine largeur sur mobile, limitée à la hauteur de l'écran sur grand écran */}
      <div className="-mx-4 flex w-[calc(100%+2rem)] flex-col items-center sm:mx-0 sm:w-full">
        <Image
          src="/images/affiche-tafa-dinika.png"
          alt="Tafa & dinika — Fanabeazana ara-politika, 14 Novambra 2026, Tranom-pokonolona Ambohidratrimo"
          width={1122}
          height={1402}
          sizes="(max-width: 640px) 100vw, min(100vw, calc(100dvh * 1122 / 1402))"
          className="h-auto w-full sm:w-auto sm:max-h-[100dvh] sm:max-w-full sm:rounded-3xl sm:shadow-[0_20px_50px_-20px_rgba(20,43,71,0.35)]"
          priority
        />
      </div>
      <div className="w-full max-w-md">
        <ChoixDepot />
      </div>
    </PublicShell>
  );
}
