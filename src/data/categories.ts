import type { AWSCategory } from '../types';

export interface CategoryMeta {
  name: AWSCategory;
  badgeColor: string;
  badgeBg: string;
  borderCol: string;
  iconName: string;
}

export const AWS_CATEGORIES: CategoryMeta[] = [
  {
    name: 'Security, Identity & Compliance',
    badgeColor: 'text-red-700 dark:text-red-300',
    badgeBg: 'bg-red-50 dark:bg-red-950/40',
    borderCol: 'border-red-200 dark:border-red-800',
    iconName: 'ShieldCheck'
  },
  {
    name: 'Serverless',
    badgeColor: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    borderCol: 'border-amber-200 dark:border-amber-800',
    iconName: 'Zap'
  },
  {
    name: 'Generative AI & Machine Learning',
    badgeColor: 'text-purple-700 dark:text-purple-300',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    borderCol: 'border-purple-200 dark:border-purple-800',
    iconName: 'Sparkles'
  },
  {
    name: 'Cloud Operations',
    badgeColor: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderCol: 'border-emerald-200 dark:border-emerald-800',
    iconName: 'Activity'
  },
  {
    name: 'Containers',
    badgeColor: 'text-blue-700 dark:text-blue-300',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    borderCol: 'border-blue-200 dark:border-blue-800',
    iconName: 'Box'
  },
  {
    name: 'Data & Analytics',
    badgeColor: 'text-cyan-700 dark:text-cyan-300',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderCol: 'border-cyan-200 dark:border-cyan-800',
    iconName: 'Database'
  },
  {
    name: 'Developer Tools',
    badgeColor: 'text-indigo-700 dark:text-indigo-300',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderCol: 'border-indigo-200 dark:border-indigo-800',
    iconName: 'Terminal'
  },
  {
    name: 'Front-End Web & Mobile',
    badgeColor: 'text-pink-700 dark:text-pink-300',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/40',
    borderCol: 'border-pink-200 dark:border-pink-800',
    iconName: 'Layout'
  },
  {
    name: 'Networking & Content Delivery',
    badgeColor: 'text-orange-700 dark:text-orange-300',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    borderCol: 'border-orange-200 dark:border-orange-800',
    iconName: 'Globe'
  },
  {
    name: 'Storage',
    badgeColor: 'text-teal-700 dark:text-teal-300',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    borderCol: 'border-teal-200 dark:border-teal-800',
    iconName: 'HardDrive'
  }
];

export function getCategoryMeta(categoryName: AWSCategory): CategoryMeta {
  const found = AWS_CATEGORIES.find(c => c.name === categoryName);
  return found || AWS_CATEGORIES[0];
}
