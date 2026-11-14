import type { Article, CreatorProfile } from '../types';

export const CURRENT_USER: CreatorProfile = {
  id: 'usr_roberto',
  name: 'Roberto Flores',
  bio: 'Carpintero & Líder de AWS UG Playa Vicente · Lead Auditor ISO 27001:2022',
  builderHandle: 'robertoflores',
  builderUrl: 'https://builder.aws.com/community/@robertoflores',
  linkedinUrl: 'https://www.linkedin.com/in/roberto-flores-carpintero',
  githubUrl: 'https://github.com/Siegfried-FS',
  instagramUrl: 'https://www.instagram.com/siegfried_fs',
  avatarUrl: '/images/mascot_opt.png',
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art_1794612054603',
    itemType: 'article',
    title: 'Diseñar software no es dibujar diagramas: es construir entendimiento compartido',
    summary:
      'Una arquitectura puede estar técnicamente bien documentada y aun así fracasar si producto, negocio, ingeniería y operaciones no comparten la misma comprensión del problema.',
    category: 'Developer Tools',
    builderUrl:
      'https://builder.aws.com/content/3LNw0qC4HtZ7JKbmVqfHqKwFTIS/disenar-software-no-es-dibujar-diagramas-es-construir-entendimiento-compartido',
    authorId: 'usr_ZnVua3ltb25zdGVy',
    authorName: 'Luis Antonio Galindo Castro (FunkyM0nk3y)',
    authorBio: 'Creador en el Bootcamp AWS Builder Center',
    authorAvatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJTizflR2WmOuMHcmKxOLJ1PmHCTSM-SuNdKwcUL5V0Sz1tx0WRvw=s96-c',
    authorBuilderUrl: 'https://builder.aws.com/community/@LuisAntonioGalindoCastro(FunkyM0nk3y)',
    createdAt: '2026-11-13T23:20:54.603Z',
    likesCount: 0,
    likedBy: [],
  },
  {
    id: 'art_1794611935770',
    itemType: 'article',
    title: 'Microservicios: cuando distribuir el sistema también distribuye el problema',
    summary:
      'Dividir una aplicación en múltiples servicios no garantiza autonomía ni agilidad. Cuando los límites del dominio son débiles, los equipos siguen dependiendo unos de otros.',
    category: 'Developer Tools',
    builderUrl:
      'https://builder.aws.com/content/3KbixQ87YB6vSC77c2gbOa8gEsy/microservicios-cuando-distribuir-el-sistema-tambien-distribuye-el-problema',
    authorId: 'usr_ZnVua3ltb25zdGVy',
    authorName: 'Luis Antonio Galindo Castro (FunkyM0nk3y)',
    authorBio: 'Creador en el Bootcamp AWS Builder Center',
    authorAvatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJTizflR2WmOuMHcmKxOLJ1PmHCTSM-SuNdKwcUL5V0Sz1tx0WRvw=s96-c',
    authorBuilderUrl: 'https://builder.aws.com/community/@LuisAntonioGalindoCastro(FunkyM0nk3y)',
    createdAt: '2026-11-13T23:18:55.770Z',
    likesCount: 0,
    likedBy: [],
  },
  {
    id: 'art_1794611868639',
    itemType: 'article',
    title: 'Una API también es una promesa organizacional',
    summary:
      'Publicar una API es relativamente sencillo. Lo difícil comienza cuando otros equipos construyen procesos críticos a su alrededor y cada versión impacta operaciones.',
    category: 'Developer Tools',
    builderUrl:
      'https://builder.aws.com/content/3K1SldWac4dBLLlwFR5yXAioh6H/una-api-tambien-es-una-promesa-organizacional',
    authorId: 'usr_ZnVua3ltb25zdGVy',
    authorName: 'Luis Antonio Galindo Castro (FunkyM0nk3y)',
    authorBio: 'Creador en el Bootcamp AWS Builder Center',
    authorAvatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJTizflR2WmOuMHcmKxOLJ1PmHCTSM-SuNdKwcUL5V0Sz1tx0WRvw=s96-c',
    authorBuilderUrl: 'https://builder.aws.com/community/@LuisAntonioGalindoCastro(FunkyM0nk3y)',
    createdAt: '2026-11-13T23:17:48.639Z',
    likesCount: 0,
    likedBy: [],
  },
  {
    id: 'art_1794611793092',
    itemType: 'article',
    title: '“Looks good to me” no es una revisión de código',
    summary:
      'Una aprobación registrada no demuestra que el código haya sido realmente revisado. Cuando un pull request recibe un LGTM por prisa, se arriesga la seguridad.',
    category: 'Developer Tools',
    builderUrl:
      'https://builder.aws.com/content/3JcVKCbvFEDWhHVYvZ15QvD7Dps/looks-good-to-me-no-es-una-revision-de-codigo',
    authorId: 'usr_ZnVua3ltb25zdGVy',
    authorName: 'Luis Antonio Galindo Castro (FunkyM0nk3y)',
    authorBio: 'Creador en el Bootcamp AWS Builder Center',
    authorAvatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJTizflR2WmOuMHcmKxOLJ1PmHCTSM-SuNdKwcUL5V0Sz1tx0WRvw=s96-c',
    authorBuilderUrl: 'https://builder.aws.com/community/@LuisAntonioGalindoCastro(FunkyM0nk3y)',
    createdAt: '2026-11-13T23:16:33.092Z',
    likesCount: 0,
    likedBy: [],
  },
  {
    id: 'art_1792354457234',
    itemType: 'article',
    title: 'Detrás de un clic: Construyendo una forma más simple de entender el phishing',
    summary:
      '¿Qué hay detrás de un clic sospechoso? Conoce cómo construí CyberGuard AI con AWS para ayudar a reconocer señales de phishing y cómo funciona su análisis de riesgo.',
    category: 'Serverless',
    builderUrl:
      'https://builder.aws.com/content/3Ksd4sQeGIaPxmNOiNvLvFnPg0Z/detras-de-un-clic-construyendo-cyberguard-ai-con-aws',
    authorId: 'usr_bWFyaWFuYXBvbmNl',
    authorName: 'Mariana Ponce',
    authorBio: 'Creador en el Bootcamp AWS Builder Center',
    authorAvatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocLZDz64EVp7Qs-UmImOaZXTzwj5xM7BFe9dgirW9ak0fCGmheh0=s96-c',
    authorBuilderUrl: 'https://builder.aws.com/community/@MarianaPonce',
    createdAt: '2026-10-18T20:14:17.234Z',
    likesCount: 4,
    likedBy: [],
  },
  {
    id: 'art_1792273717087',
    itemType: 'article',
    title: 'Cuando algo complejo falla, buscamos una explicación compleja - Mi experiencia configurando AWS',
    summary:
      'Intentaba configurar una ruta pública en AWS, revisé la VPC, la route table, el Internet Gateway, el Security Group… pensaba que el problema estaba muy escondido y resultó ser simple.',
    category: 'Cloud Operations',
    builderUrl:
      'https://builder.aws.com/content/3JVkO7NWy2M3z8Qb5L6bfrMDq9E/cuando-algo-complejo-falla-buscamos-una-explicacion-compleja-mi-experiencia-implementando-configuraciones-de-aws-por-primera-vez',
    authorId: 'usr_ZW5lbGVzbWFpQGdt',
    authorName: 'Selene Flores',
    authorBio: 'Creador en el Bootcamp AWS Builder Center',
    authorAvatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocI_BpC7-Y-YQAfSWb3wwxyHFhcYIZEiz3pfiWewz3DyyOz5Sg=s96-c',
    authorBuilderUrl: 'https://builder.aws.com/community/@SeleneFlores',
    createdAt: '2026-10-17T21:48:37.087Z',
    likesCount: 6,
    likedBy: [],
  },
];
