"use client";

import Link from "next/link";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { useEffect, useMemo, useState } from "react";
import type { AssociationCarte, CommuneCarte, ZoneCarte } from "@/lib/carte";

interface Entite {
  type: "Feature";
  properties: { pcode: string; nom: string };
  geometry: GeoPermissibleObjects;
}
interface Collection {
  type: "FeatureCollection";
  features: Entite[];
}

type Donnees =
  | { niveau: "national"; districts: ZoneCarte[]; sansDistrict: number }
  | { niveau: "district"; district: string; pcode?: string; communes: CommuneCarte[] };

// Échelle séquentielle à une teinte (vert du logo), du plus clair au plus foncé
const PALIERS = [
  { min: 1, couleur: "#cdeed8", libelle: "1" },
  { min: 2, couleur: "#8fd3a8", libelle: "2 à 4" },
  { min: 5, couleur: "#3fae6c", libelle: "5 à 9" },
  { min: 10, couleur: "#0a7d3d", libelle: "10 et plus" },
];
const COULEUR_VIDE = "#f4f1ea";

function couleur(n: number): string {
  if (n <= 0) return COULEUR_VIDE;
  return [...PALIERS].reverse().find((p) => n >= p.min)!.couleur;
}

const LARGEUR = 600;

export default function CarteAdmin({ districtImpose }: { districtImpose?: string }) {
  const [district, setDistrict] = useState<string | undefined>(districtImpose);
  const [donnees, setDonnees] = useState<Donnees | null>(null);
  const [formes, setFormes] = useState<Collection | null>(null);
  const [survol, setSurvol] = useState<{ x: number; y: number; texte: string } | null>(null);
  const [communeChoisie, setCommuneChoisie] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  // Chargement des données (filtrées côté serveur selon les droits) puis des contours
  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const url = new URL("/api/admin/carte", window.location.origin);
        if (district) url.searchParams.set("district", district);
        const d: Donnees = await fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));
        const fichier =
          d.niveau === "national" ? "/carte/districts.json" : d.pcode ? `/carte/communes/${d.pcode}.json` : null;
        const f: Collection | null = fichier ? await fetch(fichier).then((r) => r.json()) : null;
        if (!annule) {
          setDonnees(d);
          setFormes(f);
          setCommuneChoisie(null);
          setErreur(null);
        }
      } catch {
        if (!annule) setErreur("Impossible de charger la carte.");
      }
    })();
    return () => {
      annule = true;
    };
  }, [district]);

  const parPcode = useMemo(() => {
    const m = new Map<string, ZoneCarte | CommuneCarte>();
    if (donnees?.niveau === "national") donnees.districts.forEach((z) => z.pcode && m.set(z.pcode, z));
    if (donnees?.niveau === "district") donnees.communes.forEach((z) => z.pcode && m.set(z.pcode, z));
    return m;
  }, [donnees]);

  const dessin = useMemo(() => {
    if (!formes) return null;
    const projection = geoMercator().fitWidth(LARGEUR, formes as unknown as GeoPermissibleObjects);
    const chemin = geoPath(projection);
    const [[, y0], [, y1]] = chemin.bounds(formes as unknown as GeoPermissibleObjects);
    return { chemin, hauteur: Math.ceil(y1 - y0) + 2, decalage: -y0 + 1 };
  }, [formes]);

  if (erreur) return <p className="mt-6 text-sm text-red-700">{erreur}</p>;
  if (!donnees || (!dessin && donnees.niveau === "national")) {
    return <p className="mt-6 text-sm text-zinc-500">Chargement de la carte...</p>;
  }

  const national = donnees.niveau === "national";
  const total = national
    ? donnees.districts.reduce((s, z) => s + z.associations, 0) + donnees.sansDistrict
    : donnees.communes.reduce((s, z) => s + z.associations, 0);
  const zonesAvecAssociations = national ? donnees.districts.length : donnees.communes.filter((c) => c.pcode).length;
  const communesManuelles = !national ? donnees.communes.filter((c) => !c.pcode) : [];
  const detail = !national
    ? donnees.communes.find((c) => (c.pcode ?? `manuel:${c.nom}`) === communeChoisie)
    : undefined;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          {!districtImpose && !national && (
            <button
              type="button"
              onClick={() => setDistrict(undefined)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
            >
              ← Madagascar
            </button>
          )}
          <h2 className="text-base font-semibold text-zinc-900">
            {national ? "Madagascar — associations par district" : `District ${donnees.district} — associations par commune`}
          </h2>
        </div>
        <p className="text-sm text-zinc-500">
          {total} association(s) · {zonesAvecAssociations} {national ? "district(s)" : "commune(s)"} représenté(s)
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="relative rounded-lg border border-zinc-200 bg-white p-3">
          {dessin && formes ? (
            <svg
              viewBox={`0 0 ${LARGEUR} ${dessin.hauteur}`}
              className="mx-auto h-auto max-h-[75vh] w-full"
              role="img"
              aria-label={national ? "Carte des districts de Madagascar" : `Carte des communes de ${donnees.district}`}
              onMouseLeave={() => setSurvol(null)}
            >
              <g transform={`translate(0 ${dessin.decalage})`}>
                {formes.features.map((f) => {
                  const zone = parPcode.get(f.properties.pcode);
                  const n = zone?.associations ?? 0;
                  const choisie = !national && communeChoisie === f.properties.pcode;
                  return (
                    <path
                      key={f.properties.pcode}
                      d={dessin.chemin(f.geometry) ?? undefined}
                      fill={couleur(n)}
                      stroke={choisie ? "#142b47" : "#ffffff"}
                      strokeWidth={choisie ? 2 : national ? 0.6 : 1}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onMouseMove={(e) => {
                        const cadre = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                        setSurvol({
                          x: e.clientX - cadre.left,
                          y: e.clientY - cadre.top,
                          texte: `${f.properties.nom} : ${n} association(s)${zone ? `, ${zone.membres} membre(s)` : ""}`,
                        });
                      }}
                      onClick={() =>
                        national ? setDistrict(f.properties.nom) : setCommuneChoisie(f.properties.pcode)
                      }
                    >
                      <title>{`${f.properties.nom} : ${n} association(s)`}</title>
                    </path>
                  );
                })}
              </g>
            </svg>
          ) : (
            <p className="py-10 text-center text-sm text-zinc-500">Contours de ce district indisponibles.</p>
          )}
          {survol && (
            <div
              className="pointer-events-none absolute z-10 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow"
              style={{ left: survol.x + 16, top: survol.y + 8 }}
            >
              {survol.texte}
            </div>
          )}
          <Legende />
          <p className="mt-2 text-[11px] text-zinc-400">
            Limites administratives : BNGRC, via OCHA/HDX (CC BY-IGO).{" "}
            {national ? "Cliquez sur un district pour voir ses communes." : "Cliquez sur une commune pour voir ses associations."}
          </p>
        </div>

        <aside className="flex flex-col gap-4">
          {national ? (
            <ClassementDistricts districts={donnees.districts} sansDistrict={donnees.sansDistrict} onChoisir={setDistrict} />
          ) : (
            <>
              {detail ? (
                <ListeAssociations titre={detail.nom} liste={detail.liste} />
              ) : (
                <ClassementCommunes communes={donnees.communes} onChoisir={(c) => setCommuneChoisie(c.pcode ?? `manuel:${c.nom}`)} />
              )}
              {communesManuelles.length > 0 && (
                <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="text-sm font-semibold text-amber-900">Communes saisies à la main (hors carte)</h3>
                  <ul className="mt-2 flex flex-col gap-1 text-sm">
                    {communesManuelles.map((c) => (
                      <li key={c.nom}>
                        <button
                          type="button"
                          onClick={() => setCommuneChoisie(`manuel:${c.nom}`)}
                          className="text-amber-900 underline"
                        >
                          {c.nom}
                        </button>{" "}
                        <span className="text-amber-800">({c.associations})</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Legende() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
      <span className="font-medium">Associations :</span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-5 rounded-sm border border-zinc-300" style={{ background: COULEUR_VIDE }} /> 0
      </span>
      {PALIERS.map((p) => (
        <span key={p.min} className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm" style={{ background: p.couleur }} /> {p.libelle}
        </span>
      ))}
    </div>
  );
}

function ClassementDistricts({
  districts,
  sansDistrict,
  onChoisir,
}: {
  districts: ZoneCarte[];
  sansDistrict: number;
  onChoisir: (d: string) => void;
}) {
  const tries = [...districts].sort((a, b) => b.associations - a.associations);
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Districts ayant des associations</h3>
      {tries.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">Aucune association localisée pour le moment.</p>
      ) : (
        <ul className="mt-2 max-h-[55vh] divide-y divide-zinc-100 overflow-y-auto text-sm">
          {tries.map((d) => (
            <li key={d.nom}>
              <button
                type="button"
                onClick={() => onChoisir(d.nom)}
                className="flex w-full justify-between gap-2 py-2 text-left hover:text-zinc-900"
              >
                <span className="text-zinc-800 underline-offset-2 hover:underline">{d.nom}</span>
                <span className="tabular-nums text-zinc-500">
                  {d.associations} · {d.membres} membres
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {sansDistrict > 0 && (
        <p className="mt-2 text-xs text-zinc-500">+ {sansDistrict} association(s) sans district renseigné.</p>
      )}
    </section>
  );
}

function ClassementCommunes({
  communes,
  onChoisir,
}: {
  communes: CommuneCarte[];
  onChoisir: (c: CommuneCarte) => void;
}) {
  const tries = [...communes].filter((c) => c.pcode).sort((a, b) => b.associations - a.associations);
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Communes ayant des associations</h3>
      {tries.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">Aucune association localisée dans ce district.</p>
      ) : (
        <ul className="mt-2 max-h-[55vh] divide-y divide-zinc-100 overflow-y-auto text-sm">
          {tries.map((c) => (
            <li key={c.pcode}>
              <button type="button" onClick={() => onChoisir(c)} className="flex w-full justify-between gap-2 py-2 text-left">
                <span className="text-zinc-800 underline-offset-2 hover:underline">{c.nom}</span>
                <span className="tabular-nums text-zinc-500">
                  {c.associations} · {c.membres} membres
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ListeAssociations({ titre, liste }: { titre: string; liste: AssociationCarte[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">
        {titre} — {liste.length} association(s)
      </h3>
      <ul className="mt-2 max-h-[55vh] divide-y divide-zinc-100 overflow-y-auto text-sm">
        {liste.map((a) => (
          <li key={a.reference} className="py-2">
            <Link
              href={`/admin?vue=fiches&ref=${encodeURIComponent(a.reference)}`}
              className="font-medium text-zinc-900 underline-offset-2 hover:underline"
            >
              {a.nom}
            </Link>
            <p className="text-xs text-zinc-500">
              {a.responsable && <>Responsable : {a.responsable} · </>}
              <a href={`tel:${a.telephone.replace(/\s/g, "")}`} className="underline">
                {a.telephone}
              </a>
              {a.fokontany && <> · Fokontany {a.fokontany}</>} · {a.membres} membres
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
