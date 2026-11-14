import type { Article } from '../types';
import { INITIAL_ARTICLES } from '../data/initialData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://6qxtspu588.execute-api.us-east-1.amazonaws.com';

export async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      localStorage.setItem('creadores_articles', JSON.stringify(data));
      return data;
    }
    // Si la tabla está vacía, retornar los iniciales
    const saved = localStorage.getItem('creadores_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  } catch (error) {
    console.warn('[API Serverless] Error al consultar DynamoDB, usando caché local:', error);
    const saved = localStorage.getItem('creadores_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  }
}

export async function createArticle(articleData: Partial<Article>): Promise<Article> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('[API Serverless] Error en POST DynamoDB, guardando en local:', error);
    const now = Date.now();
    return {
      id: `hub_${now}`,
      itemType: articleData.itemType || 'article',
      title: articleData.title || '',
      summary: articleData.summary || '',
      category: articleData.category || 'Developer Tools',
      builderUrl: articleData.builderUrl || '',
      wishlistUrl: articleData.wishlistUrl,
      commentUrl: articleData.commentUrl,
      linkedinPostUrl: articleData.linkedinPostUrl,
      instagramPostUrl: articleData.instagramPostUrl,
      authorId: articleData.authorId || '',
      authorName: articleData.authorName || '',
      authorBio: articleData.authorBio,
      authorAvatarUrl: articleData.authorAvatarUrl || '/images/mascot_opt.png',
      authorBuilderUrl: articleData.authorBuilderUrl || '',
      authorLinkedinUrl: articleData.authorLinkedinUrl,
      authorGithubUrl: articleData.authorGithubUrl,
      authorInstagramUrl: articleData.authorInstagramUrl,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };
  }
}

export async function updateArticle(id: string, articleData: Partial<Article>): Promise<Article> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('[API Serverless] Error en PUT DynamoDB:', error);
    throw error;
  }
}

export async function deleteArticle(id: string, authorId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId }),
    });
    return res.ok;
  } catch (error) {
    console.warn('[API Serverless] Error en DELETE DynamoDB:', error);
    return false;
  }
}

export async function toggleLike(
  id: string,
  userId: string,
  delta?: number
): Promise<{ likesCount: number; isLikedByMe: boolean } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, delta }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { likesCount: data.likesCount, isLikedByMe: data.isLikedByMe };
  } catch (error) {
    console.warn('[API Serverless] Error en Like DynamoDB:', error);
    return null;
  }
}
