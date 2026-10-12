# 🦎 Hub Comunitario de Creadores — AWS Builder Center LATAM
> **Iniciativa de apoyo mutuo para los participantes del Bootcamp de Creación de Contenido Tech LATAM 2026**  
> Desarrollado por **AWS User Group Playa Vicente** con arquitectura 100% Serverless ($0.00 USD de costo operativo).

---

## 🎯 ¿Qué es este proyecto y por qué existe?

En el **Bootcamp de Creadores de Contenido Tech LATAM 2026** (AWS Builder Center), muchos participantes comparten sus artículos técnicos en LinkedIn y en la plataforma de AWS, pero a veces los posts se pierden en el feed o no sabemos a quiénes ya apoyamos con lecturas, likes y reposts.

Este **Hub Comunitario** resuelve ese problema de raíz:
1. **Un solo lugar centralizado:** Cada creador registra el enlace oficial de su post en AWS Builder Center y su publicación de difusión en LinkedIn o Instagram.
2. **Checklist personal de apoyo:** Cada miembro inicia sesión y tiene su propio panel interactivo para marcar qué artículos ya apoyó y cuáles tiene pendientes, con una barra de progreso que motiva el apoyo mutuo.
3. **Cero posts eternos (Vigencia de 30 días deslizantes):** Para mantener el contenido siempre fresco y dinámico, cada artículo vive exactamente **30 días continuos** en el Hub. Mediante la funcionalidad nativa de **TTL (Time to Live) en Amazon DynamoDB**, los posts antiguos se depuran de forma automática sin necesidad de intervención manual ni costos residuales.

---

## 🏗️ Arquitectura Serverless ($0.00 USD en Free Tier)

Siguiendo el principio de **cuidado del bolsillo** de nuestra comunidad, todo el sistema está diseñado para operar permanentemente sin costos de infraestructura:

```
[ Navegador del Usuario / Creador ]
        │
        ├─► [ Google OAuth 2.0 / Cognito ]  --> Autenticación oficial sin contraseñas locales
        │
        ├─► [ Amazon CloudFront / Amplify ]  --> Entrega de la SPA (React + Vite)
        │
        └─► [ Amazon API Gateway HTTP API v2 ]
                    │  (CORS + HTTP/2 nativo)
                    ▼
            [ AWS Lambda (Node.js 20.x) ]
                    │  (Mínimo privilegio IAM)
                    ▼
            [ Amazon DynamoDB NoSQL ]
               • Tabla: creadores-builder-articles
               • Facturación: On-Demand (PAY_PER_REQUEST)
               • TTL automático: 30 días deslizantes por artículo
```

### Componentes de AWS Desplegados y Activos:
* **Persistencia:** Tabla Amazon DynamoDB `creadores-builder-articles` en `us-east-1`, con modo de facturación `PAY_PER_REQUEST` ($0.00 USD en reposo) y atributo TTL `ttl`.
* **Backend Serverless:** Función AWS Lambda `creadores-builder-api` (Node.js 20.x, arquitectura ligera con AWS SDK v3) integrada con **Amazon API Gateway HTTP API v2** (`https://6qxtspu588.execute-api.us-east-1.amazonaws.com`).
* **Seguridad IAM:** Rol dedicado `creadores-builder-lambda-role` con políticas estrictas de menor privilegio limitadas únicamente a la tabla de DynamoDB y CloudWatch Logs.
* **Autenticación Federada:** Google Identity Services (`VITE_GOOGLE_CLIENT_ID`) con dominios autorizados y User Pool de respaldo en Amazon Cognito (`us-east-1_5oIhdYrO6`).

---

## 🔒 Seguridad Práctica (Sello AWS UG Playa Vicente)

Inspirado en la cultura de ciberseguridad y auditoría del grupo de usuarios:
* **Honeypot en Consola de Desarrollador:** Si alguien abre la consola del navegador (`F12`), es recibido con un banner ASCII oficial de bienvenida y detalles educativos de la arquitectura.
* **Auditoría de Entradas en Tiempo Real:** Si un curioso intenta inyectar patrones SQL (`union select`, `' or 1=1 --`), scripts XSS (`<script>`, `alert(`) o escaneo de rutas administrativas (`/admin`, `/wp-admin`, `/.env`) en la URL o en el buscador, la aplicación emite explicaciones pedagógicas sobre por qué DynamoDB NoSQL y React sanitizado neutralizan estos vectores.
* **Límites Estrictos Anti-Desbordamiento:**
  * **Título del Artículo:** Máximo 120 caracteres con contador en vivo.
  * **Resumen / Aprendizaje:** Máximo 220 caracteres con contador en vivo y `line-clamp-3` en tarjeta.
  * **Nombre de Autor:** Máximo 50 caracteres.
  * **Biografía / Rol de Autor:** Máximo 100 caracteres.
* **Autorización de Autor (Ownership):** Solo el creador que registró un artículo puede ver los botones para **editarlo (`Pencil`)** o **eliminarlo (`Trash2`)**.

---

## 📋 Checklist de Producción: ¿Se puede publicar ya?

### ✅ Lo que ya está 100% probado y funcionando:
* [x] **Base de datos DynamoDB activa y conectada** con la API Serverless en AWS.
* [x] **Endpoints funcionales** de creación (`POST`), consulta (`GET`), edición (`PUT`), eliminación (`DELETE`) y likes atómicos (`POST /like`).
* [x] **Resiliencia offline / fallback**: si la red falla, la aplicación respalda y lee automáticamente desde `localStorage` sin romperse.
* [x] **Autenticación oficial con Google** y configuración de avatar personalizado (subida de imagen o iguana oficial).
* [x] **Checklist individual de apoyos** persistido por usuario.
* [x] **Navegación fluida**: el clic en la mascota arriba devuelve suavemente al inicio del Hub, con botón independiente hacia el portal de la comunidad.
* [x] **Build de TypeScript y Vite limpio** (tiempo de compilación < 1 segundo, 0 errores).

### 🚀 Pasos finales únicamente para desplegar a la nube pública:
1. **Subir commits a la nube:**
   ```bash
   git push origin zanpakuto
   ```
2. **Configurar variables en AWS Amplify Hosting:**
   * `VITE_API_URL` = `https://6qxtspu588.execute-api.us-east-1.amazonaws.com`
   * `VITE_GOOGLE_CLIENT_ID` = `580534439118-64h777puf0v0hadj0bim58vhh52jq1n3.apps.googleusercontent.com`
3. **Vincular subdominio en Route 53 (opcional):**
   * Apuntar `creadores.awsugplayavicente.com` a la aplicación de Amplify en la zona DNS existente `Z08742531Y1VDAVQC9IHG`.

---

## 💻 Desarrollo Local

```bash
# 1. Clonar el repositorio y entrar al proyecto
cd creadores-builder

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env)
cp .env.example .env

# 4. Iniciar servidor local
npm run dev

# 5. Compilar para producción
npm run build
```

---

## 🤝 Filosofía Editorial (Bootcamp de Creadores)
* **Conectar > Impresionar:** Hablamos con humildad, transparencia y curiosidad, de builder a builder. Cero lenguaje inflado o corporativo.
* **Experiencias Reales:** Compartimos qué construimos, qué se rompió en el camino y qué aprendimos tras bambalinas.
* **Comunidad:** Si participas en el Bootcamp de Creación de Contenido LATAM, publica tu artículo y apoya el de tus compañeros.
