"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  avecOptions,
  MAX_OPTIONS,
  MAX_QUESTIONS,
  nouvelIdQuestion,
  sondageSchema,
  TYPES_QUESTION,
  type Question,
  type TypeQuestion,
} from "@/lib/sondages-modele";

interface Initial {
  id?: number;
  titre: string;
  description: string;
  actif: boolean;
  questions: Question[];
}

const questionVide = (): Question => ({
  id: nouvelIdQuestion(),
  type: "unique",
  intitule: "",
  obligatoire: true,
  options: ["", ""],
});

/**
 * Création et modification d'un sondage. `verrouille` : le sondage a déjà des
 * réponses, seules les informations générales restent modifiables.
 */
export default function EditeurSondage({ initial, verrouille = false }: { initial?: Initial; verrouille?: boolean }) {
  const router = useRouter();
  const [titre, setTitre] = useState(initial?.titre ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [actif, setActif] = useState(initial?.actif ?? false);
  const [questions, setQuestions] = useState<Question[]>(initial?.questions ?? [questionVide()]);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const majQuestion = (i: number, modif: Partial<Question>) =>
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...modif } : q)));
  const deplacer = (i: number, sens: -1 | 1) =>
    setQuestions((qs) => {
      const j = i + sens;
      if (j < 0 || j >= qs.length) return qs;
      const n = [...qs];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  async function enregistrer() {
    setErreur(null);
    const parsed = sondageSchema.safeParse({ titre, description, actif, questions });
    if (!parsed.success) return setErreur(parsed.error.issues[0]?.message ?? "Sondage invalide.");
    setEnCours(true);
    try {
      const url = initial?.id ? `/api/admin/sondages/${initial.id}` : "/api/admin/sondages";
      const reponse = await fetch(new URL(url, window.location.origin), {
        method: initial?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await reponse.json().catch(() => null);
      if (!reponse.ok) return setErreur(json?.erreur ?? "L'enregistrement a échoué.");
      router.push(`/admin/sondages/${initial?.id ?? json.id}`);
      router.refresh();
    } catch {
      setErreur("L'enregistrement a échoué (problème de connexion).");
    } finally {
      setEnCours(false);
    }
  }

  const petitBouton =
    "rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40";

  return (
    <div className="mt-6 flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-800">Titre (affiché au public, en malgache) *</span>
          <input className="input" value={titre} maxLength={200} onChange={(e) => setTitre(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-800">Présentation (facultative)</span>
          <textarea
            className="input"
            rows={3}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-800">
          <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} />
          Actif : visible et ouvert aux réponses sur la page « Manehoa hevitra »
        </label>
      </section>

      {verrouille && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ce sondage a déjà reçu des réponses : ses questions et propositions ne peuvent plus être modifiées (les
          résultats en dépendent). Le titre, la présentation et l&apos;activation restent modifiables.
        </p>
      )}

      {questions.map((q, i) => (
        <section key={q.id} className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">Question {i + 1}</h2>
            {!verrouille && (
              <div className="flex gap-1.5">
                <button type="button" className={petitBouton} onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter">
                  ↑
                </button>
                <button
                  type="button"
                  className={petitBouton}
                  onClick={() => deplacer(i, 1)}
                  disabled={i === questions.length - 1}
                  aria-label="Descendre"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={`${petitBouton} border-red-300 text-red-700 hover:bg-red-50`}
                  onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}
                  disabled={questions.length === 1}
                >
                  Retirer
                </button>
              </div>
            )}
          </div>

          <fieldset disabled={verrouille} className="mt-3 flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
              <input
                className="input"
                placeholder="Intitulé de la question (en malgache)"
                value={q.intitule}
                maxLength={300}
                onChange={(e) => majQuestion(i, { intitule: e.target.value })}
              />
              <select
                className="input"
                value={q.type}
                onChange={(e) => {
                  const type = e.target.value as TypeQuestion;
                  majQuestion(i, { type, options: avecOptions(type) ? (q.options.length >= 2 ? q.options : ["", ""]) : [] });
                }}
              >
                {TYPES_QUESTION.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.libelle}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={q.obligatoire}
                onChange={(e) => majQuestion(i, { obligatoire: e.target.checked })}
              />
              Réponse obligatoire
            </label>

            {avecOptions(q.type) && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-zinc-500">
                  {q.type === "classement"
                    ? "Propositions à classer par ordre de préférence (2 à 20)."
                    : "Propositions de réponse (2 à 20)."}
                </p>
                {q.options.map((o, k) => (
                  <div key={k} className="flex gap-2">
                    <input
                      className="input"
                      placeholder={`Proposition ${k + 1}`}
                      value={o}
                      maxLength={200}
                      onChange={(e) => majQuestion(i, { options: q.options.map((x, m) => (m === k ? e.target.value : x)) })}
                    />
                    <button
                      type="button"
                      className={petitBouton}
                      onClick={() => majQuestion(i, { options: q.options.filter((_, m) => m !== k) })}
                      disabled={q.options.length <= 2}
                      aria-label={`Retirer la proposition ${k + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={`${petitBouton} self-start`}
                  onClick={() => majQuestion(i, { options: [...q.options, ""] })}
                  disabled={q.options.length >= MAX_OPTIONS}
                >
                  + Ajouter une proposition
                </button>
              </div>
            )}
            {q.type === "note" && <p className="text-xs text-zinc-500">Le participant choisit une note de 1 à 5.</p>}
            {q.type === "texte" && <p className="text-xs text-zinc-500">Réponse écrite libre (2 000 caractères au plus).</p>}
          </fieldset>
        </section>
      ))}

      {!verrouille && (
        <button
          type="button"
          onClick={() => setQuestions((qs) => [...qs, questionVide()])}
          disabled={questions.length >= MAX_QUESTIONS}
          className="self-start rounded-md border border-dashed border-zinc-400 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-white disabled:opacity-40"
        >
          + Ajouter une question
        </button>
      )}

      {erreur && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={enregistrer}
          disabled={enCours}
          className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
