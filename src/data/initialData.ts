import type { Article, CreatorProfile } from '../types';

export const CURRENT_USER_MOCK: CreatorProfile = {
  id: 'usr_roberto_01',
  name: 'Roberto Flores',
  email: 'roberto@awsugplayavicente.com',
  builderHandle: 'siegfried_fs',
  builderUrl: 'https://community.aws/@siegfried_fs',
  linkedinHandle: 'roberto-flores-carpintero',
  linkedinUrl: 'https://www.linkedin.com/in/roberto-flores-carpintero',
  instagramHandle: 'siegfried_fs',
  instagramUrl: 'https://www.instagram.com/siegfried_fs',
  avatarUrl: '/images/mascot_opt.png'
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art_001',
    title: 'De Carpintero a AWS Builder: Auditoría de Seguridad Real con IAM y CloudTrail',
    category: 'Security, Identity & Compliance',
    builderUrl: 'https://community.aws/content/2m8WqK0N3sZ/de-carpintero-a-aws-builder',
    linkedinPostUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7245890123456789012',
    authorId: 'usr_roberto_01',
    authorName: 'Roberto Flores',
    authorBuilderHandle: 'siegfried_fs',
    authorAvatarUrl: '/images/mascot_opt.png',
    createdAt: '2026-10-09T18:30:00Z',
    likesCount: 14
  },
  {
    id: 'art_002',
    title: 'Primeros pasos con AWS Lambda en Python: Evitando errores de permisos en producción',
    category: 'Serverless',
    builderUrl: 'https://community.aws/content/3k9XmP1L4bY/primeros-pasos-aws-lambda-python',
    linkedinPostUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7245890987654321098',
    authorId: 'usr_mariana_02',
    authorName: 'Mariana Silva',
    authorBuilderHandle: 'mariana_cloud',
    authorAvatarUrl: '',
    createdAt: '2026-10-10T14:15:00Z',
    likesCount: 9
  },
  {
    id: 'art_003',
    title: 'Implementando RAG Serverless con Amazon Bedrock Knowledge Bases en 15 Minutos',
    category: 'Generative AI & Machine Learning',
    builderUrl: 'https://community.aws/content/5n2YvT8Q7rX/rag-serverless-amazon-bedrock',
    linkedinPostUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7245891122334455667',
    authorId: 'usr_carlos_03',
    authorName: 'Carlos Méndez',
    authorBuilderHandle: 'cmendez_dev',
    authorAvatarUrl: '',
    createdAt: '2026-10-11T10:00:00Z',
    likesCount: 18
  },
  {
    id: 'art_004',
    title: 'Desplegando Contenedores en ECS Fargate con AWS CDK sin tocar la consola',
    category: 'Containers',
    builderUrl: 'https://community.aws/content/6p3ZwU9S8sY/desplegando-ecs-fargate-cdk',
    linkedinPostUrl: '',
    authorId: 'usr_laura_04',
    authorName: 'Laura Domínguez',
    authorBuilderHandle: 'ldominguez_aws',
    authorAvatarUrl: '',
    createdAt: '2026-10-11T12:45:00Z',
    likesCount: 7
  }
];
