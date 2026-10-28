import { notFound, redirect } from "next/navigation";
import CarteQr from "@/components/CarteQr";
import { obtenirSession } from "@/lib/auth";
import { obtenirDossierParReference } from "@/lib/repository";
import { SMS_ACTIF } from "@/lib/sms";
import { libelleEmailConfirmation } from "../libelles";
import DossierActions from "./DossierActions";
import EnteteAdmin from "../EnteteAdmin";

export default async function DossierAdminPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const session = await obtenirSession();
  if (!session) redirect("/admin/connexion");
  const { reference } = await params;
  const dossier = await obtenirDossierParReference(reference);
  // Administrateur de district : uniquement les dossiers de son district, en lecture seule
  if (!dossier || (session.role === "district" && dossier.association.district !== session.district)) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <EnteteAdmin session={session} section="liste" />
      <div className="mt-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-zinc-900">{dossier.reference}</h1>
      <p className="text-sm text-zinc-500">
        Déposé le {new Date(dossier.dateDepot).toLocaleString("fr-FR")}
      </p>

      <dl className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        <Ligne label="Association">{dossier.association.nom}</Ligne>
        <Ligne label="Adresse">{dossier.association.adresse}</Ligne>
        {dossier.association.district && (
          <Ligne label="District">{dossier.association.district}</Ligne>
        )}
        {dossier.association.commune && <Ligne label="Commune">{dossier.association.commune}</Ligne>}
        {dossier.association.fokontany && <Ligne label="Fokontany">{dossier.association.fokontany}</Ligne>}
        <Ligne label="Activité">{dossier.association.activite}</Ligne>
        <Ligne label="Nombre de membres">{dossier.association.nombreMembres}</Ligne>
        <Ligne label="Responsables">
          <ul className="list-inside list-disc">
            {dossier.responsables.map((r, i) => (
              <li key={i}>
                {r.prenom} {r.nom}
              </li>
            ))}
          </ul>
        </Ligne>
        <Ligne label="Téléphone">{dossier.coordonnees.telephone}</Ligne>
        {dossier.coordonnees.email && <Ligne label="E-mail">{dossier.coordonnees.email}</Ligne>}
        <Ligne label="Description du projet">
          <span className="whitespace-pre-wrap">{dossier.description}</span>
        </Ligne>
        <Ligne label="Pièces jointes">
          {dossier.pieces.length === 0 ? (
            "Aucune"
          ) : (
            <ul className="list-inside list-disc">
              {dossier.pieces.map((p, i) => (
                <li key={i}>
                  <a
                    href={`/api/admin/pieces/${p.pathname}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {p.nom}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Ligne>
      </dl>

      {session.role === "super" && (
        <DossierActions
          reference={dossier.reference}
          statut={dossier.statut}
          statutSms={dossier.statutSms}
          smsActif={SMS_ACTIF}
          emailConfirmation={libelleEmailConfirmation(dossier)}
        />
      )}

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-base font-semibold text-zinc-900">QR code Tafa &amp; Dinika</h2>
        <p className="mb-4 text-sm text-zinc-500">À transmettre au participant s&apos;il n&apos;a pas pu l&apos;enregistrer.</p>
        <CarteQr
          infos={{
            jeton: dossier.qrJeton,
            reference: dossier.reference,
            nom: dossier.responsables[0]?.nom ?? "",
            prenom: dossier.responsables[0]?.prenom ?? "",
            telephone: dossier.coordonnees.telephone,
            association: dossier.association.nom,
          }}
        />
      </section>
      </div>
    </div>
  );
}

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
      <dt className="w-full shrink-0 text-sm font-medium text-zinc-500 sm:w-48">{label}</dt>
      <dd className="text-sm text-zinc-900">{children}</dd>
    </div>
  );
}
