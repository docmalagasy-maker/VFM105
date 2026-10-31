import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { etatInscriptions } from "@/lib/inscriptions";
import { MESSAGE_COMPLET } from "@/lib/inscriptions-regles";

/** Vrai si les 200 places sont prises (base absente ou injoignable : formulaire laissé ouvert, le serveur tranche à l'envoi). */
export async function inscriptionsCompletes(): Promise<boolean> {
  const etat = await etatInscriptions().catch((err) => {
    console.error("État des inscriptions (formulaire)", err);
    return null;
  });
  return etat?.complet ?? false;
}

/** Page affichée à la place des formulaires d'inscription quand c'est complet. */
export default function PageInscriptionsCompletes() {
  return (
    <PublicShell>
      <div className="text-center">
        <p className="mx-auto inline-block -rotate-3 rounded-lg bg-vfm-rouge px-6 py-2 text-2xl font-extrabold uppercase tracking-[0.3em] text-white shadow-lg">
          COMPLET
        </p>
        <p className="mt-6 text-base text-zinc-700">{MESSAGE_COMPLET}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-2xl bg-vfm-vert px-6 py-3 text-sm font-semibold text-white hover:bg-vfm-vert-dark"
        >
          Hiverina amin&apos;ny fandraisana
        </Link>
      </div>
    </PublicShell>
  );
}
