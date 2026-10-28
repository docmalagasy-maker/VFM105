/**
 * Birao Nasionaly (Bureau national) du VFM, affiché sur la page /birao.
 *
 * Pour enrichir la page, il suffit de modifier cette liste :
 * - ajouter un membre : une nouvelle ligne, dans l'ordre d'affichage voulu ;
 * - photo : déposer l'image dans `public/images/birao/` et indiquer son nom
 *   dans `photo` (ex. "fanomezantsoa-andrianjanahary.jpg") ;
 * - biographie : texte libre dans `tantara` (paragraphes séparés par une
 *   ligne vide).
 */
export interface MembreBirao {
  /** Nom et prénom, tels qu'affichés. */
  anarana: string;
  /** Fonction, en malgache. */
  andraikitra: string;
  /** Circonscription (district). */
  distrika: string;
  photo?: string;
  tantara?: string;
}

export const BIRAO: MembreBirao[] = [
  { anarana: "Fanomezantsoa ANDRIANJANAHARY", andraikitra: "Filoha nasionalin'ny VFM 105", distrika: "Manandriana" },
  { anarana: "Pety RAKOTONIAINA", andraikitra: "Filoha lefitra nasionalin'ny VFM 105", distrika: "Ikalamavony" },
  { anarana: "Nirina Fenohery Johnny RAKOTOARISOA", andraikitra: "Filoha lefitra nasionalin'ny VFM 105", distrika: "Ambohidratrimo" },
  { anarana: "Namiandrazana François AROSY", andraikitra: "Filoha lefitra nasionalin'ny VFM 105", distrika: "Nosy Be" },
  { anarana: "Marco TSARADIA", andraikitra: "Sekretera jeneraly nasionalin'ny VFM 105", distrika: "Ampanihy" },
];
