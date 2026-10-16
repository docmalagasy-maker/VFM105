"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Modifier, activer/désactiver, supprimer un sondage (super-administrateur). */
export default function ActionsSondage({
  id,
  titre,
  actif,
  apresSuppression,
}: {
  id: number;
  titre: string;
  actif: boolean;
  /** Page à afficher après la suppression (sinon simple rafraîchissement). */
  apresSuppression?: string;
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function appeler(methode: "PATCH" | "DELETE", corps?: object) {
    setEnCours(true);
    try {
      const reponse = await fetch(new URL(`/api/admin/sondages/${id}`, window.location.origin), {
        method: methode,
        headers: corps ? { "Content-Type": "application/json" } : undefined,
        body: corps ? JSON.stringify(corps) : undefined,
      });
      if (!reponse.ok) {
        const json = await reponse.json().catch(() => null);
        window.alert(json?.erreur ?? "L'action a échoué.");
        return false;
      }
      return true;
    } catch {
      window.alert("L'action a échoué (problème de connexion).");
      return false;
    } finally {
      setEnCours(false);
    }
  }

  async function basculer() {
    if (await appeler("PATCH", { actif: !actif })) router.refresh();
  }

  async function supprimer() {
    const confirme = window.confirm(
      `Supprimer définitivement le sondage « ${titre} » et toutes ses réponses ?\n\nCette action est irréversible.`
    );
    if (!confirme) return;
    if (await appeler("DELETE")) {
      if (apresSuppression) router.push(apresSuppression);
      router.refresh();
    }
  }

  const bouton = "whitespace-nowrap rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-50";
  return (
    <>
      <Link href={`/admin/sondages/${id}/modifier`} className={`${bouton} border-zinc-300 text-zinc-700 hover:bg-zinc-50`}>
        Modifier
      </Link>
      <button
        type="button"
        onClick={basculer}
        disabled={enCours}
        className={`${bouton} border-zinc-300 text-zinc-700 hover:bg-zinc-50`}
      >
        {actif ? "Désactiver" : "Activer"}
      </button>
      <button
        type="button"
        onClick={supprimer}
        disabled={enCours}
        className={`${bouton} border-red-300 text-red-700 hover:bg-red-50`}
      >
        Supprimer
      </button>
    </>
  );
}
