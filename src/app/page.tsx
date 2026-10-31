import { connection } from "next/server";
import PublicShell from "@/components/PublicShell";
import { etatInscriptions } from "@/lib/inscriptions";
import AfficheInteractive from "./AfficheInteractive";
import ChoixDepot from "./ChoixDepot";

export default async function Accueil() {
  // Nombre d'inscrits lu à chaque visite (places restantes, « COMPLET »)
  await connection();
  const etat = await etatInscriptions().catch((err) => {
    console.error("État des inscriptions (accueil)", err);
    return null;
  });

  return (
    <PublicShell sansCarte>
      {/* Affiche en pleine largeur sur mobile, limitée à la hauteur de l'écran sur grand écran */}
      <div className="-mx-4 flex w-[calc(100%+2rem)] flex-col items-center sm:mx-0 sm:w-full">
        <AfficheInteractive />
      </div>
      <div className="w-full max-w-md">
        <ChoixDepot etatInitial={etat} />
      </div>
    </PublicShell>
  );
}
