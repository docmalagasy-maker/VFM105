import { notFound } from "next/navigation";
import { obtenirDossierParReference } from "@/lib/repository";
import DossierActions from "./DossierActions";

export default async function DossierAdminPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const dossier = await obtenirDossierParReference(reference);
  if (!dossier) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">{dossier.reference}</h1>
      <p className="text-sm text-zinc-500">
        Déposé le {new Date(dossier.dateDepot).toLocaleString("fr-FR")}
      </p>

      <dl className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        <Ligne label="Association">{dossier.association.nom}</Ligne>
        <Ligne label="Adresse">{dossier.association.adresse}</Ligne>
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
                  <a href={p.url} target="_blank" rel="noreferrer" className="underline">
                    {p.nom}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Ligne>
      </dl>

      <DossierActions reference={dossier.reference} statut={dossier.statut} statutSms={dossier.statutSms} />
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
