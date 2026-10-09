"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface PhotoGalerie {
  url: string;
  legende: string;
}

export default function GrilleGalerie({ photos }: { photos: PhotoGalerie[] }) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  const total = photos.length;
  const debutGlissement = useRef<number | null>(null);

  const fermer = useCallback(() => setOuverte(null), []);
  const precedente = useCallback(() => setOuverte((i) => (i === null ? i : (i - 1 + total) % total)), [total]);
  const suivante = useCallback(() => setOuverte((i) => (i === null ? i : (i + 1) % total)), [total]);

  // Clavier (← → Échap) et blocage du défilement de la page pendant l'agrandissement
  useEffect(() => {
    if (ouverte === null) return;
    function surTouche(e: KeyboardEvent) {
      if (e.key === "Escape") fermer();
      if (e.key === "ArrowLeft") precedente();
      if (e.key === "ArrowRight") suivante();
    }
    window.addEventListener("keydown", surTouche);
    const debordement = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", surTouche);
      document.body.style.overflow = debordement;
    };
  }, [ouverte, fermer, precedente, suivante]);

  const photo = ouverte === null ? null : photos[ouverte];

  return (
    <>
      <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.url}>
            <button
              type="button"
              onClick={() => setOuverte(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-vfm-beige-clair focus:outline-none focus-visible:ring-4 focus-visible:ring-vfm-vert/40"
              aria-label={p.legende ? `Hijery ny sary : ${p.legende}` : `Hijery ny sary ${i + 1}`}
            >
              <Image
                src={p.url}
                alt={p.legende || `Sary ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18rem"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {p.legende && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {p.legende}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {photo && ouverte !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={photo.legende || `Sary ${ouverte + 1}`}
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={fermer}
          onTouchStart={(e) => (debutGlissement.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (debutGlissement.current === null) return;
            const ecart = e.changedTouches[0].clientX - debutGlissement.current;
            if (Math.abs(ecart) > 50) (ecart > 0 ? precedente : suivante)();
            debutGlissement.current = null;
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
            <span>
              {ouverte + 1} / {total}
            </span>
            <button
              type="button"
              onClick={fermer}
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-white hover:bg-white/10"
              aria-label="Hidy"
            >
              ×
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              key={photo.url}
              src={photo.url}
              alt={photo.legende || `Sary ${ouverte + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {total > 1 && (
              <>
                <BoutonNavigation cote="gauche" onClick={precedente} />
                <BoutonNavigation cote="droite" onClick={suivante} />
              </>
            )}
          </div>

          <p className="min-h-12 px-4 py-3 text-center text-sm text-white">{photo.legende}</p>
        </div>
      )}
    </>
  );
}

function BoutonNavigation({ cote, onClick }: { cote: "gauche" | "droite"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={cote === "gauche" ? "Sary teo aloha" : "Sary manaraka"}
      className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white hover:bg-black/60 ${
        cote === "gauche" ? "left-2 sm:left-4" : "right-2 sm:right-4"
      }`}
    >
      {cote === "gauche" ? "←" : "→"}
    </button>
  );
}
