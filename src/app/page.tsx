import PublicShell from "@/components/PublicShell";
import ChoixDepot from "./ChoixDepot";

export default function Accueil() {
  return (
    <PublicShell cardClassName="max-w-md">
      <div className="flex flex-col items-center text-center">
        <span className="rounded-full bg-vfm-vert/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-vfm-vert-dark">
          Fametrahana Dosie
        </span>
        <h1 className="mt-3 text-2xl font-bold text-vfm-marine sm:text-3xl">VFM</h1>
        <p className="mt-3 text-sm text-zinc-600 sm:text-base">
          Apetraho ny Dosie-nao eo amin&apos;ny VFM ny antontan-taratasin&apos;ny fikambananao.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Misokatra ho an&apos;ny fikambanana rehetra manerana ireo distrika 120 eto
          Madagasikara.
        </p>
        <ChoixDepot />
      </div>
    </PublicShell>
  );
}
