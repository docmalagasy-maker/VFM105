"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StatutDossier } from "@/lib/types";
import { LIBELLES_STATUT } from "../libelles";

/** Changement de statut d'un dossier de personne (super-administrateur). */
export default function StatutPersonne({ reference, statut }: { reference: string; statut: StatutDossier }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function changer(nouveau: string) {
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch(new URL(`/api/admin/personnes/${encodeURIComponent(reference)}/statut`, window.location.origin), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: nouveau }),
      });
      if (!reponse.ok) setErreur((await reponse.json().catch(() => null))?.erreur ?? "Le changement a échoué.");
      router.refresh();
    } catch {
      setErreur("Le changement a échoué (problème de connexion).");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">Statut du dossier</span>
      <select className="input" defaultValue={statut} disabled={enCours} onChange={(e) => changer(e.target.value)}>
        {Object.entries(LIBELLES_STATUT).map(([valeur, libelle]) => (
          <option key={valeur} value={valeur}>
            {libelle}
          </option>
        ))}
      </select>
      {erreur && <span className="text-sm text-red-700">{erreur}</span>}
    </label>
  );
}
