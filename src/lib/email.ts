import nodemailer from "nodemailer";

/**
 * Envoi d'e-mails par la boîte LWS du domaine (variables SMTP_* dans Coolify).
 * Sans configuration, l'envoi est ignoré : les demandes restent visibles dans
 * l'onglet « Administrateurs » de la page d'administration.
 */
export function emailConfigure(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export async function envoyerEmail(destinataire: string, sujet: string, texte: string, html: string): Promise<boolean> {
  if (!emailConfigure()) {
    console.warn("E-mail non envoyé (SMTP non configuré) :", sujet);
    return false;
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || `VFM <${process.env.SMTP_USER}>`,
      to: destinataire,
      subject: sujet,
      text: texte,
      html,
    });
    return true;
  } catch (err) {
    console.error("Échec d'envoi d'e-mail", err);
    return false;
  }
}

/** Échappe un texte saisi par le public avant de l'insérer dans un e-mail HTML. */
export function echapperHtml(texte: string): string {
  return texte.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
