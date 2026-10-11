# 🚀 Creadores AWS Builder Center — AWS UG Playa Vicente

Plataforma comunitaria de apoyo mutuo y checklist interactivo (To-Do) para los miembros del **Bootcamp de Creación de Contenido LATAM** y la comunidad de **AWS Builder Center**.

Destinado al subdominio oficial: **`creadores.awsugplayavicente.com`**.

---

## 🌟 Características Implementadas

1. **Checklist To-Do de Apoyo Comunitario:**
   * Barra de progreso en tiempo real: *"Has apoyado X de Y artículos (Z%)"*.
   * Botón interactivo: `[ Dar apoyo / Marcar como leído ]` ➔ `[ ✅ Ya apoyé este artículo ]`.
   * Pestañas de filtrado rápido: **Todos**, **Mis pendientes por apoyar** y **Ya apoyados por mí**.
   * Impide volver a dar like duplicado y mantiene el control individual de cada participante.

2. **Categorías Oficiales de AWS Community Builders:**
   * Dropdown y filtros para las **10 categorías oficiales de AWS**:
     * *Security, Identity & Compliance*
     * *Serverless*
     * *Generative AI & Machine Learning*
     * *Cloud Operations*
     * *Containers*
     * *Data & Analytics*
     * *Developer Tools*
     * *Front-End Web & Mobile*
     * *Networking & Content Delivery*
     * *Storage*

3. **Sanitización y Autocompletado de URLs:**
   * **Builder Center:** Escribir `@siegfried_fs` genera automáticamente `https://community.aws/@siegfried_fs`.
   * **Instagram:** Elimina `@` y genera `https://instagram.com/usuario`.
   * **LinkedIn:** Admite slug (`in/usuario`) o enlace completo.
   * **Validación de Artículos:** Solo permite links de dominios oficiales de AWS (`community.aws`, `builder.aws.com`).

4. **Identidad Oficial AWS UG Playa Vicente:**
   * Mascota de la iguana oficial (`mascot_opt.png`) integrada en Navbar, favicon y footer.
   * Paleta de colores oficial, tipografía Inter + Space Grotesk, y soporte de Modo Claro / Modo Oscuro.

5. **Control de Autoría (Ownership):**
   * Preparado para integración con JWT de **AWS Cognito** (`sub`).
   * Solo el creador de un artículo puede editarlo o eliminarlo de la lista.

---

## 🛠️ Tecnologías

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
* **Infraestructura Sugerida:** AWS Serverless ($0.00 USD Free Tier):
  * **Auth:** AWS Cognito User Pools (50,000 MAU gratis).
  * **Base de Datos:** Amazon DynamoDB (25 GB gratis de por vida).
  * **Backend API:** AWS Lambda + Amazon API Gateway HTTP.
  * **Hosting:** CloudFront + S3 o AWS Amplify Hosting.

---

## 🏃‍♂️ Cómo Ejecutar en Local

```bash
# Instalar dependencias (ya instaladas)
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 🛡️ Documentación de Arquitectura y Costos
Consulta [AWS_ARCHITECTURE.md](./AWS_ARCHITECTURE.md) para ver la estrategia multicuenta en AWS Organizations (`AWSUGPlayaVicente`), políticas de etiquetado y el **Kill Switch automático** para presupuestos de $5 a $10 USD.
