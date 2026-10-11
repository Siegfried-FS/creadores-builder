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
  email: string;
  builderHandle: string;
  builderUrl: string;
  linkedinHandle?: string;
  linkedinUrl?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  avatarUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  category: AWSCategory;
  builderUrl: string;
  linkedinPostUrl?: string;
  authorId: string;
  authorName: string;
  authorBuilderHandle: string;
  authorAvatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  likesCount: number;
}

export interface UserLike {
  userId: string;
  articleId: string;
  likedAt: string;
}
