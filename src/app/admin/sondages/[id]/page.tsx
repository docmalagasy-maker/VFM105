import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { districtAutorise, obtenirSession } from "@/lib/auth";
import { DISTRICTS_PAR_REGION } from "@/lib/districts";
import { listerReponses, obtenirSondage } from "@/lib/sondages";
import { analyserQuestions, calculerSynthese, REGROUPEMENTS } from "@/lib/sondages-analyse";
import { lireFiltres, versRequete, type ParametresResultats } from "@/lib/sondages-filtres";
import { SEXES } from "@/lib/sondages-modele";
import ActionsSondage from "../ActionsSondage";
import { QuestionVue, SyntheseVue, Tuile } from "./Resultats";

const nombre = (n: number) => n.toLocaleString("fr-FR");
const dateFr = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Indian/Antananarivo" }) : "—";

/** Résultats d'un sondage : filtres, regroupements, tri, graphiques et exports. */
export default async function ResultatsSondagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParametresResultats>;
}) {
  const session = await obtenirSession();
  if (!session) redirect("/admin/connexion");
  const estSuper = session.role === "super";
  const districtImpose = districtAutorise(session);

  const id = Number((await params).id);
  const sondage = Number.isInteger(id) ? await obtenirSondage(id) : null;
  if (!sondage) notFound();

  const p = await searchParams;
  const { filtres, regroupement, tri, groupesPermis, actifs } = lireFiltres(p, districtImpose);
  const reponses = await listerReponses(id, filtres);
  const synthese = calculerSynthese(reponses);
  const resultats = analyserQuestions(sondage, reponses, regroupement, tri);
  const libelleGroupe = REGROUPEMENTS.find((g) => g.valeur === regroupement)?.libelle ?? "";
  const filtreActif = Boolean(actifs.sexe || actifs.region || actifs.district || actifs.du || actifs.au);
  const homme = synthese.parSexe.find((s) => s.nom === "Homme")?.nombre ?? 0;
  const femme = synthese.parSexe.find((s) => s.nom === "Femme")?.nombre ?? 0;
  const part = (n: number) => (synthese.total ? `${Math.round((n / synthese.total) * 100)} %` : "—");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Link href="/admin?vue=sondages" className="text-sm text-zinc-500 hover:underline">
        ← Sondages
      </Link>
      <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-zinc-900">{sondage.titre}</h1>
          <p className="text-sm text-zinc-500">
            {sondage.actif ? "Actif — visible sur « Manehoa hevitra »" : "Désactivé — invisible pour le public"} ·{" "}
            {sondage.questions.length} question(s) · créé le {dateFr(sondage.creeLe)}
            {districtImpose && ` · réponses du district ${districtImpose} uniquement`}
          </p>
        </div>
        {estSuper && (
          <div className="flex flex-wrap gap-2">
            <ActionsSondage id={sondage.id} titre={sondage.titre} actif={sondage.actif} apresSuppression="/admin?vue=sondages" />
          </div>
        )}
      </header>

      {/* Filtres, regroupement et tri : une seule rangée au-dessus des résultats */}
      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <Filtre libelle="Sexe">
          <select name="sexe" defaultValue={actifs.sexe ?? ""} className="input py-2">
            <option value="">Tous</option>
            {SEXES.map((s) => (
              <option key={s.valeur} value={s.valeur}>
                {s.libelleFr}
              </option>
            ))}
          </select>
        </Filtre>
        {!districtImpose && (
          <>
            <Filtre libelle="Région">
              <select name="region" defaultValue={actifs.region ?? ""} className="input py-2">
                <option value="">Toutes</option>
                {DISTRICTS_PAR_REGION.map((r) => (
                  <option key={r.region} value={r.region}>
                    {r.region}
                  </option>
                ))}
              </select>
            </Filtre>
            <Filtre libelle="District">
              <select name="district" defaultValue={actifs.district ?? ""} className="input py-2">
                <option value="">Tous</option>
                {DISTRICTS_PAR_REGION.map((r) => (
                  <optgroup key={r.region} label={r.region}>
                    {r.districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Filtre>
          </>
        )}
        <Filtre libelle="Du">
          <input type="date" name="du" defaultValue={actifs.du} className="input py-2" />
        </Filtre>
        <Filtre libelle="Au">
          <input type="date" name="au" defaultValue={actifs.au} className="input py-2" />
        </Filtre>
        <Filtre libelle="Comparer par">
          <select name="groupe" defaultValue={regroupement} className="input py-2">
            {REGROUPEMENTS.filter((g) => groupesPermis.includes(g.valeur)).map((g) => (
              <option key={g.valeur} value={g.valeur}>
                {g.libelle}
              </option>
            ))}
          </select>
        </Filtre>
        <Filtre libelle="Trier les réponses">
          <select name="tri" defaultValue={tri} className="input py-2">
            <option value="ordre">Ordre du questionnaire</option>
            <option value="desc">Plus choisies d&apos;abord</option>
          </select>
        </Filtre>
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700">
            Appliquer
          </button>
          {(filtreActif || regroupement !== "aucun" || tri !== "ordre") && (
            <Link
              href={`/admin/sondages/${id}`}
              className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Réinitialiser
            </Link>
          )}
        </div>
      </form>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Tuile libelle={filtreActif ? "Réponses (filtrées)" : "Réponses"} valeur={nombre(synthese.total)} />
        <Tuile libelle="Hommes" valeur={nombre(homme)} detail={part(homme)} />
        <Tuile libelle="Femmes" valeur={nombre(femme)} detail={part(femme)} />
        {districtImpose ? (
          <Tuile libelle="District" valeur={districtImpose} />
        ) : (
          <Tuile libelle="Districts représentés" valeur={`${synthese.districts} / 120`} detail={`${synthese.regions} région(s)`} />
        )}
        <Tuile libelle="Période des réponses" valeur={dateFr(synthese.derniere)} detail={`depuis le ${dateFr(synthese.premiere)}`} />
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={`/api/admin/sondages/${id}/export${versRequete({ ...actifs, groupe: regroupement === "aucun" ? undefined : regroupement, type: "reponses" })}`}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Exporter les réponses (CSV)
        </a>
        <a
          href={`/api/admin/sondages/${id}/export${versRequete({ ...actifs, groupe: regroupement === "aucun" ? undefined : regroupement, type: "synthese" })}`}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Exporter la synthèse (CSV)
        </a>
        <span className="self-center text-xs text-zinc-500">Les exports reprennent les filtres et la comparaison choisis.</span>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <SyntheseVue s={synthese} partie="graphes" />
        </div>
        {!districtImpose && <SyntheseVue s={synthese} partie="zones" />}
        {resultats.map((r, i) => (
          <QuestionVue key={r.question.id} r={r} numero={i + 1} groupeLibelle={libelleGroupe} />
        ))}
      </div>
    </div>
  );
}

function Filtre({ libelle, children }: { libelle: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs font-medium text-zinc-600 sm:flex-none">
      {libelle}
      {children}
    </label>
  );
}
