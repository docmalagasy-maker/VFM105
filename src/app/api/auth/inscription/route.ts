import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { creerDemande } from "@/lib/administrateurs";
import { isDatabaseConfigured } from "@/lib/db";
import { TOUS_LES_DISTRICTS } from "@/lib/districts";
import { validateTelephoneMadagascar } from "@/lib/validation";

const schema = z.object({
  nom: z.string().trim().min(1, "Le nom est obligatoire.").max(80),
  prenom: z.string().trim().min(1, "Le prénom est obligatoire.").max(80),
  telephone: z
    .string()
    .refine((v) => validateTelephoneMadagascar(v).valide, "Le numéro de téléphone semble incorrect."),
  district: z.string().refine((v) => TOUS_LES_DISTRICTS.includes(v), "Choisissez votre district."),
  identifiant: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._-]{3,40}$/, "Identifiant : 3 à 40 caractères (lettres, chiffres, . _ -)."),
  motDePasse: z.string().min(10, "Le mot de passe doit contenir au moins 10 caractères.").max(200),
  // Champ invisible : rempli uniquement par les robots
  site: z.string().max(0).optional(),
});

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ erreur: "Service indisponible." }, { status: 503 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ erreur: parsed.error.issues[0]?.message ?? "Formulaire invalide." }, { status: 400 });
  }
  const d = parsed.data;
  if (process.env.ADMIN_USER && d.identifiant.toLowerCase() === process.env.ADMIN_USER.toLowerCase()) {
    return NextResponse.json({ erreur: "Cet identifiant est déjà utilisé." }, { status: 409 });
  }

  const resultat = await creerDemande(
    {
      nom: d.nom,
      prenom: d.prenom,
      telephone: validateTelephoneMadagascar(d.telephone).formate ?? d.telephone,
      district: d.district,
      identifiant: d.identifiant,
      motDePasse: d.motDePasse,
    },
    process.env.SITE_URL || "https://vfm.0550.site"
  );
  if (!resultat.ok) return NextResponse.json({ erreur: resultat.erreur }, { status: 409 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
