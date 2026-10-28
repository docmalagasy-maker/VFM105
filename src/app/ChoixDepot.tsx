import Link from "next/link";
import { IconPeople } from "@/components/icons";

/**
 * Les deux boutons de dépôt de l'accueil, toujours visibles sous l'affiche :
 * - Fikambanana : formulaire des associations, inchangé (/deposer) ;
 * - Ny tenako manokana : formulaire des personnes physiques (/deposer/olona).
 */
export default function ChoixDepot() {
  const carte =
    "flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all hover:-translate-y-0.5";

  return (
    <div className="mt-6 flex w-full flex-col gap-3" role="group" aria-label="Karazana dosie">
      <p className="text-center text-base font-semibold text-vfm-marine-dark">
        Amin&apos;ny anaran&apos;iza no hisoratanao anarana&nbsp;?
      </p>
      <Link href="/deposer" className={`${carte} border-vfm-vert bg-vfm-vert text-white shadow-lg shadow-vfm-vert/25 hover:bg-vfm-vert-dark`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <IconPeople className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-semibold">Fikambanana</span>
          <span className="block text-sm text-white/85">sy ny mombamomba azy</span>
        </span>
      </Link>
      <Link href="/deposer/olona" className={`${carte} border-vfm-vert bg-white text-vfm-marine hover:bg-vfm-vert/5`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vfm-vert/10 text-vfm-vert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden>
            <circle cx="12" cy="8" r="4" />
            <path strokeLinecap="round" d="M4 20v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
          </svg>
        </span>
        <span>
          <span className="block font-semibold">Ny tenako manokana</span>
          <span className="block text-sm text-zinc-600">sy ny mombamomba ahy</span>
        </span>
      </Link>
    </div>
  );
}
