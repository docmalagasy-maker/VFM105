export const LIBELLES_STATUT: Record<string, string> = {
  recu: "Reçu",
  en_cours: "En cours d'étude",
  informations_demandees: "Informations demandées",
  accepte: "Accepté",
  refuse: "Refusé",
  archive: "Archivé",
};

export const LIBELLES_SMS: Record<string, string> = {
  a_envoyer: "À envoyer",
  envoye: "Envoyé",
  echoue: "Échoué",
  desactive: "Désactivé",
};

export const LIBELLES_EMAIL: Record<string, string> = {
  envoye: "Envoyé",
  echoue: "Échec",
};

/** État de l'e-mail de confirmation envoyé au déposant. */
export function libelleEmailConfirmation(d: { coordonnees: { email?: string }; emailConfirmation?: string }): string {
  if (!d.coordonnees.email) return "Pas d'adresse";
  return d.emailConfirmation ? (LIBELLES_EMAIL[d.emailConfirmation] ?? d.emailConfirmation) : "—";
}
