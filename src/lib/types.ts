export type StatutSms = "a_envoyer" | "envoye" | "echoue";

export type StatutDossier =
  | "recu"
  | "en_cours"
  | "informations_demandees"
  | "accepte"
  | "refuse"
  | "archive";

export interface Responsable {
  nom: string;
  prenom: string;
}

export interface AutreCoordonnee {
  type: string;
  valeur: string;
}

export interface PieceJointe {
  nom: string;
  url: string;
  taille: number;
  type: string;
}

export interface DossierInput {
  idempotencyKey: string;
  association: {
    nom: string;
    adresse: string;
    activite: string;
    nombreMembres: number;
  };
  responsables: Responsable[];
  coordonnees: {
    telephone: string;
    email?: string;
    autres?: AutreCoordonnee[];
  };
  description: string;
  pieces: PieceJointe[];
}

export interface Dossier extends DossierInput {
  reference: string;
  dateDepot: string;
  statut: StatutDossier;
  statutSms: StatutSms;
  smsDate?: string;
}
