"use client";

import { useEffect, useState } from "react";
import type { EtatInscriptions } from "@/lib/inscriptions-regles";

/** Relit l'état des inscriptions toutes les 30 s (et au retour sur l'onglet). */
export function useEtatInscriptions(initial: EtatInscriptions | null): EtatInscriptions | null {
  const [etat, setEtat] = useState(initial);

  useEffect(() => {
    let actif = true;
    const relire = () =>
      fetch("/api/inscriptions", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (actif && data && "etat" in data) setEtat(data.etat);
        })
        .catch(() => {});
    const minuterie = setInterval(relire, 30_000);
    const visible = () => document.visibilityState === "visible" && relire();
    document.addEventListener("visibilitychange", visible);
    return () => {
      actif = false;
      clearInterval(minuterie);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);

  return etat;
}
