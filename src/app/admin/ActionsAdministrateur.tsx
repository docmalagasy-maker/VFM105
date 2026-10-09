"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActionAdmin, StatutAdmin } from "@/lib/administrateurs";

const ACTIONS_PAR_STATUT: Record<StatutAdmin, { action: ActionAdmin; libelle: string; danger?: boolean }[]> = {
  en_attente: [
    { action: "valider", libelle: "Valider" },
    { action: "refuser", libelle: "Refuser", danger: true },
  ],
  valide: [{ action: "desactiver", libelle: "Désactiver", danger: true }],
  refuse: [{ action: "supprimer", libelle: "Supprimer", danger: true }],
  desactive: [
    { action: "valider", libelle: "Réactiver" },
    { action: "supprimer", libelle: "Supprimer", danger: true },
  ],
};

const CONFIRMATIONS: Partial<Record<ActionAdmin, string>> = {
  refuser: "Refuser cette demande ?",
  desactiver: "Désactiver ce compte ? L'administrateur ne pourra plus se connecter.",
  supprimer: "Supprimer définitivement ce compte ?",
};

export default function ActionsAdministrateur({
  id,
  statut,
  apres,
}: {
  id: number;
  statut: StatutAdmin;
  /** Page à afficher après l'action (sinon simple rafraîchissement). */
  apres?: string;
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function agir(action: ActionAdmin) {
    if (CONFIRMATIONS[action] && !window.confirm(CONFIRMATIONS[action])) return;
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch(new URL(`/api/admin/administrateurs/${id}`, window.location.origin), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await reponse.json().catch(() => null);
      if (!reponse.ok) {
        setErreur(json?.erreur ?? "L'action a échoué.");
        return;
      }
      if (apres) router.push(apres);
      router.refresh();
    } catch {
      setErreur("L'action a échoué (problème de réseau).");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {ACTIONS_PAR_STATUT[statut].map((a) => (
          <button
            key={a.action}
            type="button"
            disabled={enCours}
            onClick={() => agir(a.action)}
            className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-50 ${
              a.danger
                ? "border border-red-200 text-red-700 hover:bg-red-50"
                : "bg-zinc-900 text-white hover:bg-zinc-700"
            }`}
          >
            {a.libelle}
          </button>
        ))}
      </div>
      {erreur && <p className="text-xs text-red-700">{erreur}</p>}
    </div>
  );
}
