import { echapperHtml, envoyerEmail } from "@/lib/email";
import type { DossierPersonne } from "@/lib/personnes-modele";
import { marquerEmailPersonne } from "@/lib/personnes";

/**
 * E-mail de confirmation pour un dossier de personne (si une adresse a été
 * donnée), sur le modèle de celui des associations (src/lib/confirmation.ts).
 * Un échec d'envoi est enregistré sans remettre en cause le dossier.
 */
export async function envoyerConfirmationPersonne(dossier: DossierPersonne): Promise<void> {
  const destinataire = dossier.email?.trim();
  if (!destinataire) return;

  const date = new Date(dossier.dateDepot).toLocaleString("fr-FR", {
    timeZone: "Indian/Antananarivo",
    dateStyle: "short",
    timeStyle: "short",
  });
  const nomComplet = `${dossier.prenom} ${dossier.nom}`.trim();
  const lignes: [string, string][] = [
    ["Laharana", dossier.reference],
    ["Anarana", nomComplet],
    ["Distrika", dossier.district],
    ["Daty nametrahana", date],
  ];

  const texte =
    `Manao ahoana ${nomComplet},\n\n` +
    `Voaray soa aman-tsara ny dosie-nao.\n\n` +
    lignes.map(([l, v]) => `${l} : ${v}`).join("\n") +
    `\n\nTehirizo ity laharana ity raha hifandray aminay ianao.\n\n` +
    `Misaotra anao,\nNy VFM\n\n` +
    `-- \nMailaka alefa ho azy ity, aza valiana. Raha misy fanontaniana : contact.vfm@0550.site`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#18181b;max-width:560px">
      <p>Manao ahoana ${echapperHtml(nomComplet)},</p>
      <p>Voaray soa aman-tsara ny dosie-nao.</p>
      <p style="margin:20px 0;padding:14px 18px;border-radius:10px;background:#f3ebdc;font-size:18px">
        Laharana : <strong style="color:#142b47">${echapperHtml(dossier.reference)}</strong>
      </p>
      <table style="border-collapse:collapse;font-size:14px">
        ${lignes
          .slice(1)
          .map(
            ([l, v]) =>
              `<tr><td style="padding:3px 16px 3px 0;color:#71717a">${l}</td><td>${echapperHtml(v)}</td></tr>`
          )
          .join("")}
      </table>
      <p>Tehirizo ity laharana ity raha hifandray aminay ianao.</p>
      <p>Misaotra anao,<br>Ny VFM</p>
      <p style="margin-top:24px;font-size:12px;color:#a1a1aa">
        Mailaka alefa ho azy ity, aza valiana. Raha misy fanontaniana :
        contact.vfm@0550.site
      </p>
    </div>`;

  const envoye = await envoyerEmail(
    destinataire,
    `VFM — Voaray ny dosie-nao (${dossier.reference})`,
    texte,
    html
  );
  await marquerEmailPersonne(dossier.reference, envoye ? "envoye" : "echoue").catch((err) =>
    console.error("Statut de l'e-mail de confirmation (personne) non enregistré", err)
  );
  dossier.emailConfirmation = envoye ? "envoye" : "echoue";
}
