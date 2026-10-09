import crypto from "node:crypto";

export const COOKIE_SESSION = "vfm_admin";
export const DUREE_SESSION_S = 12 * 60 * 60; // 12 heures

/**
 * Super-administrateur : identifiants ADMIN_USER / ADMIN_PASSWORD (Coolify),
 * accès à tout. Administrateur de district : compte validé par le
 * super-administrateur, accès limité aux données de son district.
 */
export type Session =
  | { role: "super"; nom: string }
  | { role: "district"; id: number; district: string; nom: string };

function cleSession(): Buffer {
  // SESSION_SECRET conseillé ; à défaut, clé dérivée de secrets déjà présents.
  const base =
    process.env.SESSION_SECRET ||
    `vfm-session|${process.env.ADMIN_PASSWORD ?? ""}|${process.env.DATABASE_URL ?? ""}`;
  return crypto.createHash("sha256").update(base).digest();
}

type Charge = Session & { exp: number };

export function signerSession(session: Session): string {
  const charge: Charge = { ...session, exp: Math.floor(Date.now() / 1000) + DUREE_SESSION_S };
  const corps = Buffer.from(JSON.stringify(charge)).toString("base64url");
  const signature = crypto.createHmac("sha256", cleSession()).update(corps).digest("base64url");
  return `${corps}.${signature}`;
}

/** Vérifie la signature et l'expiration (utilisé aussi par src/proxy.ts). */
export function lireJeton(jeton: string | undefined): Session | null {
  if (!jeton) return null;
  const [corps, signature] = jeton.split(".");
  if (!corps || !signature) return null;
  const attendue = crypto.createHmac("sha256", cleSession()).update(corps).digest();
  const recue = Buffer.from(signature, "base64url");
  if (recue.length !== attendue.length || !crypto.timingSafeEqual(recue, attendue)) return null;
  try {
    const charge = JSON.parse(Buffer.from(corps, "base64url").toString()) as Charge;
    if (charge.exp < Date.now() / 1000) return null;
    return charge.role === "super"
      ? { role: "super", nom: charge.nom }
      : { role: "district", id: charge.id, district: charge.district, nom: charge.nom };
  } catch {
    return null;
  }
}
