"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validateTelephoneMadagascar } from "@/lib/validation";
import type { AutreCoordonnee, PieceJointe, Responsable } from "@/lib/types";

const ACTIVITES = [
  "Agriculture",
  "Jeunesse",
  "Sport",
  "Environnement",
  "Culture",
  "Aide sociale",
  "Développement local",
  "Formation",
  "Autre",
];

interface FormState {
  nomAssociation: string;
  adresseAssociation: string;
  responsables: Responsable[];
  activite: string;
  activiteAutre: string;
  nombreMembres: string;
  telephone: string;
  email: string;
  autresCoordonnees: AutreCoordonnee[];
  description: string;
  pieces: PieceJointe[];
}

const ETAT_INITIAL: FormState = {
  nomAssociation: "",
  adresseAssociation: "",
  responsables: [{ nom: "", prenom: "" }],
  activite: ACTIVITES[0],
  activiteAutre: "",
  nombreMembres: "",
  telephone: "",
  email: "",
  autresCoordonnees: [],
  description: "",
  pieces: [],
};

const CLE_LOCALSTORAGE = "vfm105-brouillon";

function chargerBrouillon(): FormState {
  if (typeof window === "undefined") return ETAT_INITIAL;
  try {
    const brut = window.localStorage.getItem(CLE_LOCALSTORAGE);
    if (!brut) return ETAT_INITIAL;
    return { ...ETAT_INITIAL, ...JSON.parse(brut) };
  } catch {
    return ETAT_INITIAL;
  }
}

export default function DepotWizard() {
  const router = useRouter();
  const [etape, setEtape] = useState<"formulaire" | "previsualisation">("formulaire");
  const [form, setForm] = useState<FormState>(ETAT_INITIAL);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setForm(chargerBrouillon());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CLE_LOCALSTORAGE, JSON.stringify(form));
  }, [form]);

  function majResponsable(index: number, champ: keyof Responsable, valeur: string) {
    setForm((f) => {
      const responsables = [...f.responsables];
      responsables[index] = { ...responsables[index], [champ]: valeur };
      return { ...f, responsables };
    });
  }

  function ajouterResponsable() {
    setForm((f) => ({ ...f, responsables: [...f.responsables, { nom: "", prenom: "" }] }));
  }

  function retirerResponsable(index: number) {
    setForm((f) => ({ ...f, responsables: f.responsables.filter((_, i) => i !== index) }));
  }

  function ajouterAutreCoordonnee() {
    setForm((f) => ({
      ...f,
      autresCoordonnees: [...f.autresCoordonnees, { type: "WhatsApp", valeur: "" }],
    }));
  }

  function majAutreCoordonnee(index: number, champ: keyof AutreCoordonnee, valeur: string) {
    setForm((f) => {
      const autres = [...f.autresCoordonnees];
      autres[index] = { ...autres[index], [champ]: valeur };
      return { ...f, autresCoordonnees: autres };
    });
  }

  function retirerAutreCoordonnee(index: number) {
    setForm((f) => ({
      ...f,
      autresCoordonnees: f.autresCoordonnees.filter((_, i) => i !== index),
    }));
  }

  async function ajouterFichiers(fichiers: FileList | null) {
    if (!fichiers) return;
    for (const fichier of Array.from(fichiers)) {
      const donnees = new FormData();
      donnees.append("fichier", fichier);
      try {
        const reponse = await fetch("/api/upload", { method: "POST", body: donnees });
        const json = await reponse.json();
        if (!reponse.ok) {
          setErreurs((e) => [...e, json.erreur ?? `Échec de l'ajout de ${fichier.name}.`]);
          continue;
        }
        setForm((f) => ({ ...f, pieces: [...f.pieces, json.piece] }));
      } catch {
        setErreurs((e) => [...e, `Échec de l'ajout de ${fichier.name}.`]);
      }
    }
  }

  function retirerPiece(index: number) {
    setForm((f) => ({ ...f, pieces: f.pieces.filter((_, i) => i !== index) }));
  }

  function valider(): boolean {
    const problemes: string[] = [];
    if (!form.nomAssociation.trim()) problemes.push("Veuillez renseigner le nom de l'association.");
    if (!form.adresseAssociation.trim()) problemes.push("Veuillez renseigner l'adresse de l'association.");
    const principal = form.responsables[0];
    if (!principal?.nom.trim() || !principal?.prenom.trim()) {
      problemes.push("Veuillez renseigner le responsable principal.");
    }
    const membres = Number(form.nombreMembres);
    if (!form.nombreMembres || !Number.isInteger(membres) || membres <= 0) {
      problemes.push("Le nombre de membres doit être un nombre entier positif.");
    }
    if (!validateTelephoneMadagascar(form.telephone).valide) {
      problemes.push("Le numéro de téléphone semble incorrect.");
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      problemes.push("L'adresse e-mail semble incorrecte.");
    }
    if (!form.description.trim()) {
      problemes.push("Veuillez décrire votre projet, vos besoins ou votre demande.");
    }
    setErreurs(problemes);
    return problemes.length === 0;
  }

  function passerAPrevisualisation() {
    if (valider()) setEtape("previsualisation");
  }

  async function validerDefinitivement() {
    if (envoiEnCours) return;
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
    setEnvoiEnCours(true);
    setErreurEnvoi(null);

    const activite = form.activite === "Autre" ? form.activiteAutre.trim() : form.activite;

    try {
      const reponse = await fetch("/api/dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKeyRef.current,
          association: {
            nom: form.nomAssociation.trim(),
            adresse: form.adresseAssociation.trim(),
            activite,
            nombreMembres: Number(form.nombreMembres),
          },
          responsables: form.responsables.filter((r) => r.nom.trim() || r.prenom.trim()),
          coordonnees: {
            telephone: form.telephone.trim(),
            email: form.email.trim() || undefined,
            autres: form.autresCoordonnees.filter((a) => a.valeur.trim()),
          },
          description: form.description.trim(),
          pieces: form.pieces,
        }),
      });

      const json = await reponse.json();
      if (!reponse.ok) {
        setErreurEnvoi(json.erreur ?? "Votre dossier n'a pas pu être envoyé. Veuillez réessayer.");
        setEnvoiEnCours(false);
        return;
      }

      window.localStorage.removeItem(CLE_LOCALSTORAGE);
      router.push(`/confirmation/${json.dossier.reference}`);
    } catch {
      setErreurEnvoi("Votre dossier n'a pas pu être envoyé. Veuillez réessayer.");
      setEnvoiEnCours(false);
    }
  }

  if (etape === "previsualisation") {
    const activite = form.activite === "Autre" ? form.activiteAutre : form.activite;
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900">Récapitulatif de votre dossier</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Vérifiez attentivement les informations avant de valider définitivement.
        </p>

        <dl className="mt-8 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          <Ligne label="Association">{form.nomAssociation}</Ligne>
          <Ligne label="Adresse">{form.adresseAssociation}</Ligne>
          <Ligne label="Responsable principal">
            {form.responsables[0]?.prenom} {form.responsables[0]?.nom}
          </Ligne>
          {form.responsables.slice(1).map((r, i) =>
            r.nom || r.prenom ? (
              <Ligne key={i} label={`Responsable ${i + 2}`}>
                {r.prenom} {r.nom}
              </Ligne>
            ) : null
          )}
          <Ligne label="Activité">{activite}</Ligne>
          <Ligne label="Nombre de membres">{form.nombreMembres}</Ligne>
          <Ligne label="Téléphone">{form.telephone}</Ligne>
          {form.email && <Ligne label="E-mail">{form.email}</Ligne>}
          {form.autresCoordonnees.filter((a) => a.valeur).length > 0 && (
            <Ligne label="Autres coordonnées">
              {form.autresCoordonnees
                .filter((a) => a.valeur)
                .map((a) => `${a.type} : ${a.valeur}`)
                .join(" · ")}
            </Ligne>
          )}
          <Ligne label="Description du projet">
            <span className="whitespace-pre-wrap">{form.description}</span>
          </Ligne>
          <Ligne label="Pièces jointes">
            {form.pieces.length === 0 ? (
              "Aucune"
            ) : (
              <ul className="list-inside list-disc">
                {form.pieces.map((p, i) => (
                  <li key={i}>{p.nom}</li>
                ))}
              </ul>
            )}
          </Ligne>
        </dl>

        {erreurEnvoi && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{erreurEnvoi}</p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setEtape("formulaire")}
            disabled={envoiEnCours}
            className="flex-1 rounded-md border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Modifier mes renseignements
          </button>
          <button
            type="button"
            onClick={validerDefinitivement}
            disabled={envoiEnCours}
            className="flex-1 rounded-md bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {envoiEnCours ? "Envoi en cours..." : "Valider définitivement mon dossier"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Dépôt de dossier — VFM 105</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Renseignez les informations de votre association, votre projet et vos coordonnées.
      </p>

      {erreurs.length > 0 && (
        <div className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          <ul className="list-inside list-disc">
            {erreurs.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <form
        className="mt-6 flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          passerAPrevisualisation();
        }}
      >
        <Section titre="Informations sur l'association">
          <Champ label="Nom de l'association" obligatoire>
            <input
              className="input"
              value={form.nomAssociation}
              onChange={(e) => setForm((f) => ({ ...f, nomAssociation: e.target.value }))}
            />
          </Champ>
          <Champ label="Adresse de l'association" obligatoire>
            <textarea
              className="input"
              rows={2}
              value={form.adresseAssociation}
              onChange={(e) => setForm((f) => ({ ...f, adresseAssociation: e.target.value }))}
            />
          </Champ>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-zinc-700">Responsables</span>
            {form.responsables.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input"
                  placeholder={i === 0 ? "Prénom (responsable principal)" : "Prénom"}
                  value={r.prenom}
                  onChange={(e) => majResponsable(i, "prenom", e.target.value)}
                />
                <input
                  className="input"
                  placeholder={i === 0 ? "Nom (responsable principal)" : "Nom"}
                  value={r.nom}
                  onChange={(e) => majResponsable(i, "nom", e.target.value)}
                />
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => retirerResponsable(i)}
                    className="px-2 text-sm text-zinc-500 hover:text-red-600"
                  >
                    Retirer
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={ajouterResponsable}
              className="self-start text-sm font-medium text-zinc-700 underline"
            >
              + Ajouter un responsable
            </button>
          </div>

          <Champ label="Activité de l'association" obligatoire>
            <select
              className="input"
              value={form.activite}
              onChange={(e) => setForm((f) => ({ ...f, activite: e.target.value }))}
            >
              {ACTIVITES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            {form.activite === "Autre" && (
              <input
                className="input mt-2"
                placeholder="Précisez l'activité"
                value={form.activiteAutre}
                onChange={(e) => setForm((f) => ({ ...f, activiteAutre: e.target.value }))}
              />
            )}
          </Champ>

          <Champ label="Nombre de membres" obligatoire>
            <input
              className="input"
              type="number"
              min={1}
              step={1}
              value={form.nombreMembres}
              onChange={(e) => setForm((f) => ({ ...f, nombreMembres: e.target.value }))}
            />
          </Champ>
        </Section>

        <Section titre="Coordonnées">
          <Champ label="Numéro de téléphone" obligatoire>
            <input
              className="input"
              placeholder="034 00 000 00"
              value={form.telephone}
              onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
            />
          </Champ>
          <Champ label="Adresse e-mail">
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Champ>

          <div className="flex flex-col gap-3">
            {form.autresCoordonnees.map((a, i) => (
              <div key={i} className="flex gap-2">
                <select
                  className="input"
                  value={a.type}
                  onChange={(e) => majAutreCoordonnee(i, "type", e.target.value)}
                >
                  <option>WhatsApp</option>
                  <option>Autre téléphone</option>
                  <option>Adresse complémentaire</option>
                  <option>Autre</option>
                </select>
                <input
                  className="input"
                  value={a.valeur}
                  onChange={(e) => majAutreCoordonnee(i, "valeur", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => retirerAutreCoordonnee(i)}
                  className="px-2 text-sm text-zinc-500 hover:text-red-600"
                >
                  Retirer
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={ajouterAutreCoordonnee}
              className="self-start text-sm font-medium text-zinc-700 underline"
            >
              + Ajouter une autre coordonnée
            </button>
          </div>
        </Section>

        <Section titre="Description de votre projet, de vos besoins ou de votre demande">
          <textarea
            className="input"
            rows={8}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Section>

        <Section titre="Pièces jointes">
          <input
            type="file"
            multiple
            onChange={(e) => ajouterFichiers(e.target.files)}
            className="text-sm"
          />
          <p className="text-xs text-zinc-500">10 Mo maximum par fichier — PDF, Word, JPEG, PNG, WebP.</p>
          {form.pieces.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {form.pieces.map((p, i) => (
                <li key={i} className="flex items-center justify-between rounded bg-zinc-50 px-3 py-2 text-sm">
                  <span>{p.nom}</span>
                  <button
                    type="button"
                    onClick={() => retirerPiece(i)}
                    className="text-zinc-500 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Enregistrer mon dossier
        </button>
      </form>
    </div>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-base font-semibold text-zinc-900">{titre}</legend>
      {children}
    </fieldset>
  );
}

function Champ({
  label,
  obligatoire,
  children,
}: {
  label: string;
  obligatoire?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">
        {label} {obligatoire && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
      <dt className="w-full shrink-0 text-sm font-medium text-zinc-500 sm:w-48">{label}</dt>
      <dd className="text-sm text-zinc-900">{children}</dd>
    </div>
  );
}
