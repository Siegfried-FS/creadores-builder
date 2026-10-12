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
    // 1. GET /articles - Listar artículos vigentes (TTL < 30 días)
    if (method === 'GET' && (path === '/articles' || path === '/')) {
      const nowEpoch = Math.floor(Date.now() / 1000);
      const command = new ScanCommand({
        TableName: TABLE_NAME,
      });

      const result = await docClient.send(command);
      const items = (result.Items || [])
        // Filtrar artículos que ya hayan expirado por TTL si DynamoDB aún no los ha purgado
        .filter((item) => !item.ttl || item.ttl > nowEpoch)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return sendResponse(200, items);
    }

    // 2. POST /articles - Publicar nuevo artículo con 30 días de vigencia
    if (method === 'POST' && path === '/articles') {
      const body = JSON.parse(event.body || '{}');

      if (!body.title || !body.builderUrl || !body.authorId) {
        return sendResponse(400, { error: 'Título, URL de Builder y Autor son obligatorios.' });
      }

      const now = Date.now();
      const ttlEpoch = Math.floor(now / 1000) + 30 * 24 * 60 * 60; // 30 días deslizantes
      const newArticle = {
        id: body.id || `art_${now}`,
        title: String(body.title).trim().slice(0, 120),
        summary: String(body.summary || '').trim().slice(0, 220),
        category: body.category || 'Developer Tools',
        builderUrl: String(body.builderUrl).trim(),
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
        expiresAt: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ttl: ttlEpoch,
        likesCount: 0,
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

      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: articleId },
        UpdateExpression:
          'SET title = :title, summary = :summary, category = :cat, builderUrl = :bUrl, linkedinPostUrl = :liUrl, instagramPostUrl = :igUrl, authorBuilderUrl = :abUrl, authorLinkedinUrl = :alUrl, authorGithubUrl = :agUrl, authorInstagramUrl = :aiUrl',
        ExpressionAttributeValues: {
          ':title': String(body.title || existing.Item.title).trim().slice(0, 120),
          ':summary': String(body.summary || '').trim().slice(0, 220),
          ':cat': body.category || existing.Item.category,
          ':bUrl': String(body.builderUrl || existing.Item.builderUrl).trim(),
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

    // 5. POST /articles/{id}/like - Incrementar apoyo comunitario atómicamente
    if (method === 'POST' && path.includes('/like')) {
      const articleId = path.split('/')[2];
      const body = JSON.parse(event.body || '{}');
      const increment = body.delta === -1 ? -1 : 1;

      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: articleId },
        UpdateExpression: 'SET likesCount = if_not_exists(likesCount, :zero) + :inc',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': increment,
        },
        ReturnValues: 'ALL_NEW',
      });

      const result = await docClient.send(updateCommand);
      return sendResponse(200, { id: articleId, likesCount: result.Attributes.likesCount });
    }

    return sendResponse(404, { error: `Ruta no encontrada: ${method} ${path}` });
  } catch (error) {
    console.error('Error en Lambda creadores-builder-api:', error);
    return sendResponse(500, { error: 'Error interno del servidor Serverless.', details: error.message });
  }
};
