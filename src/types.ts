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

export type ItemType = 'article' | 'wishlist' | 'comment';

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
  itemType?: ItemType;             // 'article' | 'wishlist' | 'comment' (por defecto 'article')
  title: string;
  summary?: string;
  category: AWSCategory;
  // Enlaces del artículo, deseo o comentario y difusión
  builderUrl: string;              // Enlace oficial en AWS Builder Center
  wishlistUrl?: string;            // Enlace directo a la Wishlist de AWS
  commentUrl?: string;             // Enlace directo al comentario con ancla #comments
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
  likesCount: number;
  likedBy?: string[];             // Lista de IDs de usuarios que apoyaron (idempotencia y 1 voto por usuario)
}
