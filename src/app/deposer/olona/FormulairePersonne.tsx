"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ChoixLocalite, { LOCALITE_VIDE, type Localite } from "@/components/ChoixLocalite";
import { Champ, Ligne, Section } from "@/components/DepotWizard";
import { IconDoc, IconGear, IconLock, IconMail, IconPhone, IconSend } from "@/components/icons";
import PublicShell from "@/components/PublicShell";
import { DISTRICTS_PAR_REGION } from "@/lib/districts";
import { validateTelephoneMadagascar } from "@/lib/validation";

interface Formulaire {
  nom: string;
  prenom: string;
  district: string;
  localite: Localite;
  activite: string;
  descriptionActivite: string;
  projet: string;
  telephone: string;
  email: string;
}

const VIDE: Formulaire = {
  nom: "",
  prenom: "",
  district: "",
  localite: LOCALITE_VIDE,
  activite: "",
  descriptionActivite: "",
  projet: "",
  telephone: "",
  email: "",
};

// Brouillon séparé de celui des associations (vfm105-brouillon).
const CLE_BROUILLON = "vfm-brouillon-olona";

function chargerBrouillon(): Formulaire {
  try {
    const brut = window.localStorage.getItem(CLE_BROUILLON);
    if (!brut) return VIDE;
    // Les anciens brouillons peuvent encore contenir date de naissance et CV : ignorés.
    const { nom, prenom, district, localite, activite, descriptionActivite, projet, telephone, email } = {
      ...VIDE,
      ...JSON.parse(brut),
    } as Formulaire;
    return { nom, prenom, district, localite: { ...LOCALITE_VIDE, ...localite }, activite, descriptionActivite, projet, telephone, email };
  } catch {
    return VIDE;
  }
}

/** Formulaire des personnes physiques : saisie → famintinana → fandefasana farany. */
export default function FormulairePersonne() {
  const router = useRouter();
  const [etape, setEtape] = useState<"formulaire" | "famintinana">("formulaire");
  // Rendu uniquement dans le navigateur (ChargeurFormulaire) : brouillon lu dès l'initialisation.
  const [form, setForm] = useState<Formulaire>(chargerBrouillon);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const cle = useRef<string | null>(null);

  // Brouillon enregistré à chaque saisie.
  useEffect(() => {
    try {
      window.localStorage.setItem(CLE_BROUILLON, JSON.stringify(form));
    } catch {
      /* stockage indisponible (navigation privée) : pas de brouillon */
    }
  }, [form]);

  const maj = <K extends keyof Formulaire>(champ: K, valeur: Formulaire[K]) => setForm((f) => ({ ...f, [champ]: valeur }));

  function verifier(): boolean {
    const p: string[] = [];
    if (!form.nom.trim()) p.push("Soraty ny anaranao.");
    if (!form.prenom.trim()) p.push("Soraty ny fanampin'anaranao.");
    if (!form.district) p.push("Safidio ny distrika misy anao.");
    else if (!form.localite.commune.trim()) p.push("Safidio na soraty ny kaominina misy anao.");
    if (!form.activite.trim()) p.push("Soraty ny asanao ankehitriny.");
    if (!form.descriptionActivite.trim()) p.push("Hazavao ny asanao.");
    if (!form.projet.trim()) p.push("Soraty ny zavatra handrasanao amin'ny Tafa sy Dinika.");
    if (!validateTelephoneMadagascar(form.telephone).valide) p.push("Toa diso ny laharana finday.");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) p.push("Toa diso ny adiresy mailaka.");
    setErreurs(p);
    if (p.length) window.scrollTo({ top: 0, behavior: "smooth" });
    return p.length === 0;
  }

  async function envoyerDefinitivement() {
    if (envoi) return;
    cle.current ??= crypto.randomUUID();
    setEnvoi(true);
    setErreurEnvoi(null);
    try {
      const reponse = await fetch("/api/personnes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: cle.current,
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          district: form.district,
          commune: form.localite.commune.trim(),
          communePcode: form.localite.communePcode || undefined,
          fokontany: form.localite.fokontany.trim() || undefined,
          fokontanyPcode: form.localite.fokontanyPcode || undefined,
          activite: form.activite.trim(),
          descriptionActivite: form.descriptionActivite.trim(),
          projet: form.projet.trim(),
          telephone: form.telephone.trim(),
          email: form.email.trim() || undefined,
        }),
      });
      const json = await reponse.json();
      if (!reponse.ok) {
        setErreurEnvoi(json.erreur ?? "Tsy lasa ny dosie-nao. Andramo indray azafady.");
        setEnvoi(false);
        return;
      }
      window.localStorage.removeItem(CLE_BROUILLON);
      // Le code secret dans l'adresse permet d'afficher la carte QR au seul déposant.
      router.push(`/confirmation/olona/${json.dossier.reference}?c=${encodeURIComponent(json.dossier.qrJeton)}`);
    } catch {
      setErreurEnvoi("Tsy lasa ny dosie-nao. Andramo indray azafady.");
      setEnvoi(false);
    }
  }

  if (etape === "famintinana") {
    return (
      <PublicShell cardClassName="max-w-2xl">
        <h1 className="text-xl font-bold text-vfm-marine sm:text-2xl">Famintinana ny dosie-nao</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Hamarino tsara ireo mombamomba ireo alohan&apos;ny handefasana azy farany.
        </p>
        <dl className="mt-6 divide-y divide-vfm-beige-bord rounded-2xl border border-vfm-beige-bord bg-vfm-beige-clair">
          <Ligne label="Anarana">{form.nom}</Ligne>
          <Ligne label="Fanampin'anarana">{form.prenom}</Ligne>
          <Ligne label="Distrika">{form.district}</Ligne>
          <Ligne label="Kaominina">{form.localite.commune}</Ligne>
          {form.localite.fokontany && <Ligne label="Fokontany">{form.localite.fokontany}</Ligne>}
          <Ligne label="Asa ankehitriny">{form.activite}</Ligne>
          <Ligne label="Fanazavana momba ny asa">
            <span className="whitespace-pre-wrap">{form.descriptionActivite}</span>
          </Ligne>
          <Ligne label="Ny zavatra handrasanao amin'ny Tafa sy Dinika">
            <span className="whitespace-pre-wrap">{form.projet}</span>
          </Ligne>
          <Ligne label="Finday">{form.telephone}</Ligne>
          {form.email && <Ligne label="Mailaka">{form.email}</Ligne>}
        </dl>

        {erreurEnvoi && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erreurEnvoi}</p>}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setEtape("formulaire")}
            disabled={envoi}
            className="flex-1 rounded-2xl border border-vfm-beige-bord px-4 py-3.5 text-sm font-medium text-zinc-700 hover:bg-vfm-beige-clair disabled:opacity-50"
          >
            Hovaiko ny mombamomba ahy
          </button>
          <button
            type="button"
            onClick={envoyerDefinitivement}
            disabled={envoi}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-vfm-vert px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-vfm-vert/25 hover:bg-vfm-vert-dark disabled:opacity-50"
          >
            <IconSend className="h-4 w-4" />
            {envoi ? "Eo am-pandefasana..." : "Tsindrio eto raha hanohy"}
          </button>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell cardClassName="max-w-5xl">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-full bg-vfm-vert/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-vfm-vert-dark">
          Fisoratana anarana
        </span>
        <h1 className="text-2xl font-bold text-vfm-marine sm:text-3xl">VFM 105</h1>
        <p className="max-w-xl text-sm text-zinc-600 sm:text-base">
          Fenoy tsara ho mariky ny fisoratanao anarana. Tsy maintsy fenoina ireo saha misy marika{" "}
          <span className="text-vfm-rouge">*</span>.
        </p>
      </div>

      {erreurs.length > 0 && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <p className="mb-1 font-semibold">Azafady, ahitsio ireto manaraka ireto :</p>
          <ul className="list-inside list-disc space-y-0.5">
            {erreurs.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (verifier()) {
            setEtape("famintinana");
            window.scrollTo({ top: 0 });
          }
        }}
      >
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Section
              numero={1}
              titre="Mombamomba anao"
              sousTitre="Anarana, distrika, kaominina ary fokontany"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
                  <circle cx="12" cy="8" r="4" />
                  <path strokeLinecap="round" d="M4 20v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
                </svg>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Champ label="Anarana" obligatoire>
                  <input className="input" placeholder="Ohatra : RAKOTO" value={form.nom} onChange={(e) => maj("nom", e.target.value)} />
                </Champ>
                <Champ label="Fanampin'anarana" obligatoire>
                  <input className="input" placeholder="Ohatra : Jean" value={form.prenom} onChange={(e) => maj("prenom", e.target.value)} />
                </Champ>
              </div>
              <Champ label="Distrika" obligatoire>
                <select
                  className="input"
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value, localite: LOCALITE_VIDE }))}
                >
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
              </Champ>
              <ChoixLocalite
                district={form.district}
                valeur={form.localite}
                onChange={(modif) => setForm((f) => ({ ...f, localite: { ...f.localite, ...modif } }))}
              />
            </Section>

            <Section
              numero={2}
              titre="Ny asanao"
              sousTitre="Ny asa ataonao amin'izao fotoana izao"
              icon={<IconGear className="h-5 w-5" />}
            >
              <Champ label="Asa ankehitriny" obligatoire>
                <input
                  className="input"
                  placeholder="Ohatra : Mpamboly, mpampianatra, mpianatra..."
                  value={form.activite}
                  onChange={(e) => maj("activite", e.target.value)}
                />
              </Champ>
              <Champ label="Fanazavana momba ny asanao" obligatoire>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Hazavao ny asa ataonao, ny toerana, ny traikefanao..."
                  value={form.descriptionActivite}
                  onChange={(e) => maj("descriptionActivite", e.target.value)}
                />
              </Champ>
            </Section>
          </div>

          <div className="flex flex-col gap-6">
            <Section
              numero={3}
              titre="Ny zavatra handrasanao amin'ny Tafa sy Dinika"
              icon={<IconDoc className="h-5 w-5" />}
            >
              <Champ label="Soraty eto ambany" obligatoire>
                <textarea
                  className="input"
                  rows={6}
                  value={form.projet}
                  onChange={(e) => maj("projet", e.target.value)}
                />
              </Champ>
            </Section>

            <Section
              numero={4}
              titre="Fifandraisana"
              sousTitre="Raha manome mailaka ianao dia handray mailaka fanamarinana"
              icon={<IconPhone className="h-5 w-5" />}
            >
              <Champ label="Laharana finday" obligatoire>
                <div className="relative">
                  <IconPhone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-vfm-vert" />
                  <input
                    className="input pl-10"
                    inputMode="tel"
                    placeholder="034 00 000 00"
                    value={form.telephone}
                    onChange={(e) => maj("telephone", e.target.value)}
                  />
                </div>
              </Champ>
              <Champ label="Adiresy mailaka">
                <div className="relative">
                  <IconMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-vfm-vert" />
                  <input
                    className="input pl-10"
                    type="email"
                    placeholder="ohatra@email.com"
                    value={form.email}
                    onChange={(e) => maj("email", e.target.value)}
                  />
                </div>
              </Champ>
            </Section>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-vfm-vert px-6 py-4 text-base font-semibold text-white shadow-lg shadow-vfm-vert/25 transition-all hover:-translate-y-0.5 hover:bg-vfm-vert-dark hover:shadow-xl"
          >
            <IconSend className="h-5 w-5" />
            Hamarino ny dosie-ko
          </button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-500">
            <IconLock className="h-3.5 w-3.5" />
            Voaaro tsara ary tazonina ho tsiambaratelo ny mombamomba anao.
          </p>
        </div>
      </form>
    </PublicShell>
  );
}
