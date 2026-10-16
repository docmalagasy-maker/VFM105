import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenirSession } from "@/lib/auth";
import { nombreReponses, obtenirSondage } from "@/lib/sondages";
import EditeurSondage from "../../EditeurSondage";
import EnteteAdmin from "../../../EnteteAdmin";

export default async function ModifierSondagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await obtenirSession();
  if (!session) redirect("/admin/connexion");
  if (session.role !== "super") notFound();
  const id = Number((await params).id);
  const sondage = Number.isInteger(id) ? await obtenirSondage(id) : null;
  if (!sondage) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <EnteteAdmin session={session} section="sondages" />
      <div className="mt-6 max-w-3xl">
      <Link href={`/admin/sondages/${id}`} className="text-sm text-zinc-500 hover:underline">
        ← Résultats du sondage
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Modifier le sondage</h1>
      <EditeurSondage initial={sondage} verrouille={(await nombreReponses(id)) > 0} />
      </div>
    </div>
  );
}
