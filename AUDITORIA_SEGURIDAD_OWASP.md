# Informe de auditoría de seguridad y arquitectura serverless
## AWS User Group Playa Vicente — Hub comunitario de creadores
> **Estándares aplicados:** OWASP API Security Top 10 (2023), AWS Well-Architected Framework (Security Pillar), ISO/IEC 27001:2022 (A.8 Controles Tecnológicos).  
> **Auditor:** Roberto Flores (Siegfried) — Lead Auditor ISO 27001:2022 & AWS Certified Cloud Practitioner.  
> **Clasificación del Documento:** Confidencial / Uso Educativo y Remediación Interna.

---

## Resumen ejecutivo
El presente informe documenta el análisis exhaustivo de seguridad de la arquitectura Serverless desplegada para el Hub de Creadores (`creadores.awsugplayavicente.com`), compuesto por una SPA en React + Vite, AWS Amplify Hosting, Amazon API Gateway HTTP API v2, AWS Lambda (Node.js 20.x) y Amazon DynamoDB.

El objetivo es identificar debilidades en el diseño actual, explicar su mecanismo de impacto y riesgo teórico para fines de estudio, y proveer la remediación técnica paso a paso sin elevar costos ($0.00 USD Free Tier).

---

## Matriz de hallazgos y vulnerabilidades encontradas

| ID | Vulnerabilidad / Control | Clasificación OWASP | Severidad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Inserción, Edición y Borrado sin Autenticación Criptográfica | OWASP API2:2023 (Broken Authentication) | **Alta** | Documentada / Guía de remediación |
| **SEC-02** | Suplantación de Identidad de Autor (BOLA / IDOR) | OWASP API1:2023 (Broken Object Level Auth) | **Alta** | Documentada / Guía de remediación |
| **SEC-03** | Política CORS Permisiva Universal (`Access-Control-Allow-Origin: *`) | OWASP API8:2023 (Security Misconfiguration) | **Media** | Documentada / Remediar en Lambda |
| **SEC-04** | Falta de Rate Limiting y Throttling en API Gateway | OWASP API4:2023 (Unrestricted Resource Consumption) | **Media** | Mitigación FinOps recomendada |
| **SEC-05** | Validación de URLs y Esquemas en Entrada de Usuario | OWASP API7:2023 (Server Side Request Forgery / XSS) | **Baja** | Remediada en Sanitizer |

---

## Detalle técnico de vulnerabilidades y mecánica de riesgo

### 1. [SEC-01 & SEC-02] Inexistencia de Authorizer y Confianza Ciega en `authorId`
* **Archivo afectado:** `backend/index.mjs` (Líneas 59–173) y API Gateway HTTP API.
* **Descripción del hallazgo:**  
  La función Lambda procesa peticiones `POST /articles`, `PUT /articles/{id}` y `DELETE /articles/{id}` confiando únicamente en la cadena `authorId` enviada en el cuerpo del JSON (`event.body`). No existe verificación de firma criptográfica ni integración con Cognito Authorizer o Google OAuth en el endpoint HTTP.
* **Mecánica teórica de riesgo (Para fines de estudio):**  
  Cualquier cliente HTTP puede enviar una petición manual directa a la URL pública de API Gateway:
  1. Para crear un post arbitrario: se envía un `POST` con cualquier valor en `authorId`.
  2. Para borrar o modificar el post de otro usuario: el `authorId` de cada creador es público en las respuestas de `GET /articles`. Con ese dato, una petición `PUT` o `DELETE` con ese `authorId` en el payload superaría la verificación ingenua `if (body.authorId && existing.Item.authorId !== body.authorId)`.
* **Remediación Técnica:**
  1. **En API Gateway v2:** Agregar un **JWT Authorizer** vinculado a Amazon Cognito User Pool (`us-east-1_5oIhdYrO6`) o al emisor de Google Identity (`https://accounts.google.com`).
  2. **En la Lambda:** Extraer la identidad verificada directamente de `event.requestContext.authorizer.jwt.claims.sub` en lugar del cuerpo JSON enviado por el cliente.

---

### 2. [SEC-03] Cabeceras CORS Permisivas (`*`)
* **Archivo afectado:** `backend/index.mjs` (Línea 17):
  ```javascript
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  ```
* **Mecánica teórica de riesgo:**  
  Permite que sitios web de terceros ejecuten peticiones con scripts en el navegador del usuario hacia la API si hubiera sesiones basadas en cookies o tokens compartidos.
* **Remediación:**  
  Restringir `Access-Control-Allow-Origin` a los orígenes autorizados:
  - `https://creadores.awsugplayavicente.com`
  - `http://localhost:5173` (solo en entorno de desarrollo local).

---

### 3. [SEC-04] Falta de Throttling en API Gateway (Riesgo FinOps)
* **Descripción:**  
  Si bien DynamoDB está en modo `PAY_PER_REQUEST` y Lambda tiene 1,000,000 de invocaciones mensuales gratuitas en Free Tier, un bucle automatizado de peticiones podría generar costos imprevistos de lectura/escritura en DynamoDB (Denial of Wallet).
* **Remediación:**  
  En la consola de Amazon API Gateway > *Routes / Stages*, configurar una política de **Default Route Throttling**:
  - Rate limit: 20 peticiones por segundo.
  - Burst limit: 40 peticiones concurrentes.

---

## Las 21 misiones de AWS Builder Center y estrategia comunitaria

El programa de recompensas de **AWS Builder Center** premia el compromiso genuino con 3 hitos clave:
* **Nivel 1 (7 Badges):** $10 USD en Créditos AWS.
* **Nivel 2 (14 Badges):** $20 USD adicionales en Créditos AWS ($30 USD acumulados).
* **Nivel 3 (21 Badges):** Voucher del 100% para examen de certificación AWS Foundational ($100 USD de valor, p. ej. CLF-C02 o AIF-C01).

### Desglose de las 21 Misiones:
1. **Quick-Wins (Día 1):**
   - Completar perfil.
   - Subir avatar.
   - Leer 10 artículos técnicos.
   - Publicar el primer deseo en la **Wishlist**.
   - Publicar el primer artículo técnico.
2. **Hábitos y Rachas (Streaks):**
   - Racha de inicio de sesión diario.
   - Interacciones diarias (likes y comentarios de valor).
   - Votación semanal en la **Wishlist**.
   - Publicación semanal de contenido.
   - Rachas de 30 y 90 días de actividad continua.
3. **Impacto Comunitario (Apoyo mutuo en el Hub):**
   - **Conversation Starter:** Comentarios propios que reciben respuestas de otros builders.
   - **Idea Influencer:** Votos acumulados en los deseos propuestos en la Wishlist.
   - **Meaningful Contributor:** Likes recibidos en comentarios sustanciales.
   - **Valued Creator:** Likes recibidos en artículos publicados.

> [!NOTE]
> La actualización del Hub incorpora directamente soporte para **Wishlist** y **Comentarios de Alto Valor**, transformando la plataforma en un catalizador para que los creadores de la comunidad alcancen estas 21 metas.
