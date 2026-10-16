import type { Metadata } from "next";
import ChargeurFormulaire from "./ChargeurFormulaire";

export const metadata: Metadata = {
  title: "Dosie manokana — VFM",
  description: "Fametrahana dosie ho an'ny olona tsirairay eo amin'ny VFM.",
};

export default function DeposerPersonnePage() {
  return <ChargeurFormulaire />;
}
