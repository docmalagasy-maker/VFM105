import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import {
  COOKIE_PARTICIPANT,
  empreinteIp,
  enregistrerParticipation,
  nouveauParticipant,
  obtenirSondage,
} from "@/lib/sondages";
import { participationSchema, verifierReponses } from "@/lib/sondages-modele";

const UN_AN_S = 365 * 24 * 60 * 60;

/** Participation publique à un sondage actif : un vote par navigateur. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ erreur: "Mbola tsy vonona ny tolotra. Andramo indray any aoriana azafady." }, { status: 503 });
  }
  const id = Number((await params).id);
  const sondage = Number.isInteger(id) ? await obtenirSondage(id) : null;
  if (!sondage || !sondage.actif) {
    return NextResponse.json({ erreur: "Tsy misokatra intsony ity fanadihadiana ity." }, { status: 404 });
  }

  const parsed = participationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ erreur: parsed.error.issues[0]?.message ?? "Fangatahana tsy manara-penitra." }, { status: 400 });
  }
  const { sexe, district, reponses, site } = parsed.data;
  // Champ piège rempli : robot. Réponse « réussie » sans rien enregistrer.
  if (site) return NextResponse.json({ ok: true });

  const controle = verifierReponses(sondage.questions, reponses);
  if (!controle.ok) return NextResponse.json({ erreur: controle.erreur }, { status: 400 });

  const participantExistant = request.cookies.get(COOKIE_PARTICIPANT)?.value;
  const participant =
    participantExistant && /^[0-9a-f-]{36}$/.test(participantExistant) ? participantExistant : nouveauParticipant();
  // Derrière Traefik : première adresse de X-Forwarded-For = celle du visiteur.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "inconnue";

  try {
    const resultat = await enregistrerParticipation({
      sondageId: id,
      sexe,
      district,
      reponses: controle.reponses,
      participant,
      ipEmpreinte: empreinteIp(ip),
    });
    const reponse =
      resultat === "ok"
        ? NextResponse.json({ ok: true }, { status: 201 })
        : resultat === "deja"
          ? NextResponse.json({ erreur: "Efa namaly ity fanadihadiana ity ianao." }, { status: 409 })
          : NextResponse.json(
              { erreur: "Be loatra ny valiny avy amin'ity tambajotra ity. Andramo indray any aoriana." },
              { status: 429 }
            );
    if (participant !== participantExistant) {
      reponse.cookies.set(COOKIE_PARTICIPANT, participant, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: UN_AN_S,
      });
    }
    return reponse;
  } catch (err) {
    console.error("Erreur participation sondage", err);
    return NextResponse.json({ erreur: "Tsy lasa ny valinao. Andramo indray azafady." }, { status: 500 });
  }
}
