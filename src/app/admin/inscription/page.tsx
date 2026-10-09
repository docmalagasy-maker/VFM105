import type { Metadata } from "next";
import { connection } from "next/server";
import { districtsOccupes } from "@/lib/administrateurs";
import { isDatabaseConfigured } from "@/lib/db";
import FormulaireInscription from "./FormulaireInscription";

export const metadata: Metadata = { title: "Demande d'accès administrateur — VFM" };

export default async function InscriptionPage() {
  await connection();
  const occupes = isDatabaseConfigured() ? await districtsOccupes() : [];
  return (
    <div className="flex min-h-dvh items-start justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Demande d&apos;accès administrateur de district</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Un seul administrateur par district. Votre demande sera examinée par le
          super-administrateur ; vous pourrez vous connecter dès sa validation.
        </p>
        <FormulaireInscription districtsOccupes={occupes} />
      </div>
    </div>
  );
}
