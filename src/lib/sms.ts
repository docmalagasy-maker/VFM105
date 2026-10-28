import { getPool } from "@/lib/db";
import type { StatutSms } from "@/lib/types";

/**
 * Fonctionnalité SMS de confirmation (passerelle Android du responsable,
 * voir android-sms-gateway/README.md) — DÉSACTIVÉE depuis le 15 octobre 2026,
 * remplacée par l'e-mail de confirmation (src/lib/confirmation.ts).
 *
 * Tout le code est conservé ici et dans les routes qui l'utilisent :
 * - src/app/api/sms-gateway/pending/route.ts et report/route.ts (passerelle) ;
 * - src/app/api/admin/dossiers/[reference]/resend-sms/route.ts (renvoi admin) ;
 * - bouton « Renvoyer le SMS » de src/app/admin/[reference]/DossierActions.tsx.
 *
 * Réactivation : variable d'environnement SMS_ACTIF=true dans Coolify, puis
 * Deploy, et redémarrer la passerelle dans l'application Android. Les dossiers
 * déposés pendant la désactivation (statut SMS « desactive ») ne recevront
 * pas de SMS rétroactivement.
 */
export const SMS_ACTIF = process.env.SMS_ACTIF === "true";

/** Statut SMS donné à un nouveau dossier. */
export function statutSmsInitial(): StatutSms {
  return SMS_ACTIF ? "a_envoyer" : "desactive";
}

// Texte en caractères simples (sans accents) : un seul SMS de 160 caractères maximum.
export function messageConfirmation(reference: string): string {
  return `VFM 105 : Voaray ny antontan-taratasinao. Laharana : ${reference}. Misaotra.`;
}

export async function marquerStatutSms(reference: string, statutSms: StatutSms): Promise<void> {
  await getPool().query(`UPDATE dossiers SET statut_sms = $1, sms_date = now() WHERE reference = $2`, [
    statutSms,
    reference,
  ]);
}

/**
 * Remet le SMS en file d'attente : la passerelle Android le relèvera à son
 * prochain sondage. Utilisé pour le renvoi manuel depuis l'administration.
 */
export async function remettreSmsEnAttente(reference: string): Promise<void> {
  const r = await getPool().query(
    `UPDATE dossiers SET statut_sms = 'a_envoyer', sms_date = now() WHERE reference = $1`,
    [reference]
  );
  if (!r.rowCount) throw new Error("Dossier introuvable.");
}

export interface SmsEnAttente {
  reference: string;
  telephone: string;
}

export async function listerSmsEnAttente(limite = 20): Promise<SmsEnAttente[]> {
  const result = await getPool().query<SmsEnAttente>(
    `SELECT reference, telephone FROM dossiers
     WHERE statut_sms = 'a_envoyer'
     ORDER BY date_depot ASC
     LIMIT $1`,
    [limite]
  );
  return result.rows;
}
