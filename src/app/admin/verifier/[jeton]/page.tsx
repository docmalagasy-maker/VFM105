import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenirSession } from "@/lib/auth";
import { obtenirPersonneParQrJeton } from "@/lib/personnes";
import { obtenirDossierParQrJeton } from "@/lib/repository";
import EnteteAdmin from "../../EnteteAdmin";
import { LIBELLES_STATUT } from "../../libelles";

export const metadata: Metadata = { title: "Vérification QR code — Administration VFM 105" };

/**
 * Page ouverte en scannant le QR code d'un participant aux Tafa & Dinika.
 * Réservée aux administrateurs connectés ; un administrateur de district ne
 * voit le détail que des inscriptions de son district.
 */
export default async function VerifierQrPage({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const session = await obtenirSession();
  if (!session) redirect(`/admin/connexion?suite=${encodeURIComponent(`/admin/verifier/${jeton}`)}`);

  // Code au format attendu uniquement (32 caractères hexadécimaux)
  const valide = /^[0-9a-f]{32}$/.test(jeton);
  const dossier = valide ? await obtenirDossierParQrJeton(jeton) : null;
  const personne = valide && !dossier ? await obtenirPersonneParQrJeton(jeton) : null;

  const inscription = dossier
    ? {
        type: "Association",
        reference: dossier.reference,
        nom: `${dossier.responsables[0]?.prenom ?? ""} ${dossier.responsables[0]?.nom ?? ""}`.trim(),
        association: dossier.association.nom,
        telephone: dossier.coordonnees.telephone,
        district: dossier.association.district,
        commune: dossier.association.commune,
        fokontany: dossier.association.fokontany,
        dateDepot: dossier.dateDepot,
        statut: dossier.statut,
        fiche: `/admin/${dossier.reference}`,
      }
    : personne
      ? {
          type: "Personne",
          reference: personne.reference,
          nom: `${personne.prenom} ${personne.nom}`,
          association: undefined,
          telephone: personne.telephone,
          district: personne.district,
          commune: personne.commune,
          fokontany: personne.fokontany,
          dateDepot: personne.dateDepot,
          statut: personne.statut,
          fiche: `/admin/olona/${personne.reference}`,
        }
      : null;
  const horsDistrict = inscription && session.role === "district" && inscription.district !== session.district;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <EnteteAdmin session={session} titre="Vérification QR code" />
      <div className="mx-auto mt-8 max-w-xl">
        {!inscription && (
          <Bandeau couleur="rouge" titre="QR code inconnu">
            Aucune inscription ne correspond à ce QR code.
          </Bandeau>
        )}
        {horsDistrict && (
          <Bandeau couleur="orange" titre="Inscription valide — autre district">
            Ce participant est inscrit dans le district {inscription.district}. Le détail est réservé à
            l&apos;administrateur de ce district ou au super-administrateur.
          </Bandeau>
        )}
        {inscription && !horsDistrict && (
          <>
            <Bandeau couleur="vert" titre="Inscription valide">
              {inscription.type === "Association" ? "Inscription au nom d'une association" : "Inscription individuelle"} ·{" "}
              {inscription.reference}
            </Bandeau>
            <dl className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
              <Ligne label="Nom et prénom">
                <span className="text-lg font-semibold">{inscription.nom || "—"}</span>
              </Ligne>
              {inscription.association && <Ligne label="Association">{inscription.association}</Ligne>}
              <Ligne label="Téléphone">{inscription.telephone}</Ligne>
              <Ligne label="District">{inscription.district || "—"}</Ligne>
              <Ligne label="Commune">{inscription.commune || "—"}</Ligne>
              {inscription.fokontany && <Ligne label="Fokontany">{inscription.fokontany}</Ligne>}
              <Ligne label="Inscrit le">{new Date(inscription.dateDepot).toLocaleString("fr-FR")}</Ligne>
              <Ligne label="Statut du dossier">{LIBELLES_STATUT[inscription.statut] ?? inscription.statut}</Ligne>
            </dl>
            <Link href={inscription.fiche} className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
              Ouvrir la fiche complète
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

const COULEURS = {
  vert: "border-green-300 bg-green-50 text-green-900",
  orange: "border-amber-300 bg-amber-50 text-amber-900",
  rouge: "border-red-300 bg-red-50 text-red-900",
};

function Bandeau({
  couleur,
  titre,
  children,
}: {
  couleur: keyof typeof COULEURS;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border-2 px-5 py-4 ${COULEURS[couleur]}`}>
      <p className="text-xl font-bold">{titre}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{children}</dd>
    </div>
  );
}
