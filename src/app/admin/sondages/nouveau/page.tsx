import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenirSession } from "@/lib/auth";
import EditeurSondage from "../EditeurSondage";
import EnteteAdmin from "../../EnteteAdmin";

export default async function NouveauSondagePage() {
  const session = await obtenirSession();
  if (!session) redirect("/admin/connexion");
  if (session.role !== "super") notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <EnteteAdmin session={session} section="sondages" />
      <div className="mt-6 max-w-3xl">
      <Link href="/admin?vue=sondages" className="text-sm text-zinc-500 hover:underline">
        ← Sondages
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Nouveau sondage</h1>
      <EditeurSondage />
      </div>
    </div>
  );
}
