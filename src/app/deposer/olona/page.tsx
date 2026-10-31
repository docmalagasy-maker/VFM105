import type { Metadata } from "next";
import { connection } from "next/server";
import PageInscriptionsCompletes, { inscriptionsCompletes } from "@/components/InscriptionsCompletes";
import ChargeurFormulaire from "./ChargeurFormulaire";

export const metadata: Metadata = {
  title: "Dosie manokana — VFM 105",
  description: "Fametrahana dosie ho an'ny olona tsirairay eo amin'ny VFM 105.",
};

export default async function DeposerPersonnePage() {
  // Formulaire fermé dès que les 200 places sont prises (vérifié à chaque visite)
  await connection();
  if (await inscriptionsCompletes()) return <PageInscriptionsCompletes />;
  return <ChargeurFormulaire />;
}
