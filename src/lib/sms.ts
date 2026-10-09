// Texte en caractères simples (sans accents) : un seul SMS de 160 caractères maximum.
export function messageConfirmation(reference: string): string {
  return `VFM : Voaray ny antontan-taratasinao. Laharana : ${reference}. Misaotra.`;
}
