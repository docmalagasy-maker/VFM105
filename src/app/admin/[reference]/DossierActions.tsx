"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StatutDossier, StatutSms } from "@/lib/types";

const OPTIONS_STATUT: { valeur: StatutDossier; libelle: string }[] = [
  { valeur: "recu", libelle: "Reçu" },
  { valeur: "en_cours", libelle: "En cours d'étude" },
  { valeur: "informations_demandees", libelle: "Informations complémentaires demandées" },
  { valeur: "accepte", libelle: "Accepté" },
  { valeur: "refuse", libelle: "Refusé" },
  { valeur: "archive", libelle: "Archivé" },
];

export default function DossierActions({
  reference,
  statut,
  statutSms,
}: {
  reference: string;
  statut: StatutDossier;
  statutSms: StatutSms;
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function changerStatut(nouveau: StatutDossier) {
    setEnCours(true);
    await fetch(`/api/admin/dossiers/${reference}/statut`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: nouveau }),
    });
    setEnCours(false);
    router.refresh();
  }

  async function renvoyerSms() {
    setEnCours(true);
    setMessage(null);
    const reponse = await fetch(`/api/admin/dossiers/${reference}/resend-sms`, { method: "POST" });
    const json = await reponse.json();
    setEnCours(false);
    setMessage(reponse.ok ? `SMS ${json.statutSms}.` : json.erreur ?? "Échec du renvoi.");
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Statut du dossier</span>
        <select
          className="input"
          defaultValue={statut}
          disabled={enCours}
          onChange={(e) => changerStatut(e.target.value as StatutDossier)}
        >
          {OPTIONS_STATUT.map((o) => (
            <option key={o.valeur} value={o.valeur}>
              {o.libelle}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600">Statut SMS : {statutSms}</span>
        <button
          type="button"
          onClick={renvoyerSms}
          disabled={enCours}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Renvoyer le SMS
        </button>
      </div>
      {message && <p className="text-sm text-zinc-600">{message}</p>}
    </div>
  );
}
