export type AWSCategory =
  | 'Security, Identity & Compliance'
  | 'Serverless'
  | 'Generative AI & Machine Learning'
  | 'Cloud Operations'
  | 'Containers'
  | 'Data & Analytics'
  | 'Developer Tools'
  | 'Front-End Web & Mobile'
  | 'Networking & Content Delivery'
  | 'Storage';

export interface CreatorProfile {
  id: string;
  name: string;
  bio?: string;
  email?: string;
  builderHandle: string;
  builderUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  avatarUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  summary?: string;
  category: AWSCategory;
  // Enlaces del artículo y difusión
  builderUrl: string;              // Enlace al artículo en AWS Builder Center
  linkedinPostUrl?: string;        // Dónde lo posteó en LinkedIn
  instagramPostUrl?: string;       // Dónde lo posteó en Instagram
  xPostUrl?: string;               // Dónde lo posteó en X / Twitter
  
  // Datos del creador
  authorId: string;
  authorName: string;
  authorBio?: string;
  authorAvatarUrl?: string;
  authorBuilderUrl: string;
  authorLinkedinUrl?: string;
  authorGithubUrl?: string;
  authorInstagramUrl?: string;
  authorXUrl?: string;

  createdAt: string;
  expiresAt?: string;             // ISO date para cálculo de vigencia de 30 días
  ttl?: number;                   // Timestamp Unix epoch (segundos) para TTL de DynamoDB
  likesCount: number;
}
