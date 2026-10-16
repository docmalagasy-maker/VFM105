"use client";

import dynamic from "next/dynamic";

/** Formulaire chargé seulement dans le navigateur (il lit le brouillon local au démarrage). */
const FormulairePersonne = dynamic(() => import("./FormulairePersonne"), {
  ssr: false,
  loading: () => <p className="py-16 text-center text-sm text-zinc-500">Mampiditra...</p>,
});

export default function ChargeurFormulaire() {
  return <FormulairePersonne />;
}
