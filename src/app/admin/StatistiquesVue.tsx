import {
  calculerStatistiques,
  COMMUNE_NON_RENSEIGNEE,
  type LigneZone,
} from "@/lib/statistiques";

const nombre = (n: number, decimales = 0) =>
  n.toLocaleString("fr-FR", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: 0,
  });

/** `district` : statistiques limitées à ce district (administrateur de district). */
export default async function StatistiquesVue({
  district,
}: {
  district?: string;
}) {
  const s = await calculerStatistiques(district);
  const communesRepresentees = s.parCommune.filter(
    (c) => c.nom !== COMMUNE_NON_RENSEIGNEE,
  ).length;

  return (
    <div className="mt-6 flex flex-col gap-8">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Tuile
          libelle="Associations enregistrées"
          valeur={nombre(s.totalAssociations)}
        />
        <Tuile
          libelle="Membres déclarés (total)"
          valeur={nombre(s.totalMembres)}
        />
        <Tuile
          libelle="Membres par association (moyenne)"
          valeur={nombre(s.moyenneMembres, 1)}
        />
        <Tuile
          libelle="Membres par association (médiane)"
          valeur={nombre(s.medianeMembres, 1)}
        />
        {district ? (
          <Tuile
            libelle="Communes représentées"
            valeur={String(communesRepresentees)}
          />
        ) : (
          <Tuile
            libelle="Districts représentés"
            valeur={`${s.districtsCouverts} / 120`}
          />
        )}
      </section>

      <Bloc
        titre="Répartition des associations selon le nombre de membres"
        export="tranches"
        note="Nombre d'associations dans chaque tranche de taille."
      >
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500">
            <tr>
              <th className="py-2 pr-4 font-medium">Nombre de membres</th>
              <th className="w-1/2 py-2 pr-4 font-medium">Associations</th>
              <th className="py-2 pr-4 text-right font-medium">Part</th>
              <th className="py-2 text-right font-medium">Membres déclarés</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {s.parTranche.map((t) => (
              <tr key={t.libelle}>
                <td className="whitespace-nowrap py-2 pr-4 text-zinc-700">
                  {t.libelle}
                </td>
                <td className="py-2 pr-4">
                  <Barre
                    valeur={t.associations}
                    max={Math.max(...s.parTranche.map((x) => x.associations))}
                    infobulle={`${t.libelle} membres : ${t.associations} association(s)`}
                  />
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-zinc-600">
                  {nombre(t.part * 100, 1)} %
                </td>
                <td className="py-2 text-right tabular-nums text-zinc-600">
                  {nombre(t.membres)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Bloc>

      <Bloc
        titre="Associations et membres par commune"
        export="communes"
        note="Trié par nombre d'associations. Commune choisie dans la liste officielle ou saisie à la main."
      >
        <TableZones
          lignes={s.parCommune}
          colonnes={district ? ["Commune"] : ["Commune", "District"]}
        />
      </Bloc>

      {!district && (
        <Bloc
          titre="Associations et membres par district"
          export="districts"
          note="Trié par nombre d'associations. Seuls les districts ayant au moins une association apparaissent."
        >
          <TableZones
            lignes={s.parDistrict}
            colonnes={["District", "Région"]}
          />
        </Bloc>
      )}

      {!district && (
        <Bloc titre="Associations et membres par région" export="regions">
          <TableZones lignes={s.parRegion} colonnes={["Région"]} />
        </Bloc>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold text-zinc-900">
          Données détaillées
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Tous les dossiers enregistrés, une ligne par dossier (association,
          district, membres, coordonnées, description...). Le fichier
          s&apos;ouvre dans Excel ou LibreOffice.
        </p>
        <a
          href="/api/admin/export?type=dossiers"
          className="mt-3 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Exporter tous les dossiers (CSV)
        </a>
      </section>
    </div>
  );
}

function Tuile({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <p className="text-2xl font-semibold tabular-nums text-zinc-900">
        {valeur}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{libelle}</p>
    </div>
  );
}

function Bloc({
  titre,
  note,
  export: typeExport,
  children,
}: {
  titre: string;
  note?: string;
  export: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{titre}</h2>
          {note && <p className="mt-0.5 text-xs text-zinc-500">{note}</p>}
        </div>
        <a
          href={`/api/admin/export?type=${typeExport}`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Exporter (CSV)
        </a>
      </div>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </section>
  );
}

/** `colonnes` : libellé de la zone, puis éventuellement celui de la zone parente (champ « region »). */
function TableZones({
  lignes,
  colonnes,
}: {
  lignes: LigneZone[];
  colonnes: [string] | [string, string];
}) {
  const avecParent = colonnes.length === 2;
  if (lignes.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-500">
        Aucune association enregistrée.
      </p>
    );
  }
  const maxAssociations = Math.max(...lignes.map((l) => l.associations));
  const maxMembres = Math.max(...lignes.map((l) => l.membres));
  return (
    <div className="max-h-[32rem] overflow-y-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white text-zinc-500">
          <tr>
            <th className="py-2 pr-4 font-medium">{colonnes[0]}</th>
            {avecParent && (
              <th className="py-2 pr-4 font-medium">{colonnes[1]}</th>
            )}
            <th className="w-1/4 py-2 pr-4 font-medium">Associations</th>
            <th className="w-1/4 py-2 pr-4 font-medium">Membres déclarés</th>
            <th className="py-2 text-right font-medium">Moyenne</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {lignes.map((l) => (
            <tr key={`${l.region ?? ""}|${l.nom}`}>
              <td className="whitespace-nowrap py-2 pr-4 text-zinc-900">
                {l.nom}
              </td>
              {avecParent && (
                <td className="whitespace-nowrap py-2 pr-4 text-zinc-500">
                  {l.region}
                </td>
              )}
              <td className="py-2 pr-4">
                <Barre
                  valeur={l.associations}
                  max={maxAssociations}
                  infobulle={`${l.nom} : ${l.associations} association(s)`}
                />
              </td>
              <td className="py-2 pr-4">
                <Barre
                  valeur={l.membres}
                  max={maxMembres}
                  infobulle={`${l.nom} : ${nombre(l.membres)} membre(s)`}
                />
              </td>
              <td className="py-2 text-right tabular-nums text-zinc-600">
                {nombre(l.moyenneMembres, 1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Barre horizontale simple (une seule série) avec la valeur affichée à droite. */
function Barre({
  valeur,
  max,
  infobulle,
}: {
  valeur: number;
  max: number;
  infobulle: string;
}) {
  const largeur =
    max > 0 ? Math.max((valeur / max) * 100, valeur > 0 ? 2 : 0) : 0;
  return (
    <div className="group flex items-center gap-2" title={infobulle}>
      <div className="h-3 min-w-[4rem] flex-1">
        <div
          className="h-full rounded-r-[4px] bg-vfm-marine transition-opacity group-hover:opacity-80"
          style={{ width: `${largeur}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right tabular-nums text-zinc-700">
        {nombre(valeur)}
      </span>
    </div>
  );
}
