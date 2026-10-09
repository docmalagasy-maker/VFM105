"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BoutonSupprimer({
  reference,
  association,
}: {
  reference: string;
  association: string;
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function supprimer() {
    const confirme = window.confirm(
      `Supprimer définitivement le dossier ${reference} (${association}) et ses pièces jointes ?\n\nCette action est irréversible.`
    );
    if (!confirme) return;

    setEnCours(true);
    try {
      // URL absolue construite sur l'origine : fonctionne même si la page a été
      // ouverte avec les identifiants dans l'adresse (http://user:mdp@...).
      const url = new URL(`/api/admin/dossiers/${encodeURIComponent(reference)}`, window.location.origin);
      const reponse = await fetch(url, { method: "DELETE" });
      if (!reponse.ok) {
        const json = await reponse.json().catch(() => null);
        window.alert(json?.erreur ?? "La suppression a échoué.");
        return;
      }
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
      className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {enCours ? "Suppression..." : "Supprimer"}
    </button>
  );
}
