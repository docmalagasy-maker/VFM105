import crypto from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getPool } from "@/lib/db";
import { COOKIE_SESSION, DUREE_SESSION_S, lireJeton, type Session } from "@/lib/jeton";
import { verifierSchema } from "@/lib/schema";

export { COOKIE_SESSION, lireJeton, signerSession, type Session } from "@/lib/jeton";

const scrypt = promisify(crypto.scrypt) as (mdp: string, sel: Buffer, longueur: number) => Promise<Buffer>;

// ---------- Mots de passe ----------

export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  const sel = crypto.randomBytes(16);
  const empreinte = await scrypt(motDePasse, sel, 64);
  return `scrypt$${sel.toString("base64")}$${empreinte.toString("base64")}`;
}

export async function verifierMotDePasse(motDePasse: string, stocke: string): Promise<boolean> {
  const [algo, sel, empreinte] = stocke.split("$");
  if (algo !== "scrypt" || !sel || !empreinte) return false;
  const attendu = Buffer.from(empreinte, "base64");
  const calcule = await scrypt(motDePasse, Buffer.from(sel, "base64"), attendu.length);
  return crypto.timingSafeEqual(attendu, calcule);
}

/** Comparaison à durée constante (identifiants du super-administrateur). */
export function egalConstant(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const optionsCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DUREE_SESSION_S,
};

/**
 * Session de la requête en cours. Pour un administrateur de district, le
 * compte est revérifié en base : une désactivation prend effet immédiatement.
 */
export async function obtenirSession(): Promise<Session | null> {
  const session = lireJeton((await cookies()).get(COOKIE_SESSION)?.value);
  if (!session || session.role === "super") return session;
  await verifierSchema();
  const r = await getPool().query<{ district: string }>(
    `SELECT district FROM administrateurs WHERE id = $1 AND statut = 'valide'`,
    [session.id]
  );
  if (r.rows.length === 0) return null;
  return { ...session, district: r.rows[0].district };
}

/** District auquel limiter les données (undefined = tous, pour le super-administrateur). */
export function districtAutorise(session: Session): string | undefined {
  return session.role === "district" ? session.district : undefined;
}

export class AccesRefuse extends Error {
  constructor(public statut: 401 | 403) {
    super(statut === 401 ? "Connexion requise." : "Accès réservé.");
  }
}

/** Pour les routes API : exige une session, éventuellement le rôle super-administrateur. */
export async function exigerSession(superSeulement = false): Promise<Session> {
  const session = await obtenirSession();
  if (!session) throw new AccesRefuse(401);
  if (superSeulement && session.role !== "super") throw new AccesRefuse(403);
  return session;
}

export function reponseAccesRefuse(err: unknown): Response {
  if (err instanceof AccesRefuse) {
    return Response.json({ erreur: err.message }, { status: err.statut });
  }
  throw err;
}

// ---------- Limitation des tentatives de connexion ----------

const tentatives = new Map<string, { nombre: number; jusqua: number }>();
const MAX_TENTATIVES = 8;
const FENETRE_MS = 15 * 60 * 1000;

export function connexionBloquee(cle: string): boolean {
  const t = tentatives.get(cle);
  return !!t && t.jusqua > Date.now() && t.nombre >= MAX_TENTATIVES;
}

export function noterEchecConnexion(cle: string): void {
  const t = tentatives.get(cle);
  if (!t || t.jusqua < Date.now()) tentatives.set(cle, { nombre: 1, jusqua: Date.now() + FENETRE_MS });
  else t.nombre += 1;
}

export function effacerEchecs(cle: string): void {
  tentatives.delete(cle);
}
