"use client";

import { useEffect, useState } from "react";

export interface Localite {
  commune: string;
  communePcode: string;
  communeManuelle: boolean;
  fokontany: string;
  fokontanyPcode: string;
  fokontanyManuel: boolean;
}

export const LOCALITE_VIDE: Localite = {
  commune: "",
  communePcode: "",
  communeManuelle: false,
  fokontany: "",
  fokontanyPcode: "",
  fokontanyManuel: false,
};

interface CommuneRef {
  nom: string;
  pcode: string;
  fokontany: { nom: string; pcode: string }[];
}

const AUTRE = "__hafa__";

/**
 * Listes liées Kaominina > Fokontany pour le district choisi (référentiel
 * officiel), avec toujours la possibilité de saisir le nom à la main.
 */
export default function ChoixLocalite({
  district,
  valeur,
  onChange,
}: {
  district: string;
  valeur: Localite;
  onChange: (modif: Partial<Localite>) => void;
}) {
  const [communes, setCommunes] = useState<{ district: string; liste: CommuneRef[] } | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    if (!district) return;
    let annule = false;
    fetch(`/api/referentiel?district=${encodeURIComponent(district)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (!annule) {
          setCommunes({ district, liste: json.communes });
          setErreur(false);
        }
      })
      .catch(() => !annule && setErreur(true));
    return () => {
      annule = true;
    };
  }, [district]);

  if (!district) {
    return <p className="text-sm text-zinc-500">Safidio aloha ny distrika vao miseho ny kaominina.</p>;
  }

  const liste = communes?.district === district ? communes.liste : null;
  // Sans liste (chargement impossible), la saisie manuelle reste toujours possible.
  const communeManuelle = valeur.communeManuelle || erreur || liste?.length === 0;
  const communeChoisie = liste?.find((c) => c.pcode === valeur.communePcode);
  const fokontanyManuel = valeur.fokontanyManuel || communeManuelle || (communeChoisie && communeChoisie.fokontany.length === 0);

  return (
    <>
      <Champ label="Kaominina" obligatoire>
        {!communeManuelle && (
          <select
            className="input"
            value={valeur.communePcode}
            disabled={!liste}
            onChange={(e) => {
              if (e.target.value === AUTRE) {
                onChange({ ...LOCALITE_VIDE, communeManuelle: true });
                return;
              }
              const c = liste?.find((x) => x.pcode === e.target.value);
              onChange({ ...LOCALITE_VIDE, commune: c?.nom ?? "", communePcode: c?.pcode ?? "" });
            }}
          >
            <option value="" disabled>
              {liste ? "Safidio ny kaominina" : "Eo am-pakana ny lisitra..."}
            </option>
            {liste?.map((c) => (
              <option key={c.pcode} value={c.pcode}>
                {c.nom}
              </option>
            ))}
            <option value={AUTRE}>Hafa (soraty ny anarana)</option>
          </select>
        )}
        {communeManuelle && (
          <div className="flex items-center gap-2">
            <input
              className="input"
              placeholder="Soraty ny anaran'ny kaominina"
              value={valeur.commune}
              onChange={(e) => onChange({ commune: e.target.value, communePcode: "" })}
            />
            {!erreur && liste && liste.length > 0 && (
              <BoutonListe onClick={() => onChange({ ...LOCALITE_VIDE })} />
            )}
          </div>
        )}
      </Champ>

      <Champ label="Fokontany">
        {!fokontanyManuel && communeChoisie && (
          <select
            className="input"
            value={valeur.fokontanyPcode}
            onChange={(e) => {
              if (e.target.value === AUTRE) {
                onChange({ fokontany: "", fokontanyPcode: "", fokontanyManuel: true });
                return;
              }
              const f = communeChoisie.fokontany.find((x) => x.pcode === e.target.value);
              onChange({ fokontany: f?.nom ?? "", fokontanyPcode: f?.pcode ?? "", fokontanyManuel: false });
            }}
          >
            <option value="">Safidio ny fokontany (tsy voatery)</option>
            {communeChoisie.fokontany.map((f) => (
              <option key={f.pcode} value={f.pcode}>
                {f.nom}
              </option>
            ))}
            <option value={AUTRE}>Hafa (soraty ny anarana)</option>
          </select>
        )}
        {!fokontanyManuel && !communeChoisie && (
          <select className="input" disabled value="">
            <option value="">Safidio aloha ny kaominina</option>
          </select>
        )}
        {fokontanyManuel && (
          <div className="flex items-center gap-2">
            <input
              className="input"
              placeholder="Soraty ny anaran'ny fokontany (tsy voatery)"
              value={valeur.fokontany}
              onChange={(e) => onChange({ fokontany: e.target.value, fokontanyPcode: "" })}
            />
            {valeur.fokontanyManuel && communeChoisie && communeChoisie.fokontany.length > 0 && (
              <BoutonListe onClick={() => onChange({ fokontany: "", fokontanyPcode: "", fokontanyManuel: false })} />
            )}
          </div>
        )}
      </Champ>
    </>
  );
}

function BoutonListe({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border border-dashed border-vfm-vert/50 px-3 py-2 text-xs font-medium text-vfm-vert-dark hover:bg-vfm-vert/10"
    >
      Lisitra
    </button>
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
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">
        {label} {obligatoire && <span className="text-vfm-rouge">*</span>}
      </span>
      {children}
    </div>
  );
}
