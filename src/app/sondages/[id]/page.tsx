import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import PublicShell from "@/components/PublicShell";
import { isDatabaseConfigured } from "@/lib/db";
import { COOKIE_PARTICIPANT, obtenirSondage, sondagesDejaRepondus } from "@/lib/sondages";
import FormulaireSondage from "./FormulaireSondage";
import MessageFin from "./MessageFin";

export const metadata: Metadata = {
  title: "Manehoa hevitra — VFM 105",
};

export default async function SondagePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || !isDatabaseConfigured()) notFound();
  const sondage = await obtenirSondage(id);
  // Sondage désactivé : invisible pour le public.
  if (!sondage || !sondage.actif) notFound();
  const participant = (await cookies()).get(COOKIE_PARTICIPANT)?.value;
  const dejaRepondu = (await sondagesDejaRepondus(participant)).has(id);

  return (
    <PublicShell cardClassName="max-w-2xl">
      <Link href="/sondages" className="text-sm font-medium text-vfm-vert-dark hover:underline">
        ← Lohahevitra rehetra
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-vfm-marine sm:text-3xl">{sondage.titre}</h1>
      {sondage.description && (
        <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 sm:text-base">{sondage.description}</p>
      )}

      {dejaRepondu ? (
        <MessageFin titre="Efa namaly ity fanadihadiana ity ianao." texte="Misaotra nanome ny hevitrao!" />
      ) : (
        <FormulaireSondage sondageId={sondage.id} questions={sondage.questions} />
      )}
    </PublicShell>
  );
}
