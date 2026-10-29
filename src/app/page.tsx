import PublicShell from "@/components/PublicShell";
import AfficheInteractive from "./AfficheInteractive";
import ChoixDepot from "./ChoixDepot";

export default function Accueil() {
  return (
    <PublicShell sansCarte>
      {/* Affiche en pleine largeur sur mobile, limitée à la hauteur de l'écran sur grand écran */}
      <div className="-mx-4 flex w-[calc(100%+2rem)] flex-col items-center sm:mx-0 sm:w-full">
        <AfficheInteractive />
      </div>
      <div className="w-full max-w-md">
        <ChoixDepot />
      </div>
    </PublicShell>
  );
}
