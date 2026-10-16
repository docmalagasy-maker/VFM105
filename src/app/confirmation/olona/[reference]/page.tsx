import Link from "next/link";
import { notFound } from "next/navigation";
import PublicShell from "@/components/PublicShell";
import { isDatabaseConfigured } from "@/lib/db";
import { obtenirPersonne } from "@/lib/personnes";
import { estReferencePersonne } from "@/lib/personnes-modele";

/** Remerciement après le dépôt d'un dossier de personne (référence VFM-P-…). */
export default async function ConfirmationPersonnePage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!estReferencePersonne(reference) || !isDatabaseConfigured()) notFound();
  const dossier = await obtenirPersonne(reference);
  if (!dossier) notFound();

  return (
    <PublicShell cardClassName="max-w-xl">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-vfm-marine sm:text-2xl">Misaotra anao ny VFM {dossier.district}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Voaray ny dosie-nao, {dossier.prenom} {dossier.nom}.
        </p>
        <p className="mt-4 text-sm text-zinc-600">Laharana</p>
        <p className="text-2xl font-bold tracking-wide text-vfm-marine sm:text-3xl">{dossier.reference}</p>
        <p className="mt-4 text-sm text-zinc-600">
          {dossier.emailConfirmation === "envoye" && dossier.email
            ? `Nalefa tany amin'ny ${dossier.email} ny mailaka fanamarinana misy ity laharana ity.`
            : "Tehirizo ity laharana ity."}
        </p>
        <Link href="/" className="mt-8 inline-block text-sm font-medium text-vfm-marine underline">
          Hiverina any amin&apos;ny fandraisana
        </Link>
      </div>
    </PublicShell>
  );
}
