"use client";

import { useEffect, useRef, useState } from "react";

// Station AzuraCast hébergée sur le même VPS (projet Coolify « Radio VFM »).
const RADIO_URL = "https://radio.0550.site";
const FLUX_URL = `${RADIO_URL}/listen/vfm/radio.mp3`;
const API_URL = `${RADIO_URL}/api/nowplaying/vfm`;
const RAFRAICHISSEMENT_MS = 15_000;

type Morceau = { titre: string; artiste: string; pochette: string | null };
type EtatRadio = { enLigne: boolean; enCours: Morceau | null; suivant: Morceau | null };
type Lecture = "arret" | "chargement" | "lecture";

type ChansonApi = { text?: string; title?: string; artist?: string; art?: string };

function versMorceau(song: ChansonApi | undefined): Morceau | null {
  if (!song) return null;
  return {
    titre: song.title || song.text || "",
    artiste: song.artist || "",
    pochette: song.art || null,
  };
}

/** Lecteur du direct : le flux est commun à tous les auditeurs, Play rejoint le programme en cours. */
export default function LecteurRadio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [lecture, setLecture] = useState<Lecture>("arret");
  const [volume, setVolume] = useState(0.8);
  const [etat, setEtat] = useState<EtatRadio | null>(null);
  const [erreur, setErreur] = useState(false);

  // Titre en cours, rafraîchi régulièrement depuis l'API publique d'AzuraCast.
  useEffect(() => {
    let actif = true;
    async function charger() {
      try {
        const reponse = await fetch(API_URL, { cache: "no-store" });
        if (!reponse.ok) throw new Error(String(reponse.status));
        const donnees = await reponse.json();
        if (!actif) return;
        setEtat({
          enLigne: Boolean(donnees.is_online),
          enCours: versMorceau(donnees.now_playing?.song),
          suivant: versMorceau(donnees.playing_next?.song),
        });
      } catch {
        if (actif) setEtat({ enLigne: false, enCours: null, suivant: null });
      }
    }
    charger();
    const minuterie = setInterval(charger, RAFRAICHISSEMENT_MS);
    return () => {
      actif = false;
      clearInterval(minuterie);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  async function basculer() {
    const audio = audioRef.current;
    if (!audio) return;

    if (lecture !== "arret") {
      // Arrêt complet (et non pause) : à la reprise, on rejoint le direct.
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setLecture("arret");
      return;
    }

    setErreur(false);
    setLecture("chargement");
    // Paramètre unique : évite qu'un navigateur rejoue un ancien tampon.
    audio.src = `${FLUX_URL}?t=${Date.now()}`;
    try {
      await audio.play();
    } catch {
      setErreur(true);
      setLecture("arret");
    }
  }

  const horsLigne = etat !== null && !etat.enLigne;

  return (
    <div className="mt-8 flex flex-col items-center gap-6">
      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => setLecture("lecture")}
        onWaiting={() => setLecture((l) => (l === "arret" ? l : "chargement"))}
        onError={() => {
          if (lecture !== "arret") {
            setErreur(true);
            setLecture("arret");
          }
        }}
      />

      <div className="flex w-full items-center gap-4 rounded-2xl border border-vfm-beige-bord bg-vfm-beige/40 p-4">
        {etat?.enCours?.pochette ? (
          // Pochette servie par AzuraCast (domaine externe) : balise img simple.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={etat.enCours.pochette}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="h-16 w-16 shrink-0 rounded-xl bg-vfm-marine/10" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-vfm-vert-dark">
            {horsLigne ? "Tsy mandeha" : "Mandeha ankehitriny"}
          </p>
          <p className="truncate font-semibold text-vfm-marine">
            {horsLigne
              ? "Tsy mandeha ny radio amin'izao fotoana izao."
              : etat?.enCours?.titre || "…"}
          </p>
          {!horsLigne && etat?.enCours?.artiste && (
            <p className="truncate text-sm text-zinc-600">{etat.enCours.artiste}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={basculer}
        disabled={horsLigne && lecture === "arret"}
        aria-label={lecture === "arret" ? "Henoy mivantana" : "Ajanony"}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-vfm-marine text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {lecture === "chargement" ? (
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        ) : lecture === "lecture" ? (
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden>
            <rect x="6" y="6" width="12" height="12" rx="1.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9" fill="currentColor" aria-hidden>
            <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
          </svg>
        )}
      </button>
      <p className="-mt-3 text-sm font-medium text-vfm-marine">
        {lecture === "arret" ? "Henoy mivantana" : lecture === "chargement" ? "Mampiditra…" : "Ajanony"}
      </p>

      {erreur && (
        <p className="text-center text-sm text-red-700">
          Tsy afaka mihaino ny radio. Andramo indray afaka kelikely.
        </p>
      )}

      <label className="flex w-full max-w-xs items-center gap-3 text-sm text-zinc-600">
        <span>Feo</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-vfm-marine"
        />
      </label>

      {!horsLigne && etat?.suivant?.titre && (
        <p className="text-center text-sm text-zinc-500">
          Manaraka : <span className="font-medium text-zinc-700">{etat.suivant.titre}</span>
        </p>
      )}
    </div>
  );
}
