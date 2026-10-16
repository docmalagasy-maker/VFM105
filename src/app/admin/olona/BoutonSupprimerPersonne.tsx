"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Suppression définitive d'un dossier de personne et de son CV (super-administrateur). */
export default function BoutonSupprimerPersonne({
  reference,
  nom,
  apres,
}: {
  reference: string;
  nom: string;
  /** Page à afficher après la suppression (sinon simple rafraîchissement). */
  apres?: string;
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function supprimer() {
    if (!window.confirm(`Supprimer définitivement le dossier ${reference} (${nom}) et son CV ?\n\nCette action est irréversible.`)) {
      return;
    }
    setEnCours(true);
    try {
      const reponse = await fetch(new URL(`/api/admin/personnes/${encodeURIComponent(reference)}`, window.location.origin), {
        method: "DELETE",
      });
      if (!reponse.ok) {
        const json = await reponse.json().catch(() => null);
        window.alert(json?.erreur ?? "La suppression a échoué.");
        return;
      }
      if (apres) router.push(apres);
      router.refresh();
    } catch {
      window.alert("La suppression a échoué (problème de connexion).");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <button
      type="button"
      onClick={supprimer}
      disabled={enCours}
      className="whitespace-nowrap rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
