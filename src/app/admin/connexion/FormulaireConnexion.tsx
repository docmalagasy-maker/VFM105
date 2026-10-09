"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FormulaireConnexion({ destination }: { destination: string }) {
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function connecter(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/auth/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiant, motDePasse }),
      });
      const json = await reponse.json().catch(() => null);
      if (!reponse.ok) {
        setErreur(json?.erreur ?? "Connexion impossible.");
        return;
      }
      router.push(destination);
      router.refresh();
    } catch {
      setErreur("Connexion impossible (problème de réseau).");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={connecter} className="mt-5 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Identifiant</span>
        <input
          className="input"
          autoComplete="username"
          value={identifiant}
          onChange={(e) => setIdentifiant(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Mot de passe</span>
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />
      </label>
      {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {enCours ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
