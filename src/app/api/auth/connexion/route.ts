import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_SESSION,
  connexionBloquee,
  effacerEchecs,
  egalConstant,
  noterEchecConnexion,
  optionsCookie,
  signerSession,
  verifierMotDePasse,
  type Session,
} from "@/lib/auth";
import { getPool, isDatabaseConfigured } from "@/lib/db";
import { verifierSchema } from "@/lib/schema";

export async function POST(request: NextRequest) {
  const corps = await request.json().catch(() => null);
  const identifiant = String(corps?.identifiant ?? "").trim();
  const motDePasse = String(corps?.motDePasse ?? "");
  if (!identifiant || !motDePasse) {
    return NextResponse.json({ erreur: "Identifiant et mot de passe requis." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const cle = `${ip}|${identifiant.toLowerCase()}`;
  if (connexionBloquee(cle)) {
    return NextResponse.json(
      { erreur: "Trop de tentatives. Réessayez dans 15 minutes." },
      { status: 429 }
    );
  }

  let session: Session | null = null;
  const superUser = process.env.ADMIN_USER ?? "";
  const superMdp = process.env.ADMIN_PASSWORD ?? "";
  if (superUser && superMdp && egalConstant(identifiant, superUser)) {
    if (egalConstant(motDePasse, superMdp)) session = { role: "super", nom: "Super-administrateur" };
  } else if (isDatabaseConfigured()) {
    await verifierSchema();
    const r = await getPool().query<{
      id: number;
      prenom: string;
      nom: string;
      district: string;
      mot_de_passe: string;
      statut: string;
    }>(
      `SELECT id, prenom, nom, district, mot_de_passe, statut FROM administrateurs
       WHERE lower(identifiant) = lower($1) ORDER BY id DESC LIMIT 1`,
      [identifiant]
    );
    const admin = r.rows[0];
    if (admin && (await verifierMotDePasse(motDePasse, admin.mot_de_passe))) {
      if (admin.statut !== "valide") {
        return NextResponse.json(
          {
            erreur:
              admin.statut === "en_attente"
                ? "Votre compte attend la validation du super-administrateur."
                : "Ce compte n'est pas actif.",
          },
          { status: 403 }
        );
      }
      session = { role: "district", id: admin.id, district: admin.district, nom: `${admin.prenom} ${admin.nom}` };
    }
  }

  if (!session) {
    noterEchecConnexion(cle);
    return NextResponse.json({ erreur: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  }

  effacerEchecs(cle);
  const reponse = NextResponse.json({ ok: true, role: session.role });
  reponse.cookies.set(COOKIE_SESSION, signerSession(session), optionsCookie);
  return reponse;
}
