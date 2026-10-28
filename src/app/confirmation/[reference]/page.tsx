import Link from "next/link";
import { notFound } from "next/navigation";
import CarteQr from "@/components/CarteQr";
import { obtenirDossierParReference } from "@/lib/repository";
import PublicShell from "@/components/PublicShell";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { reference } = await params;
  const { c } = await searchParams;
  const dossier = await obtenirDossierParReference(reference);

  if (!dossier) notFound();
  // Carte QR (nom, téléphone…) seulement avec le code secret reçu à l'envoi du formulaire
  const responsable = dossier.responsables[0];
  const carte = !!c && c === dossier.qrJeton;

  return (
    <PublicShell cardClassName="max-w-xl">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-vfm-marine sm:text-2xl">
          {/* Dossiers déposés avant l'ajout du district : « VFM 105 » seul */}
          Misaotra anao ny VFM 105{dossier.association.district ? ` ${dossier.association.district}` : ""}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Voaray ny momba anao sy ny fikambananao.
        </p>
        <p className="mt-4 text-sm text-zinc-600">Laharana</p>
        <p className="text-2xl font-bold tracking-wide text-vfm-marine sm:text-3xl">
          {dossier.reference}
        </p>
        <p className="mt-4 text-sm text-zinc-600">
          {/* Le SMS est désactivé (src/lib/sms.ts) : seul l'e-mail, s'il est parti, est annoncé */}
          {/* Adresse e-mail seulement pour le déposant (code secret dans l'adresse) */}
          {carte && dossier.emailConfirmation === "envoye" && dossier.coordonnees.email
            ? `Nalefa tany amin'ny ${dossier.coordonnees.email} ny mailaka fanamarinana misy ity laharana ity.`
            : "Tehirizo ity laharana ity."}
        </p>
        {carte && (
          <div className="mt-8 border-t border-vfm-beige-bord pt-8">
            <p className="mb-4 text-sm font-medium text-vfm-marine">
              Alaivo sy tehirizo ity QR code ity : hasehonao amin&apos;ny fidirana amin&apos;ny Tafa &amp; Dinika izy.
            </p>
            <CarteQr
              infos={{
                jeton: dossier.qrJeton,
                reference: dossier.reference,
                nom: responsable?.nom ?? "",
                prenom: responsable?.prenom ?? "",
                telephone: dossier.coordonnees.telephone,
                association: dossier.association.nom,
              }}
            />
          </div>
        )}
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
