import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'creadores-builder-articles';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const sendResponse = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

function validateTargetUrl(url, itemType) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return false;

    if (itemType === 'wishlist') {
      const isBuilder = parsed.hostname.includes('builder.aws.com') || parsed.hostname.includes('community.aws');
      return isBuilder && parsed.pathname.includes('/wishlist/');
    }

    if (itemType === 'comment') {
      const isBuilder = parsed.hostname.includes('builder.aws.com') || parsed.hostname.includes('community.aws');
      return isBuilder;
    }

    // Default 'article'
    const allowedDomains = ['builder.aws.com', 'community.aws', 'aws.amazon.com', 'dev.to', 'medium.com'];
    return allowedDomains.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

function validateOptionalSocialUrl(url, allowedDomains) {
  if (!url) return true;
  try {
    const parsed = new URL(String(url).trim());
    if (parsed.protocol !== 'https:') return false;
    return allowedDomains.some((d) => parsed.hostname.includes(d));
  } catch {
    return false;
  }
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.rawPath || event.path || '/';

  // Manejar preflight OPTIONS de CORS
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // 1. GET /articles - Listar todas las publicaciones permanentes (Artículos, Wishlists, Comentarios)
    if (method === 'GET' && (path === '/articles' || path === '/')) {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
      });

      const result = await docClient.send(command);
      // Publicaciones permanentes sin filtro de expiración por TTL
      const items = (result.Items || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return sendResponse(200, items);
    }

    // 2. POST /articles - Publicar nuevo registro permanente (Artículo, Wishlist o Comentario)
    if (method === 'POST' && path === '/articles') {
      const body = JSON.parse(event.body || '{}');

      const targetUrl = body.builderUrl || body.wishlistUrl || body.commentUrl;
      if (!body.title || !targetUrl || !body.authorId) {
        return sendResponse(400, { error: 'Título, URL y Autor son obligatorios.' });
      }

      const now = Date.now();
      const itemType = body.itemType === 'wishlist' || body.itemType === 'comment' ? body.itemType : 'article';

      if (!validateTargetUrl(targetUrl, itemType)) {
        return sendResponse(400, {
          error: `URL no válida para tipo '${itemType}'. Debe ser un enlace legítimo de AWS Builder Center con protocolo https://`,
        });
      }

      if (!validateOptionalSocialUrl(body.linkedinPostUrl, ['linkedin.com', 'lnkd.in'])) {
        return sendResponse(400, { error: 'URL de LinkedIn no válida.' });
      }

      if (!validateOptionalSocialUrl(body.instagramPostUrl, ['instagram.com'])) {
        return sendResponse(400, { error: 'URL de Instagram no válida.' });
      }

      const newArticle = {
        id: body.id || `hub_${now}`,
        itemType, // 'article' | 'wishlist' | 'comment'
        title: String(body.title).trim().slice(0, 140),
        summary: String(body.summary || '').trim().slice(0, 300),
        category: body.category || 'Developer Tools',
        builderUrl: String(targetUrl).trim(),
        wishlistUrl: body.wishlistUrl ? String(body.wishlistUrl).trim() : (itemType === 'wishlist' ? String(targetUrl).trim() : null),
        commentUrl: body.commentUrl ? String(body.commentUrl).trim() : (itemType === 'comment' ? String(targetUrl).trim() : null),
        linkedinPostUrl: body.linkedinPostUrl ? String(body.linkedinPostUrl).trim() : null,
        instagramPostUrl: body.instagramPostUrl ? String(body.instagramPostUrl).trim() : null,
        authorId: String(body.authorId),
        authorName: String(body.authorName || 'Creador').slice(0, 50),
        authorBio: String(body.authorBio || '').slice(0, 100),
        authorAvatarUrl: body.authorAvatarUrl || '/images/mascot_opt.png',
        authorBuilderUrl: body.authorBuilderUrl || '',
        authorLinkedinUrl: body.authorLinkedinUrl || '',
        authorGithubUrl: body.authorGithubUrl || '',
        authorInstagramUrl: body.authorInstagramUrl || '',
        createdAt: new Date(now).toISOString(),
        // Permanente: no se genera TTL para que nunca expire en DynamoDB
        likesCount: 0,
        likedBy: [],
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: newArticle,
        })
      );

      return sendResponse(201, newArticle);
    }

    // 3. PUT /articles/{id} - Editar artículo por su autor
    if (method === 'PUT' && path.startsWith('/articles/')) {
      const articleId = path.split('/')[2];
      const body = JSON.parse(event.body || '{}');

      // Verificar que el artículo exista y que el autor coincida
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: articleId },
        })
      );

      if (!existing.Item) {
        return sendResponse(404, { error: 'Artículo no encontrado.' });
      }

      if (body.authorId && existing.Item.authorId !== body.authorId) {
        return sendResponse(403, { error: 'No tienes autorización para editar este artículo.' });
      }

      const targetUrl = body.builderUrl || body.wishlistUrl || body.commentUrl || existing.Item.builderUrl;
      const itemType = body.itemType || existing.Item.itemType || 'article';

      if (!validateTargetUrl(targetUrl, itemType)) {
        return sendResponse(400, {
          error: `URL no válida para tipo '${itemType}'. Debe ser un enlace legítimo de AWS Builder Center con protocolo https://`,
        });
      }

      if (!validateOptionalSocialUrl(body.linkedinPostUrl, ['linkedin.com', 'lnkd.in'])) {
        return sendResponse(400, { error: 'URL de LinkedIn no válida.' });
      }

      if (!validateOptionalSocialUrl(body.instagramPostUrl, ['instagram.com'])) {
        return sendResponse(400, { error: 'URL de Instagram no válida.' });
      }

      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: articleId },
        UpdateExpression:
          'SET title = :title, summary = :summary, category = :cat, builderUrl = :bUrl, itemType = :iType, wishlistUrl = :wUrl, commentUrl = :cUrl, linkedinPostUrl = :liUrl, instagramPostUrl = :igUrl, authorBuilderUrl = :abUrl, authorLinkedinUrl = :alUrl, authorGithubUrl = :agUrl, authorInstagramUrl = :aiUrl',
        ExpressionAttributeValues: {
          ':title': String(body.title || existing.Item.title).trim().slice(0, 140),
          ':summary': String(body.summary || '').trim().slice(0, 300),
          ':cat': body.category || existing.Item.category,
          ':bUrl': String(targetUrl).trim(),
          ':iType': itemType,
          ':wUrl': body.wishlistUrl ? String(body.wishlistUrl).trim() : (existing.Item.wishlistUrl || null),
          ':cUrl': body.commentUrl ? String(body.commentUrl).trim() : (existing.Item.commentUrl || null),
          ':liUrl': body.linkedinPostUrl ? String(body.linkedinPostUrl).trim() : null,
          ':igUrl': body.instagramPostUrl ? String(body.instagramPostUrl).trim() : null,
          ':abUrl': body.authorBuilderUrl !== undefined ? body.authorBuilderUrl : (existing.Item.authorBuilderUrl || ''),
          ':alUrl': body.authorLinkedinUrl !== undefined ? body.authorLinkedinUrl : (existing.Item.authorLinkedinUrl || ''),
          ':agUrl': body.authorGithubUrl !== undefined ? body.authorGithubUrl : (existing.Item.authorGithubUrl || ''),
          ':aiUrl': body.authorInstagramUrl !== undefined ? body.authorInstagramUrl : (existing.Item.authorInstagramUrl || ''),
        },
        ReturnValues: 'ALL_NEW',
      });

      const updated = await docClient.send(updateCommand);
      return sendResponse(200, updated.Attributes);
    }

    // 4. DELETE /articles/{id} - Retirar publicación por su autor
    if (method === 'DELETE' && path.startsWith('/articles/')) {
      const articleId = path.split('/')[2];
      const body = JSON.parse(event.body || '{}');

      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: articleId },
        })
      );

      if (!existing.Item) {
        return sendResponse(404, { error: 'Artículo no encontrado.' });
      }

      if (body.authorId && existing.Item.authorId !== body.authorId) {
        return sendResponse(403, { error: 'No tienes autorización para retirar este artículo.' });
      }

      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id: articleId },
        })
      );

      return sendResponse(200, { success: true, id: articleId });
    }

    // 5. POST /articles/{id}/like - Apoyo comunitario idempotente (1 creador = 1 voto)
    if (method === 'POST' && path.includes('/like')) {
      const articleId = path.split('/')[2];
      const body = JSON.parse(event.body || '{}');
      const userId = body.userId || body.authorId;

      if (!userId) {
        return sendResponse(400, { error: 'userId es obligatorio para registrar o retirar apoyo.' });
      }

      // Obtener el artículo actual en DynamoDB
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: articleId },
        })
      );

      if (!existing.Item) {
        return sendResponse(404, { error: 'Publicación no encontrada.' });
      }

      const currentLikedBy = Array.isArray(existing.Item.likedBy) ? existing.Item.likedBy : [];
      const alreadyLiked = currentLikedBy.includes(userId);
      let updatedLikedBy = [];

      if (body.delta === -1 || (body.delta === undefined && alreadyLiked)) {
        // Retirar apoyo
        updatedLikedBy = currentLikedBy.filter((id) => id !== userId);
      } else {
        // Agregar apoyo de forma idempotente
        updatedLikedBy = alreadyLiked ? currentLikedBy : [...currentLikedBy, userId];
      }

      const newLikesCount = updatedLikedBy.length;

      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: articleId },
        UpdateExpression: 'SET likedBy = :likedBy, likesCount = :likesCount',
        ExpressionAttributeValues: {
          ':likedBy': updatedLikedBy,
          ':likesCount': newLikesCount,
        },
        ReturnValues: 'ALL_NEW',
      });

      await docClient.send(updateCommand);
      return sendResponse(200, {
        id: articleId,
        likesCount: newLikesCount,
        likedBy: updatedLikedBy,
        isLikedByMe: updatedLikedBy.includes(userId),
      });
    }

    return sendResponse(404, { error: `Ruta no encontrada: ${method} ${path}` });
  } catch (error) {
    console.error('Error en Lambda creadores-builder-api:', error);
    return sendResponse(500, { error: 'Error interno del servidor Serverless.', details: error.message });
  }
};
