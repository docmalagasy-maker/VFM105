import { NextRequest, NextResponse } from "next/server";
import { changerStatutDossier } from "@/lib/repository";
import { z } from "zod";

const schema = z.object({
  statut: z.enum([
    "recu",
    "en_cours",
    "informations_demandees",
    "accepte",
    "refuse",
    "archive",
  ]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });
  }
  await changerStatutDossier(reference, parsed.data.statut);
  return NextResponse.json({ ok: true });
}
