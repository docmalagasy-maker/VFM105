import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenirSession } from "@/lib/auth";
import { obtenirPersonne } from "@/lib/personnes";
import EnteteAdmin from "../../EnteteAdmin";
import { LIBELLES_STATUT } from "../../libelles";
import { age, dateNaissanceFr, libelleEmailPersonne } from "../../PersonnesVue";
import BoutonSupprimerPersonne from "../BoutonSupprimerPersonne";
import StatutPersonne from "../StatutPersonne";

/** Fiche d'un dossier de personne. Administrateur de district : son district, en lecture seule. */
export default async function PersonneAdminPage({ params }: { params: Promise<{ reference: string }> }) {
  const session = await obtenirSession();
  if (!session) redirect("/admin/connexion");
  const { reference } = await params;
  const p = await obtenirPersonne(reference);
  if (!p || (session.role === "district" && p.district !== session.district)) notFound();
  const estSuper = session.role === "super";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <EnteteAdmin session={session} section="personnes" />
      <div className="mt-6 max-w-3xl">
        <Link href="/admin?vue=personnes" className="text-sm text-zinc-500 hover:underline">
          ← Personnes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{p.reference}</h1>
        <p className="text-sm text-zinc-500">
          Dossier de personne · déposé le {new Date(p.dateDepot).toLocaleString("fr-FR")} ·{" "}
          {LIBELLES_STATUT[p.statut] ?? p.statut}
        </p>

        <dl className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          <Ligne label="Nom">{p.nom}</Ligne>
          <Ligne label="Prénom">{p.prenom}</Ligne>
          {/* Date de naissance et CV : plus demandés, affichés seulement pour les anciens dossiers */}
          {p.dateNaissance && (
            <Ligne label="Date de naissance">
              {dateNaissanceFr(p.dateNaissance)} ({age(p.dateNaissance)} ans)
            </Ligne>
          )}
          <Ligne label="District">{p.district}</Ligne>
          <Ligne label="Commune">{p.commune || "—"}</Ligne>
          <Ligne label="Fokontany">{p.fokontany || "—"}</Ligne>
          <Ligne label="Activité actuelle">{p.activite}</Ligne>
          <Ligne label="Description de l'activité">
            <span className="whitespace-pre-wrap">{p.descriptionActivite}</span>
          </Ligne>
          <Ligne label="Projet personnel">
            <span className="whitespace-pre-wrap">{p.projet}</span>
          </Ligne>
          <Ligne label="Téléphone">
            <a href={`tel:${p.telephone.replace(/\s/g, "")}`} className="underline">
              {p.telephone}
            </a>
          </Ligne>
          <Ligne label="E-mail">
            {p.email ? (
              <a href={`mailto:${p.email}`} className="underline">
                {p.email}
              </a>
            ) : (
              "—"
            )}
          </Ligne>
          {p.cv && (
            <Ligne label="CV">
              <a href={`/api/admin/pieces/${p.cv.pathname}`} target="_blank" rel="noopener noreferrer" className="underline">
                {p.cv.nom}
              </a>
            </Ligne>
          )}
          <Ligne label="E-mail de confirmation">{libelleEmailPersonne(p)}</Ligne>
        </dl>

        {estSuper && (
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <StatutPersonne reference={p.reference} statut={p.statut} />
            <div>
              <BoutonSupprimerPersonne reference={p.reference} nom={`${p.prenom} ${p.nom}`} apres="/admin?vue=personnes" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
      <dt className="w-48 shrink-0 text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{children}</dd>
    </div>
  );
}
