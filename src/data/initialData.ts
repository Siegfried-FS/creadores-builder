import type { Article, CreatorProfile } from '../types';

export const CURRENT_USER: CreatorProfile = {
  id: 'usr_roberto',
  name: 'Roberto Flores',
  bio: 'Carpintero & Líder del AWS User Group Playa Vicente. Lead Auditor ISO 27001:2022 y AWS Certified Cloud Practitioner.',
  builderHandle: 'siegfried_fs',
  builderUrl: 'https://community.aws/@siegfried_fs',
  linkedinUrl: 'https://www.linkedin.com/in/roberto-flores-carpintero',
  instagramUrl: 'https://www.instagram.com/siegfried_fs',
  avatarUrl: '/images/mascot_opt.png'
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art_kiro_01',
    title: '¿Ya tienes tu mes de Kiro Pro gratis? (Incluso un año si quisieras...)',
    summary: 'Cómo canjear créditos promocionales de eventos de AWS en Billing y vincularlos a IAM Identity Center para absorber la suscripción mensual de desarrollo asistido con IA sin gastar de tu bolsillo.',
    category: 'Developer Tools',
    builderUrl: 'https://community.aws/@siegfried_fs',
    linkedinPostUrl: 'https://www.linkedin.com/in/roberto-flores-carpintero',
    instagramPostUrl: 'https://www.instagram.com/siegfried_fs',
    authorId: 'usr_roberto',
    authorName: 'Roberto Flores',
    authorBio: 'Carpintero & Líder del AWS User Group Playa Vicente',
    authorAvatarUrl: '/images/mascot_opt.png',
    authorBuilderUrl: 'https://community.aws/@siegfried_fs',
    authorLinkedinUrl: 'https://www.linkedin.com/in/roberto-flores-carpintero',
    authorInstagramUrl: 'https://www.instagram.com/siegfried_fs',
    createdAt: '2026-10-10T12:00:00Z',
    likesCount: 1
  }
];
