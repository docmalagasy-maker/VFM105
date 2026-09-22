import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenirDossierParReference } from "@/lib/repository";
import PublicShell from "@/components/PublicShell";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const dossier = await obtenirDossierParReference(reference);

  if (!dossier) notFound();

  return (
    <PublicShell cardClassName="max-w-xl">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-vfm-marine sm:text-2xl">
          Misaotra anao ny VFM Ambohidratrimo
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Voaray ny momba anao sy ny fikambananao.
        </p>
        <p className="mt-4 text-sm text-zinc-600">Laharana</p>
        <p className="text-2xl font-bold tracking-wide text-vfm-marine sm:text-3xl">
          {dossier.reference}
        </p>
        <p className="mt-4 text-sm text-zinc-600">
          {dossier.statutSms === "envoye" &&
            `Nalefa tamin'ny ${dossier.coordonnees.telephone} ny SMS fanamarinana.`}
          {dossier.statutSms === "a_envoyer" &&
            "Handray SMS avy eo hanamarina izany ianao."}
          {dossier.statutSms === "echoue" &&
            "Voarakitra ny fikambananao, saingy tsy voalefa ny SMS fanamarinana amin'izao fotoana izao."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-vfm-marine underline"
        >
          Hiverina any amin&apos;ny fandraisana
        </Link>
      </div>
    </PublicShell>
  );
}
