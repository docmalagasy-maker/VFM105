import { connection } from "next/server";
import DepotWizard from "@/components/DepotWizard";
import PageInscriptionsCompletes, { inscriptionsCompletes } from "@/components/InscriptionsCompletes";

export default async function DeposerPage() {
  // Formulaire fermé dès que les 200 places sont prises (vérifié à chaque visite)
  await connection();
  if (await inscriptionsCompletes()) return <PageInscriptionsCompletes />;
  return <DepotWizard />;
}
