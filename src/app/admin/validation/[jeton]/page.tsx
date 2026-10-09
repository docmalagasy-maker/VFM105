import Link from "next/link";
import { redirect } from "next/navigation";
import { adminParJeton } from "@/lib/administrateurs";
import { obtenirSession } from "@/lib/auth";
import ActionsAdministrateur from "../../ActionsAdministrateur";

/**
 * Lien reçu par e-mail par le super-administrateur. Le jeton seul ne suffit
 * pas : il faut aussi être connecté en super-administrateur.
 */
export default async function ValidationPage({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const session = await obtenirSession();
  if (!session) redirect(`/admin/connexion?suite=${encodeURIComponent(`/admin/validation/${jeton}`)}`);
  if (session.role !== "super") {
    return <Message texte="Cette page est réservée au super-administrateur." />;
  }

  const admin = await adminParJeton(jeton);
  if (!admin) {
    return <Message texte="Cette demande a déjà été traitée ou le lien n'est plus valable." />;
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">Demande d&apos;administrateur de district</h1>
      <dl className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white text-sm">
        {[
          ["Nom", `${admin.prenom} ${admin.nom}`],
          ["Téléphone", admin.telephone],
          ["District", admin.district],
          ["Identifiant", admin.identifiant],
          ["Demande du", new Date(admin.creeLe).toLocaleString("fr-FR")],
        ].map(([l, v]) => (
          <div key={l} className="flex gap-4 px-4 py-2.5">
            <dt className="w-28 shrink-0 text-zinc-500">{l}</dt>
            <dd className="text-zinc-900">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4">
        <ActionsAdministrateur id={admin.id} statut={admin.statut} apres="/admin?vue=admins" />
      </div>
    </div>
  );
}

function Message({ texte }: { texte: string }) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 text-sm text-zinc-600">
      <p>{texte}</p>
      <Link href="/admin?vue=admins" className="mt-4 inline-block font-medium text-zinc-900 underline">
        Retour à l&apos;administration
      </Link>
    </div>
  );
}
