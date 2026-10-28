import type { Metadata } from "next";
import Image from "next/image";
import PublicShell from "@/components/PublicShell";
import { BIRAO, type MembreBirao } from "@/data/birao";

export const metadata: Metadata = {
  title: "Birao — VFM 105",
  description: "Ireo mpikambana ao amin'ny Birao Nasionaly VFM 105.",
};

/** Initiales affichées tant qu'aucune photo n'est fournie. */
function initiales(anarana: string): string {
  const mots = anarana.split(/\s+/).filter(Boolean);
  return ((mots[0]?.[0] ?? "") + (mots[mots.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function BiraoPage() {
  const [filoha, ...ireo] = BIRAO;

  return (
    <PublicShell cardClassName="max-w-5xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-vfm-marine sm:text-3xl">Birao Nasionaly</h1>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Ireo mpikambana ao amin&apos;ny Birao Nasionaly VFM 105.
        </p>
      </div>

      {/* Président mis en avant, puis les autres membres en grille */}
      {filoha && (
        <div className="mx-auto mt-8 max-w-sm">
          <Fiche membre={filoha} lehibe />
        </div>
      )}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ireo.map((m) => (
          <li key={m.anarana}>
            <Fiche membre={m} />
          </li>
        ))}
      </ul>
    </PublicShell>
  );
}

function Fiche({ membre: m, lehibe = false }: { membre: MembreBirao; lehibe?: boolean }) {
  const taille = lehibe ? "h-24 w-24 text-2xl" : "h-20 w-20 text-xl";
  return (
    <article className="flex h-full flex-col items-center rounded-2xl border border-vfm-beige-bord bg-vfm-beige-clair p-5 text-center">
      {m.photo ? (
        <div className={`relative ${taille} overflow-hidden rounded-full ring-4 ring-white`}>
          <Image src={`/images/birao/${m.photo}`} alt={m.anarana} fill sizes="96px" className="object-cover" />
        </div>
      ) : (
        <div
          className={`flex ${taille} items-center justify-center rounded-full bg-vfm-marine font-bold text-white ring-4 ring-white`}
          aria-hidden
        >
          {initiales(m.anarana)}
        </div>
      )}
      <h2 className={`mt-4 font-semibold text-vfm-marine ${lehibe ? "text-lg" : "text-base"}`}>{m.anarana}</h2>
      <p className="mt-1 text-sm font-medium text-vfm-vert-dark">{m.andraikitra}</p>
      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs text-zinc-600">
        Distrika : <span className="font-medium text-zinc-800">{m.distrika}</span>
      </p>
      {m.tantara && <p className="mt-3 whitespace-pre-line text-left text-sm text-zinc-600">{m.tantara}</p>}
    </article>
  );
}
