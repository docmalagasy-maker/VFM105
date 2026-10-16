import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { changerStatutPersonne } from "@/lib/personnes";

const schema = z.object({
  statut: z.enum(["recu", "en_cours", "informations_demandees", "accepte", "refuse", "archive"]),
});

/** Statut d'un dossier de personne : super-administrateur seulement. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  try {
    await exigerSession(true);
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });
  const { reference } = await params;
  return (await changerStatutPersonne(reference, parsed.data.statut))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
}
