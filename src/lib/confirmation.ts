import { echapperHtml, envoyerEmail } from "@/lib/email";
import { marquerEmailConfirmation } from "@/lib/repository";
import type { Dossier } from "@/lib/types";

/**
 * E-mail de confirmation de réception envoyé au déposant (s'il a donné une
 * adresse), avec la référence du dossier. Remplace le SMS de confirmation
 * (désactivé, voir src/lib/sms.ts). Un échec d'envoi est enregistré mais ne
 * remet jamais en cause l'enregistrement du dossier.
 */
export async function envoyerConfirmationDepot(dossier: Dossier): Promise<void> {
  const destinataire = dossier.coordonnees.email?.trim();
  if (!destinataire) return;

  const date = new Date(dossier.dateDepot).toLocaleString("fr-FR", {
    timeZone: "Indian/Antananarivo",
    dateStyle: "short",
    timeStyle: "short",
  });
  const a = dossier.association;
  const lieu = [a.fokontany, a.commune, a.district].filter(Boolean).join(", ");

  const lignes: [string, string][] = [
    ["Laharana", dossier.reference],
    ["Fikambanana", a.nom],
    ["Toerana", lieu],
    ["Daty nametrahana", date],
  ];

  const texte =
    `Manao ahoana,\n\n` +
    `Voaray soa aman-tsara ny antontan-taratasin'ny fikambanana « ${a.nom} ».\n\n` +
    lignes.map(([l, v]) => `${l} : ${v}`).join("\n") +
    `\n\nTehirizo ity laharana ity raha hifandray aminay ianao.\n\n` +
    `Misaotra anao,\nNy VFM\n\n` +
    `-- \nMailaka alefa ho azy ity, aza valiana. Raha misy fanontaniana : contact.vfm@0550.site`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#18181b;max-width:560px">
      <p>Manao ahoana,</p>
      <p>Voaray soa aman-tsara ny antontan-taratasin'ny fikambanana
        <strong>${echapperHtml(a.nom)}</strong>.</p>
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
    `VFM — Voaray ny antontan-taratasinao (${dossier.reference})`,
    texte,
    html
  );
  await marquerEmailConfirmation(dossier.reference, envoye ? "envoye" : "echoue").catch((err) =>
    console.error("Statut de l'e-mail de confirmation non enregistré", err)
  );
  dossier.emailConfirmation = envoye ? "envoye" : "echoue";
}
