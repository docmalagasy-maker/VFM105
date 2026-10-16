import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import PublicShell from "@/components/PublicShell";
import { isDatabaseConfigured } from "@/lib/db";
import { COOKIE_PARTICIPANT, listerSondagesActifs, sondagesDejaRepondus } from "@/lib/sondages";

export const metadata: Metadata = {
  title: "Manehoa hevitra — VFM",
  description: "Omeo ny hevitrao momba ireo lohahevitra samihafa.",
};

export default async function SondagesPage() {
  // cookies() rend la page dynamique : liste et « déjà répondu » toujours à jour.
  const participant = (await cookies()).get(COOKIE_PARTICIPANT)?.value;
  const sondages = isDatabaseConfigured() ? await listerSondagesActifs() : [];
  const repondus = isDatabaseConfigured() ? await sondagesDejaRepondus(participant) : new Set<number>();

  return (
    <PublicShell cardClassName="max-w-2xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-vfm-marine sm:text-3xl">Manehoa hevitra</h1>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Safidio ny lohahevitra tianao hanomezana hevitra.
        </p>
      </div>

      {sondages.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          Tsy misy fanadihadiana misokatra amin&apos;izao fotoana izao.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {sondages.map((s) => {
            const repondu = repondus.has(s.id);
            return (
              <li key={s.id}>
                <Link
                  href={`/sondages/${s.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-vfm-beige-bord bg-vfm-beige-clair p-4 transition-colors hover:border-vfm-vert hover:bg-white sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-vfm-marine">{s.titre}</p>
                    {s.description && <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{s.description}</p>}
                    <p className="mt-2 text-xs text-zinc-500">
                      {s.questions.length} fanontaniana
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      repondu ? "bg-vfm-vert/10 text-vfm-vert-dark" : "bg-vfm-marine text-white"
                    }`}
                  >
                    {repondu ? "Efa namaly" : "Hamaly"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PublicShell>
  );
}
