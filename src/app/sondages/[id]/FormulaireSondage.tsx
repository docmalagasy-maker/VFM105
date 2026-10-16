"use client";

import { useState } from "react";
import { DISTRICTS_PAR_REGION } from "@/lib/districts";
import {
  MAX_TEXTE_REPONSE,
  SEXES,
  verifierReponses,
  type Question,
  type ValeurReponse,
} from "@/lib/sondages-modele";
import MessageFin from "./MessageFin";

export default function FormulaireSondage({ sondageId, questions }: { sondageId: number; questions: Question[] }) {
  const [sexe, setSexe] = useState("");
  const [district, setDistrict] = useState("");
  // Classements : ordre initial des propositions, que le participant réorganise.
  const [reponses, setReponses] = useState<Record<string, ValeurReponse>>(() =>
    Object.fromEntries(questions.filter((q) => q.type === "classement").map((q) => [q.id, q.options.map((_, i) => i)]))
  );
  const [piege, setPiege] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [fini, setFini] = useState<null | "ok" | "deja">(null);

  const repondre = (id: string, v: ValeurReponse) => setReponses((r) => ({ ...r, [id]: v }));

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (!sexe) return setErreur("Safidio ny maha-lahy na maha-vavy anao.");
    if (!district) return setErreur("Safidio ny distrika misy anao.");
    const controle = verifierReponses(questions, reponses);
    if (!controle.ok) return setErreur(controle.erreur);

    setEnvoi(true);
    try {
      const reponse = await fetch(`/api/sondages/${sondageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sexe, district, reponses: controle.reponses, site: piege }),
      });
      const json = await reponse.json().catch(() => null);
      if (reponse.ok) setFini("ok");
      else if (reponse.status === 409) setFini("deja");
      else setErreur(json?.erreur ?? "Tsy lasa ny valinao. Andramo indray azafady.");
    } catch {
      setErreur("Tsy lasa ny valinao (olana amin'ny tambajotra). Andramo indray azafady.");
    } finally {
      setEnvoi(false);
    }
  }

  if (fini === "ok") return <MessageFin titre="Misaotra nanome ny hevitrao!" texte="Voaray ny valinao." />;
  if (fini === "deja")
    return <MessageFin titre="Efa namaly ity fanadihadiana ity ianao." texte="Misaotra nanome ny hevitrao!" />;

  return (
    <form onSubmit={envoyer} className="mt-8 flex flex-col gap-6" noValidate>
      {/* Champ piège pour les robots, invisible pour les personnes */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        value={piege}
        onChange={(e) => setPiege(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      <fieldset className="rounded-2xl border border-vfm-beige-bord p-4 sm:p-5">
        <legend className="px-2 text-sm font-semibold text-vfm-marine">Mombamomba anao</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-800">
              Lahy sa vavy ? <span className="text-vfm-rouge">*</span>
            </p>
            <div className="flex gap-2">
              {SEXES.map((s) => (
                <label
                  key={s.valeur}
                  className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    sexe === s.valeur
                      ? "border-vfm-marine bg-vfm-marine text-white"
                      : "border-vfm-beige-bord bg-white text-vfm-marine hover:border-vfm-marine"
                  }`}
                >
                  <input
                    type="radio"
                    name="sexe"
                    value={s.valeur}
                    checked={sexe === s.valeur}
                    onChange={() => setSexe(s.valeur)}
                    className="sr-only"
                  />
                  {s.libelle}
                </label>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-800">
              Distrika <span className="text-vfm-rouge">*</span>
            </span>
            <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="" disabled>
                Safidio ny distrika
              </option>
              {DISTRICTS_PAR_REGION.map((r) => (
                <optgroup key={r.region} label={`Faritra ${r.region}`}>
                  {r.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      {questions.map((q, n) => (
        <fieldset key={q.id} className="rounded-2xl border border-vfm-beige-bord p-4 sm:p-5">
          <legend className="sr-only">{q.intitule}</legend>
          <p className="font-semibold text-vfm-marine">
            <span className="mr-2 text-zinc-400">{n + 1}.</span>
            {q.intitule}
            {q.obligatoire && <span className="ml-1 text-vfm-rouge">*</span>}
          </p>
          <div className="mt-3">
            <ChampQuestion question={q} valeur={reponses[q.id]} onChange={(v) => repondre(q.id, v)} />
          </div>
        </fieldset>
      ))}

      {erreur && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={envoi}
        className="self-center rounded-full bg-vfm-marine px-8 py-3.5 font-semibold text-white shadow-md transition hover:bg-vfm-marine-dark disabled:opacity-50"
      >
        {envoi ? "Alefa…" : "Alefaso ny hevitro"}
      </button>
    </form>
  );
}

function ChampQuestion({
  question: q,
  valeur,
  onChange,
}: {
  question: Question;
  valeur: ValeurReponse | undefined;
  onChange: (v: ValeurReponse) => void;
}) {
  const choix = "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors";
  const actif = "border-vfm-vert bg-vfm-vert/5";
  const inactif = "border-vfm-beige-bord bg-white hover:border-vfm-vert/60";

  if (q.type === "unique") {
    return (
      <div className="flex flex-col gap-2">
        {q.options.map((o, i) => (
          <label key={i} className={`${choix} ${valeur === i ? actif : inactif}`}>
            <input
              type="radio"
              name={q.id}
              checked={valeur === i}
              onChange={() => onChange(i)}
              className="mt-0.5 accent-vfm-vert"
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  }

  if (q.type === "multiple") {
    const coches = Array.isArray(valeur) ? valeur : [];
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500">Azo safidiana maromaro.</p>
        {q.options.map((o, i) => {
          const coche = coches.includes(i);
          return (
            <label key={i} className={`${choix} ${coche ? actif : inactif}`}>
              <input
                type="checkbox"
                checked={coche}
                onChange={() => onChange(coche ? coches.filter((x) => x !== i) : [...coches, i])}
                className="mt-0.5 accent-vfm-vert"
              />
              <span>{o}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (q.type === "note") {
    return (
      <div>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={q.intitule}>
          {[1, 2, 3, 4, 5].map((note) => (
            <button
              key={note}
              type="button"
              role="radio"
              aria-checked={valeur === note}
              onClick={() => onChange(note)}
              className={`rounded-xl border py-3 text-lg font-semibold transition-colors ${
                valeur === note
                  ? "border-vfm-marine bg-vfm-marine text-white"
                  : "border-vfm-beige-bord bg-white text-vfm-marine hover:border-vfm-marine"
              }`}
            >
              {note}
            </button>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-zinc-500">
          <span>1 = ratsy indrindra</span>
          <span>5 = tsara indrindra</span>
        </div>
      </div>
    );
  }

  if (q.type === "texte") {
    const texte = typeof valeur === "string" ? valeur : "";
    return (
      <div>
        <textarea
          className="input"
          rows={4}
          maxLength={MAX_TEXTE_REPONSE}
          placeholder="Soraty eto ny hevitrao..."
          value={texte}
          onChange={(e) => onChange(e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-zinc-400">
          {texte.length} / {MAX_TEXTE_REPONSE}
        </p>
      </div>
    );
  }

  // Classement : déplacement par boutons (utilisable au doigt et au clavier).
  const ordre = Array.isArray(valeur) ? valeur : q.options.map((_, i) => i);
  const deplacer = (position: number, sens: -1 | 1) => {
    const cible = position + sens;
    if (cible < 0 || cible >= ordre.length) return;
    const nouvel = [...ordre];
    [nouvel[position], nouvel[cible]] = [nouvel[cible], nouvel[position]];
    onChange(nouvel);
  };
  return (
    <div>
      <p className="mb-2 text-xs text-zinc-500">
        Alaharo araka ny safidinao : ny voalohany no tianao indrindra.
      </p>
      <ol className="flex flex-col gap-2">
        {ordre.map((index, position) => (
          <li
            key={index}
            className="flex items-center gap-3 rounded-xl border border-vfm-beige-bord bg-white px-3 py-2 text-sm"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vfm-marine text-xs font-bold text-white">
              {position + 1}
            </span>
            <span className="flex-1">{q.options[index]}</span>
            <button
              type="button"
              onClick={() => deplacer(position, -1)}
              disabled={position === 0}
              aria-label="Akarina"
              className="rounded-lg border border-vfm-beige-bord px-2.5 py-1.5 text-vfm-marine hover:bg-vfm-beige disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => deplacer(position, 1)}
              disabled={position === ordre.length - 1}
              aria-label="Ampidinina"
              className="rounded-lg border border-vfm-beige-bord px-2.5 py-1.5 text-vfm-marine hover:bg-vfm-beige disabled:opacity-30"
            >
              ↓
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
