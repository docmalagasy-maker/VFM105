"use client";

import Link from "next/link";
import { useState } from "react";
import { DISTRICTS_PAR_REGION } from "@/lib/districts";

const VIDE = { nom: "", prenom: "", telephone: "", district: "", identifiant: "", motDePasse: "", confirmation: "", site: "" };

export default function FormulaireInscription({ districtsOccupes }: { districtsOccupes: string[] }) {
  const [champs, setChamps] = useState(VIDE);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const maj = (champ: keyof typeof VIDE) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setChamps((c) => ({ ...c, [champ]: e.target.value }));

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (champs.motDePasse !== champs.confirmation) {
      setErreur("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setEnCours(true);
    try {
      const reponse = await fetch("/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // La confirmation reste dans le navigateur (undefined n'est pas envoyé)
        body: JSON.stringify({ ...champs, confirmation: undefined }),
      });
      const json = await reponse.json().catch(() => null);
      if (!reponse.ok) setErreur(json?.erreur ?? "La demande n'a pas pu être enregistrée.");
      else setEnvoye(true);
    } catch {
      setErreur("La demande n'a pas pu être envoyée (problème de réseau).");
    } finally {
      setEnCours(false);
    }
  }

  if (envoye) {
    return (
      <div className="mt-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
        Votre demande pour le district <strong>{champs.district}</strong> a bien été enregistrée. Le
        super-administrateur va l&apos;examiner ; vous pourrez ensuite vous connecter avec
        l&apos;identifiant <strong>{champs.identifiant}</strong>.
        <Link href="/admin/connexion" className="mt-3 block font-medium underline">
          Aller à la page de connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="mt-5 grid gap-4 sm:grid-cols-2">
      <Champ label="Nom">
        <input className="input" value={champs.nom} onChange={maj("nom")} required autoComplete="family-name" />
      </Champ>
      <Champ label="Prénom">
        <input className="input" value={champs.prenom} onChange={maj("prenom")} required autoComplete="given-name" />
      </Champ>
      <Champ label="Numéro de téléphone">
        <input
          className="input"
          inputMode="tel"
          placeholder="034 00 000 00"
          value={champs.telephone}
          onChange={maj("telephone")}
          required
        />
      </Champ>
      <Champ label="District d'origine">
        <select className="input" value={champs.district} onChange={maj("district")} required>
          <option value="" disabled>
            Choisissez votre district
          </option>
          {DISTRICTS_PAR_REGION.map((r) => (
            <optgroup key={r.region} label={`Région ${r.region}`}>
              {r.districts.map((d) => (
                <option key={d} value={d} disabled={districtsOccupes.includes(d)}>
                  {d}
                  {districtsOccupes.includes(d) ? " (déjà attribué)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Champ>
      <Champ label="Identifiant de connexion" note="3 à 40 caractères : lettres, chiffres, . _ -">
        <input
          className="input"
          value={champs.identifiant}
          onChange={maj("identifiant")}
          required
          autoComplete="username"
          pattern="[a-zA-Z0-9._\-]{3,40}"
        />
      </Champ>
      <div className="hidden sm:block" />
      <Champ label="Mot de passe" note="10 caractères minimum">
        <input
          className="input"
          type="password"
          value={champs.motDePasse}
          onChange={maj("motDePasse")}
          required
          minLength={10}
          autoComplete="new-password"
        />
      </Champ>
      <Champ label="Confirmer le mot de passe">
        <input
          className="input"
          type="password"
          value={champs.confirmation}
          onChange={maj("confirmation")}
          required
          minLength={10}
          autoComplete="new-password"
        />
      </Champ>
      {/* Piège à robots : champ invisible pour les humains */}
      <input type="text" name="site" value={champs.site} onChange={maj("site")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{erreur}</p>}
      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 sm:col-span-2"
      >
        {enCours ? "Envoi..." : "Envoyer ma demande"}
      </button>
      <p className="text-sm text-zinc-500 sm:col-span-2">
        Déjà un compte ?{" "}
        <Link href="/admin/connexion" className="font-medium text-zinc-900 underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

function Champ({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      {children}
      {note && <span className="text-xs text-zinc-400">{note}</span>}
    </label>
  );
}
