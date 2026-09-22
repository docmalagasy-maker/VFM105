import crypto from "node:crypto";

export interface EnvoiSmsResultat {
  succes: boolean;
  erreur?: string;
}

export function messageConfirmation(reference: string): string {
  return `VFM 105 : Votre dossier a bien été reçu. Référence : ${reference}. Merci.`;
}

/**
 * Relaie une demande d'envoi de SMS vers la passerelle Android du responsable
 * (application installée sur son téléphone, qui envoie via sa carte SIM).
 *
 * Configuration requise (variables d'environnement Vercel) :
 * - SMS_GATEWAY_URL    : URL exposée par la passerelle Android (ou son relais).
 * - SMS_GATEWAY_SECRET : secret partagé, utilisé pour signer la requête (HMAC-SHA256),
 *                        afin qu'aucun visiteur ne puisse déclencher un envoi.
 *
 * Tant que ces variables ne sont pas configurées, l'envoi échoue proprement et
 * le dossier reste enregistré avec le statut SMS "a_envoyer" (voir §23 du cahier
 * des charges : un échec de SMS ne doit jamais faire perdre le dossier).
 */
export async function envoyerSms(
  telephone: string,
  message: string
): Promise<EnvoiSmsResultat> {
  const url = process.env.SMS_GATEWAY_URL;
  const secret = process.env.SMS_GATEWAY_SECRET;

  if (!url || !secret) {
    return {
      succes: false,
      erreur: "Passerelle SMS non configurée (SMS_GATEWAY_URL / SMS_GATEWAY_SECRET).",
    };
  }

  const payload = JSON.stringify({ telephone, message, horodatage: Date.now() });
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const reponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
      body: payload,
      signal: AbortSignal.timeout(10_000),
    });

    if (!reponse.ok) {
      return { succes: false, erreur: `Passerelle SMS : réponse ${reponse.status}` };
    }
    return { succes: true };
  } catch (err) {
    return {
      succes: false,
      erreur: err instanceof Error ? err.message : "Erreur réseau inconnue",
    };
  }
}
