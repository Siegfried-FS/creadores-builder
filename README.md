# 🦎 Hub Comunitario de Creadores & Misiones — AWS Builder Center LATAM
> **Iniciativa de apoyo mutuo para creadores técnicos y participantes del programa de misiones de AWS Builder Center**  
> Desarrollado por **AWS User Group Playa Vicente** con arquitectura 100% Serverless ($0.00 USD de costo operativo).  
> **Comunidad & Eventos:** [https://linktr.ee/awsusergroupplayavicente](https://linktr.ee/awsusergroupplayavicente) | **Sitio en vivo:** [https://creadores.awsugplayavicente.com](https://creadores.awsugplayavicente.com)

---

## 🎯 ¿Qué es este proyecto y qué resuelve?

En la comunidad de **AWS Builder Center** y en el programa de creadores de LATAM, los builders enfrentan dos grandes retos:
1. **Pérdida de visibilidad:** Muchos artículos de valor, propuestas en la lista de deseos (**Wishlist**) y debates técnicos se pierden en el feed general sin recibir la retroalimentación que merecen.
2. **El reto de las 21 Misiones de AWS Builder Center:** Para que los estudiantes y creadores desbloqueen los hitos del programa (hasta **$30 USD en créditos AWS** y un **voucher del 100% para certificación AWS Foundational**), es obligatorio acumular lecturas, votos en Wishlist y likes en comentarios de valor.

Este **Hub Comunitario** centraliza todo el esfuerzo colectivo en un solo lugar:
* 📝 **Artículos Técnicos:** Comparte guías, tutoriales y casos reales para recibir lecturas y difusión en LinkedIn/Instagram.
* 💡 **Wishlist de AWS:** Propón ideas de nuevas funcionalidades para los servicios de AWS (`https://builder.aws.com/wishlist/...`) y recibe votos comunitarios para que los Product Managers de AWS escuchen las necesidades de LATAM.
* 💬 **Comentarios de Alto Valor (Feedback & Debate):** Comparte enlaces directos a hilos de discusión (`https://builder.aws.com/comment/...#comments`). Bajo la filosofía *"Cero comentarios vacíos tipo 'nice post'"*, fomentamos preguntas técnicas, análisis de arquitectura y lecciones de experiencia real.
* 🗄️ **Publicaciones Permanentes:** A diferencia de la versión inicial con expiración de 30 días, ahora todas las publicaciones son **permanentes**, conservando la memoria histórica y el portafolio de cada creador.
* ❤️ **Checklist personal de apoyo:** Cada usuario lleva el control de qué publicaciones ya apoyó y cuáles tiene pendientes.

---

## 🎖️ Estrategia: Las 21 Misiones de AWS Builder Center

El programa de gamificación de AWS Builder Center premia el compromiso activo con recompensas acumulativas:
* **Hito 1 (7 Insignias):** $10 USD en Créditos de AWS.
* **Hito 2 (14 Insignias):** $20 USD adicionales en Créditos de AWS ($30 USD acumulados).
* **Hito 3 (21 Insignias):** Voucher oficial del 100% para examen de certificación AWS Foundational (CLF-C02 o AIF-C01, $100 USD de valor).

### ¿Cómo ayuda el Hub a desbloquearlas?
1. **Insignias de Arranque (Día 1):** Registro de perfil, avatar y publicación del primer artículo y primer deseo en Wishlist.
2. **Insignias de Racha (Streaks):** Votación semanal en la Wishlist y aportes continuos durante 30 y 90 días.
3. **Insignias de Impacto Comunitario (Peer Interaction):**
   * *Conversation Starter:* Comentarios que reciben respuestas de otros miembros.
   * *Idea Influencer:* Votos acumulados en tus deseos de Wishlist.
   * *Meaningful Contributor:* Likes recibidos en tus comentarios sustanciales.
   * *Valued Creator:* Likes recibidos en tus artículos técnicos.

---

## 🏗️ Arquitectura Serverless ($0.00 USD en Free Tier)

Todo el sistema está optimizado para operar permanentemente sin costos de infraestructura:

```
[ Navegador del Creador / Visitante ]
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
               • Persistencia: Permanente (Sin expiración forzada)
```

---

## 🛡️ Auditoría de Seguridad & DevSecOps (Lead Auditor ISO 27001)

El proyecto cuenta con un informe de seguridad técnico detallado:  
📄 **[AUDITORIA_SEGURIDAD_OWASP.md](file:///home/siegfried_fs/Documents/proyectos/creadores-builder/AUDITORIA_SEGURIDAD_OWASP.md)**

### Hallazgos clave documentados para estudio y remediación:
1. **OWASP API2:2023 (Broken Authentication):** La Lambda actual no verifica criptográficamente el JWT en `POST/PUT/DELETE`; confía en el campo `authorId` del payload JSON. Remediación: Implementar JWT Authorizer en API Gateway v2 conectado a Cognito o Google.
2. **OWASP API1:2023 (BOLA / IDOR):** Al estar expuesto el `authorId`, un actor externo podría intentar modificar o borrar registros de otros creadores. Remediación: Extraer el `sub` directamente del token verificado por el Authorizer.
3. **OWASP API8:2023 (CORS Permisivo):** Restringir `Access-Control-Allow-Origin` únicamente al dominio de producción y desarrollo local.
4. **Honeypot en Consola (F12) y Rutas Administrativas:** Trampas educativas para visitantes curiosos que intentan inyecciones SQL o accesos a `/admin/` o `/.env`.

---

## 💻 Desarrollo Local y Pasos de Ejecución

```bash
# 1. Clonar el repositorio y entrar al proyecto
cd creadores-builder

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env)
cp .env.example .env

# 4. Iniciar servidor local
npm run dev

# 5. Compilar para producción (TypeScript + Vite)
npm run build
```

---

## 🌐 Enlaces Oficiales de la Comunidad
* **Linktree Maestro (Eventos, Meetups, Redes):** [https://linktr.ee/awsusergroupplayavicente](https://linktr.ee/awsusergroupplayavicente)
* **Portal Oficial:** [https://awsugplayavicente.com](https://awsugplayavicente.com)
* **Canal de Telegram:** [https://t.me/AUGPlayaVicente](https://t.me/AUGPlayaVicente)
* **Comunidad de WhatsApp:** [https://chat.whatsapp.com/KXQYW7V00q12cSoeijob4h](https://chat.whatsapp.com/KXQYW7V00q12cSoeijob4h)
