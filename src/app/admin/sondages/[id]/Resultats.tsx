import type { Groupe, LigneClassement, LigneOption, ResultatQuestion, Synthese } from "@/lib/sondages-analyse";

/** Affichage des résultats d'un sondage (composants serveur, sans état). */

// Couleurs des deux séries « Homme » / « Femme » (palette validée : contraste et daltonisme).
export const COULEUR_SEXE: Record<string, string> = { Homme: "#2a78d6", Femme: "#eb6834" };

const nombre = (n: number, decimales = 0) =>
  n.toLocaleString("fr-FR", { maximumFractionDigits: decimales, minimumFractionDigits: 0 });
const pourcent = (part: number) => `${nombre(part * 100, 1)} %`;
const dateCourte = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Indian/Antananarivo", day: "2-digit", month: "2-digit", year: "numeric" });

export function Tuile({ libelle, valeur, detail }: { libelle: string; valeur: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <p className="text-2xl font-semibold tabular-nums text-zinc-900">{valeur}</p>
      <p className="mt-1 text-xs text-zinc-500">{libelle}</p>
      {detail && <p className="text-xs text-zinc-400">{detail}</p>}
    </div>
  );
}

export function Carte({ titre, note, children }: { titre: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="text-base font-semibold text-zinc-900">{titre}</h2>
      {note && <p className="mt-0.5 text-xs text-zinc-500">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Barre horizontale simple (une série) avec la valeur à droite. */
function Barre({ part, texte, infobulle }: { part: number; texte: string; infobulle: string }) {
  const largeur = Math.max(part * 100, part > 0 ? 1.5 : 0);
  return (
    <div className="group flex items-center gap-2" title={infobulle}>
      <div className="h-3 min-w-[4rem] flex-1">
        <div
          className="h-full rounded-r-[4px] bg-vfm-marine transition-opacity group-hover:opacity-80"
          style={{ width: `${largeur}%` }}
        />
      </div>
      <span className="w-24 shrink-0 text-right text-xs tabular-nums text-zinc-700">{texte}</span>
    </div>
  );
}

/** partie « graphes » : sexe et chronologie ; partie « zones » : participation par district. */
export function SyntheseVue({ s, partie }: { s: Synthese; partie: "graphes" | "zones" }) {
  const totalSexe = s.parSexe.reduce((a, b) => a + b.nombre, 0);
  const maxJour = Math.max(1, ...s.parJour.map((j) => j.nombre));
  const maxZone = Math.max(1, ...s.parZone.map((z) => z.nombre));
  if (partie === "zones") return <Zones s={s} maxZone={maxZone} />;
  return (
    <>
      <Carte titre="Répartition par sexe">
        {totalSexe === 0 ? (
          <Vide />
        ) : (
          <>
            {/* Barre empilée à deux segments, séparés par un espace blanc */}
            <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded-[4px]">
              {s.parSexe
                .filter((x) => x.nombre > 0)
                .map((x) => (
                  <div
                    key={x.nom}
                    title={`${x.nom} : ${x.nombre} (${pourcent(x.nombre / totalSexe)})`}
                    style={{ width: `${(x.nombre / totalSexe) * 100}%`, background: COULEUR_SEXE[x.nom] }}
                  />
                ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-700">
              {s.parSexe.map((x) => (
                <li key={x.nom} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COULEUR_SEXE[x.nom] }} aria-hidden />
                  {x.nom} : <span className="font-medium tabular-nums">{x.nombre}</span>
                  <span className="text-zinc-500">({pourcent(totalSexe ? x.nombre / totalSexe : 0)})</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Carte>

      <Carte titre="Réponses par jour" note="Heure de Madagascar. Survolez une barre pour le détail.">
        {s.parJour.length === 0 ? (
          <Vide />
        ) : s.parJour.length === 1 ? (
          <p className="text-sm text-zinc-700">
            Toutes les réponses ont été reçues le {dateCourte(s.parJour[0].jour)} ({s.parJour[0].nombre}).
          </p>
        ) : (
          <div>
            <div className="flex h-32 items-end gap-0.5 border-b border-zinc-200">
              {s.parJour.map((j) => (
                <div key={j.jour} className="group flex h-full flex-1 items-end" title={`${dateCourte(j.jour)} : ${j.nombre} réponse(s)`}>
                  <div
                    className="w-full rounded-t-[4px] bg-vfm-marine transition-opacity group-hover:opacity-80"
                    style={{ height: `${(j.nombre / maxJour) * 100}%`, minHeight: j.nombre ? 2 : 0 }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-zinc-500">
              <span>{dateCourte(s.parJour[0].jour)}</span>
              <span>max. {maxJour} / jour</span>
              <span>{dateCourte(s.parJour[s.parJour.length - 1].jour)}</span>
            </div>
          </div>
        )}
      </Carte>
    </>
  );
}

function Zones({ s, maxZone }: { s: Synthese; maxZone: number }) {
  return (
        <Carte titre="Participation par district" note="Trié par nombre de réponses.">
          {s.parZone.length === 0 ? (
            <Vide />
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white text-zinc-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">District</th>
                    <th className="py-2 pr-4 font-medium">Région</th>
                    <th className="w-1/2 py-2 font-medium">Réponses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {s.parZone.map((z) => (
                    <tr key={z.nom}>
                      <td className="whitespace-nowrap py-2 pr-4 text-zinc-900">{z.nom}</td>
                      <td className="whitespace-nowrap py-2 pr-4 text-zinc-500">{z.region}</td>
                      <td className="py-2">
                        <Barre
                          part={z.nombre / maxZone}
                          texte={`${z.nombre} (${pourcent(s.total ? z.nombre / s.total : 0)})`}
                          infobulle={`${z.nom} : ${z.nombre} réponse(s)`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Carte>
  );
}

const LIBELLE_TYPE: Record<string, string> = {
  unique: "Choix unique",
  multiple: "Choix multiples (plusieurs réponses possibles : les parts peuvent dépasser 100 %)",
  note: "Note de 1 à 5",
  texte: "Texte libre",
  classement: "Classement (rang 1 = préféré)",
};

export function QuestionVue({ r, numero, groupeLibelle }: { r: ResultatQuestion; numero: number; groupeLibelle: string }) {
  return (
    <Carte
      titre={`${numero}. ${r.question.intitule}`}
      note={`${LIBELLE_TYPE[r.question.type]} · ${r.repondants} répondant(s)`}
    >
      {r.repondants === 0 ? (
        <Vide />
      ) : r.type === "choix" ? (
        <>
          <TableOptions lignes={r.options} />
          {r.groupes.length > 0 && <ComparaisonOptions groupes={r.groupes} libelle={groupeLibelle} />}
        </>
      ) : r.type === "note" ? (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <Tuile libelle="Note moyenne" valeur={`${nombre(r.moyenne, 2)} / 5`} />
            <Tuile libelle="Note médiane" valeur={`${nombre(r.mediane, 1)} / 5`} />
          </div>
          <TableOptions lignes={r.repartition} />
          {r.groupes.length > 0 && <ComparaisonNotes groupes={r.groupes} libelle={groupeLibelle} />}
        </>
      ) : r.type === "classement" ? (
        <>
          <TableClassement lignes={r.lignes} />
          {r.groupes.length > 0 && <ComparaisonClassement groupes={r.groupes} libelle={groupeLibelle} />}
        </>
      ) : (
        <ul className="max-h-96 divide-y divide-zinc-100 overflow-y-auto text-sm">
          {r.textes.map((t, i) => (
            <li key={i} className="py-2.5">
              <p className="whitespace-pre-line text-zinc-800">{t.texte}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {t.sexe} · {t.district} · {dateCourte(t.creeLe)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Carte>
  );
}

function TableOptions({ lignes }: { lignes: LigneOption[] }) {
  const max = Math.max(...lignes.map((l) => l.part), 0);
  return (
    <table className="w-full text-left text-sm">
      <tbody className="divide-y divide-zinc-100">
        {lignes.map((l) => (
          <tr key={l.index}>
            <td className="w-2/5 py-2 pr-4 text-zinc-800">{l.libelle}</td>
            <td className="py-2">
              <Barre
                part={max ? l.part / max : 0}
                texte={`${l.nombre} · ${pourcent(l.part)}`}
                infobulle={`${l.libelle} : ${l.nombre} (${pourcent(l.part)})`}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TableClassement({ lignes }: { lignes: LigneClassement[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-zinc-500">
        <tr>
          <th className="py-2 pr-4 font-medium">Proposition</th>
          <th className="w-2/5 py-2 pr-4 font-medium">Score de préférence</th>
          <th className="py-2 pr-4 text-right font-medium">Rang moyen</th>
          <th className="py-2 text-right font-medium">Classée 1re</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {lignes.map((l) => (
          <tr key={l.index}>
            <td className="py-2 pr-4 text-zinc-800">{l.libelle}</td>
            <td className="py-2 pr-4">
              <Barre part={l.score} texte={`${nombre(l.score * 100, 0)} / 100`} infobulle={`${l.libelle} : rang moyen ${nombre(l.rangMoyen, 2)}`} />
            </td>
            <td className="py-2 pr-4 text-right tabular-nums text-zinc-700">{nombre(l.rangMoyen, 2)}</td>
            <td className="py-2 text-right tabular-nums text-zinc-700">{l.premieres}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Tableau croisé : une ligne par groupe, une colonne par proposition (part des répondants du groupe). */
function ComparaisonOptions({ groupes, libelle }: { groupes: Groupe<LigneOption[]>[]; libelle: string }) {
  const options = groupes[0]?.valeur ?? [];
  return (
    <Comparaison libelle={libelle}>
      <thead className="text-zinc-500">
        <tr>
          <th className="py-2 pr-4 font-medium">{libelle}</th>
          <th className="py-2 pr-4 text-right font-medium">n</th>
          {options.map((o) => (
            <th key={o.index} className="min-w-28 py-2 pr-4 font-medium">
              {o.libelle}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {groupes.map((g) => (
          <tr key={g.nom}>
            <td className="whitespace-nowrap py-2 pr-4 text-zinc-900">{g.nom}</td>
            <td className="py-2 pr-4 text-right tabular-nums text-zinc-500">{g.repondants}</td>
            {g.valeur.map((o) => (
              <td key={o.index} className="py-2 pr-4">
                <MiniBarre part={o.part} infobulle={`${g.nom} — ${o.libelle} : ${o.nombre} (${pourcent(o.part)})`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Comparaison>
  );
}

function ComparaisonNotes({ groupes, libelle }: { groupes: Groupe<{ moyenne: number; mediane: number }>[]; libelle: string }) {
  return (
    <Comparaison libelle={libelle}>
      <thead className="text-zinc-500">
        <tr>
          <th className="py-2 pr-4 font-medium">{libelle}</th>
          <th className="py-2 pr-4 text-right font-medium">n</th>
          <th className="w-1/2 py-2 pr-4 font-medium">Note moyenne</th>
          <th className="py-2 text-right font-medium">Médiane</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {groupes.map((g) => (
          <tr key={g.nom}>
            <td className="whitespace-nowrap py-2 pr-4 text-zinc-900">{g.nom}</td>
            <td className="py-2 pr-4 text-right tabular-nums text-zinc-500">{g.repondants}</td>
            <td className="py-2 pr-4">
              <Barre part={g.valeur.moyenne / 5} texte={`${nombre(g.valeur.moyenne, 2)} / 5`} infobulle={`${g.nom} : ${nombre(g.valeur.moyenne, 2)} / 5`} />
            </td>
            <td className="py-2 text-right tabular-nums text-zinc-700">{nombre(g.valeur.mediane, 1)}</td>
          </tr>
        ))}
      </tbody>
    </Comparaison>
  );
}

function ComparaisonClassement({ groupes, libelle }: { groupes: Groupe<LigneClassement[]>[]; libelle: string }) {
  const options = groupes[0]?.valeur ?? [];
  return (
    <Comparaison libelle={libelle} note="Rang moyen par groupe (1 = préféré) ; la barre montre le score de préférence.">
      <thead className="text-zinc-500">
        <tr>
          <th className="py-2 pr-4 font-medium">{libelle}</th>
          <th className="py-2 pr-4 text-right font-medium">n</th>
          {options.map((o) => (
            <th key={o.index} className="min-w-28 py-2 pr-4 font-medium">
              {o.libelle}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {groupes.map((g) => (
          <tr key={g.nom}>
            <td className="whitespace-nowrap py-2 pr-4 text-zinc-900">{g.nom}</td>
            <td className="py-2 pr-4 text-right tabular-nums text-zinc-500">{g.repondants}</td>
            {g.valeur.map((o) => (
              <td key={o.index} className="py-2 pr-4">
                <MiniBarre
                  part={o.score}
                  texte={g.repondants ? nombre(o.rangMoyen, 2) : "—"}
                  infobulle={`${g.nom} — ${o.libelle} : rang moyen ${nombre(o.rangMoyen, 2)}`}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Comparaison>
  );
}

function Comparaison({ libelle, note, children }: { libelle: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-zinc-100 pt-4">
      <p className="text-sm font-medium text-zinc-800">Comparaison par {libelle.toLowerCase()}</p>
      <p className="text-xs text-zinc-500">{note ?? "Part des répondants de chaque groupe ; n = nombre de répondants du groupe."}</p>
      <div className="mt-2 max-h-96 overflow-auto">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

function MiniBarre({ part, texte, infobulle }: { part: number; texte?: string; infobulle: string }) {
  return (
    <div className="flex items-center gap-1.5" title={infobulle}>
      <div className="h-2 w-12 shrink-0 rounded-[3px] bg-zinc-100">
        <div className="h-full rounded-[3px] bg-vfm-marine" style={{ width: `${Math.min(part, 1) * 100}%` }} />
      </div>
      <span className="text-xs tabular-nums text-zinc-700">{texte ?? pourcent(part)}</span>
    </div>
  );
}

function Vide() {
  return <p className="py-4 text-center text-sm text-zinc-500">Aucune réponse pour ces critères.</p>;
}
