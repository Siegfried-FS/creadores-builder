# Informe de diseño seguro y análisis de riesgos de amenazas
## Metodología STRIDE, AWS Well-Architected (Pilar de Seguridad) e ISO/IEC 27001:2022

> Proyecto: Hub Comunitario de Creadores Tech (AWS Builder Center LATAM)  
> Dominio objetivo: creadores.awsugplayavicente.com  
> Auditor y diseñador: Roberto Flores Segundo (Siegfried) — Lead Auditor ISO 27001:2022 & AWS Certified Cloud Practitioner  
> Entorno analizado: Desarrollo y pre-producción (Staging local)  
> Costo operativo proyectado: $0.00 USD (Capa gratuita perpetua de AWS)  

## 1. Alcance y objetivo del informe

Este documento establece la línea base de seguridad por diseño (Security by Design) para la plataforma comunitaria de creadores de contenido técnico del AWS User Group Playa Vicente. El propósito es someter la arquitectura a un análisis metódico de modelado de amenazas antes de cualquier despliegue hacia entornos productivos, asegurando trazabilidad auditable, control estricto de accesos y consumo financiero predecible sin incurrir en costos operativos.

El análisis evalúa el flujo completo: desde la interfaz de usuario en el navegador hasta el almacenamiento persistente en Amazon DynamoDB, pasando por la capa de entrega de contenido, la terminación API en Amazon API Gateway HTTP API y la capa de cómputo en AWS Lambda.

## 2. Diagrama de arquitectura y límites de confianza

Para identificar vectores de ataque, se delimitan cuatro zonas de confianza (Trust Boundaries):

1. Zona pública no autenticada: Navegadores web de lectores y visitantes externos.
2. Perímetro de entrega y control: Amazon CloudFront / AWS Amplify Hosting y Amazon API Gateway HTTP API v2.
3. Zona de cómputo serverless: Funciones AWS Lambda (Node.js 20.x) con roles de ejecución IAM dedicados.
4. Zona de datos y persistencia: Tablas de Amazon DynamoDB con cifrado en reposo gestionado por AWS (KMS default).

```
[ Navegador Web / Cliente HTTP ]
             │
      (Límite de Confianza 1: Tráfico Público TLS 1.3)
             │
             ▼
[ Amazon CloudFront / Amplify ] ──────► [ Amazon Cognito / Google Identity ]
             │                                        │
      (Límite de Confianza 2: Validación JWT)        │
             │                                        │
             ▼                                        ▼
[ Amazon API Gateway HTTP API ] ◄─────────────────────┘
             │
      (Límite de Confianza 3: IAM Service-to-Service)
             │
             ▼
[ AWS Lambda (Node.js 20.x) ]
             │
      (Límite de Confianza 4: VPC / IAM Data Access)
             │
             ▼
[ Amazon DynamoDB (Tabla: creadores-articulos) ]
```

## 3. Matriz de análisis de amenazas bajo metodología STRIDE

Se evalúan las seis categorías del modelo STRIDE frente a los componentes de la solución:

### A. Spoofing (Suplantación de identidad)
* Amenaza identificada: Un usuario malicioso envía peticiones directas vía cURL o Postman inyectando un authorId arbitrario en el cuerpo del JSON para publicar, editar o eliminar entradas en nombre de otro creador. Asimismo, manipulación de votos de apoyo en artículos enviando identificadores falsificados.
* Impacto operativo: Pérdida de integridad en la reputación de los autores y distorsión en la contabilización comunitaria de las misiones de AWS Builder Center.
* Mecanismo de mitigación:
  1. En la API pública de lectura (GET), acceso anónimo permitido para indexación y consulta.
  2. En las operaciones de escritura (POST, PUT, DELETE), validación forzosa del token JWT emitido por el proveedor de identidad. El authorId o userId no se toma del cuerpo de la petición, sino de las reclamaciones firmadas (claims) del token (event.requestContext.authorizer.jwt.claims.sub).
  3. En la función de apoyos (toggleLike), verificación de unicidad mediante listas o conjuntos en DynamoDB (likedBy) asegurando que un identificador solo sume un voto.

### B. Tampering (Manipulación de datos no autorizada)
* Amenaza identificada: Alteración de enlaces a perfiles oficiales, inyección de scripts (Cross-Site Scripting persistente) en campos de título, descripción o contenido, y alteración de los contadores de interacción.
* Impacto operativo: Ejecución de scripts maliciosos en los navegadores de los miembros de la comunidad que visitan el hub, con potencial robo de tokens locales de sesión.
* Mecanismo de mitigación:
  1. Validación de esquemas y sanitización estricta tanto en frontend como en el backend mediante expresiones regulares restrictivas (alfanumérico, espacios y puntuación estándar controlada).
  2. Filtrado de URLs permitiendo únicamente protocolos seguros (https://) hacia dominios validados (aws.amazon.com, github.com, linkedin.com, youtube.com).
  3. Inclusión de encabezados HTTP de seguridad en las respuestas: Content-Security-Policy (CSP), X-Frame-Options: DENY, y X-Content-Type-Options: nosniff.

### C. Repudiation (Repudio y falta de trazabilidad)
* Amenaza identificada: Modificación o eliminación de registros sin bitácora que permita determinar qué credencial o identificador ejecutó la acción.
* Impacto operativo: Incumplimiento de controles ISO/IEC 27001:2022 (Control A.8.15 Registro de eventos y Control A.8.16 Actividades de monitoreo).
* Mecanismo de mitigación:
  1. Activación de CloudWatch Logs estructurados en formato JSON para todas las invocaciones de AWS Lambda, registrando fecha, requestId, método HTTP, sub del autor y código de estado.
  2. Uso de AWS CloudTrail para eventos de gestión (Management Events) sin costo, permitiendo auditar cualquier modificación de infraestructura en API Gateway, Lambda o DynamoDB.
  3. Para datos sensibles, registro selectivo de Data Events en CloudTrail únicamente si se integran buckets S3 de alta criticidad, advirtiendo su costo antes de activación generalizada.

### D. Information Disclosure (Divulgación de información sensible)
* Amenaza identificada: Respuestas de error de la base de datos o de la función Lambda que expongan nombres internos de tablas, esquemas, volcados de memoria (stack traces) o variables de entorno.
* Impacto operativo: Recolección de información que facilita vectores de inyección o reconocimiento de debilidades de infraestructura.
* Mecanismo de mitigación:
  1. Bloques try/catch globales en el backend que capturen excepciones internas y devuelvan mensajes de error genéricos y estandarizados (Internal Server Error) al cliente, registrando el detalle técnico exclusivamente en CloudWatch Logs.
  2. Exclusión de variables sensibles en el código fuente mediante el uso de variables de entorno y Secrets Manager cuando existan secretos criptográficos.

### E. Denial of Service y Denial of Wallet (Agotamiento de recursos y costos)
* Amenaza identificada: Un atacante lanza miles de peticiones automatizadas por segundo hacia API Gateway, agotando la cuota mensual gratuita de AWS Lambda (1,000,000 invocaciones) y generando costos imprevistos de lectura y escritura en DynamoDB.
* Impacto operativo: Interrupción del servicio por throttling forzado o cargos imprevistos en la factura de la cuenta AWS.
* Mecanismo de mitigación:
  1. Configuración de Rate Limiting y Burst Limits en la etapa (stage) de API Gateway: límite sostenido de 20 peticiones por segundo y ráfaga de 40 peticiones.
  2. Tabla de DynamoDB configurada en modo provisionado con 25 RCU y 25 WCU (incluido en la capa gratuita perpetua) o modo On-Demand con alarmas de consumo.
  3. Alarma en AWS Budgets a $5.00 USD y $7.00 USD con notificación inmediata, respaldada por un circuito de desconexión (Kill Switch) que reduce la concurrencia reservada a cero ante anomalías.

### F. Elevation of Privilege (Escalamiento de privilegios)
* Amenaza identificada: El rol de IAM asignado a la función Lambda tiene políticas excesivas con comodines (Action: * o Resource: *), permitiendo que una vulnerabilidad en el código sea utilizada para acceder a otros recursos de la cuenta.
* Impacto operativo: Compromiso del perímetro completo de la cuenta AWS.
* Mecanismo de mitigación:
  1. Aplicación estricta del principio de menor privilegio mediante políticas IAM acotadas exclusivamente a las acciones requeridas: dynamodb:GetItem, dynamodb:PutItem, dynamodb:UpdateItem, dynamodb:DeleteItem y dynamodb:Scan sobre el ARN específico de la tabla.
  2. Auditoría continua con AWS IAM Access Analyzer para verificar que el rol no permita delegaciones ni accesos entre cuentas no autorizadas.

## 4. Servicios gratuitos y herramientas de auditoría de AWS

Para mantener la gobernanza y auditoría continua sin gasto financiero, se implementa la siguiente combinación de herramientas nativas:

| Servicio o herramienta | Modelo de costo | Función en la auditoría |
| :--- | :--- | :--- |
| AWS IAM Access Analyzer | 100% gratuito (nativo) | Analiza políticas basadas en recursos y roles IAM para detectar accesos públicos involuntarios y validar sintaxis de menor privilegio. |
| AWS Well-Architected Tool | 100% gratuito (nativo) | Permite registrar y evaluar la carga de trabajo contra el Pilar de Seguridad y el lente Serverless, documentando riesgos de nivel alto y medio. |
| AWS CloudTrail (Management) | Gratuito (últimos 90 días) | Bitácora inmutable de todas las llamadas a la API de administración de AWS en la región. |
| AWS Budgets | 2 alertas gratuitas | Monitoreo continuo de gastos proyectados con envío de alertas por correo electrónico antes de rebasar la capa gratuita. |
| AWS Labs IAM Policy Autopilot | Open source (sin costo) | Herramienta de escaneo estático de código para generar automáticamente la política IAM mínima necesaria sin comodines. |
| AWS Security Hub | Evaluación de 30 días sin costo | Escaneo CSPM inicial para verificar el cumplimiento con los estándares CIS AWS Foundations Benchmark. |

## 5. Matriz de riesgos residuales y plan de tratamiento

Siguiendo el estándar ISO/IEC 27001:2022 (Cláusula 6.1.3 y 8.3), se evalúa el riesgo residual tras aplicar los controles:

| ID | Riesgo analizado | Impacto | Probabilidad | Riesgo inherente | Control compensatorio | Riesgo residual |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-01 | Manipulación de autoría sin autenticación | Alto | Alto | Crítico | Validación de JWT en API Gateway y extracción de sub en Lambda | Bajo |
| R-02 | Consumo desmedido por peticiones masivas | Medio | Medio | Alto | Throttling en API Gateway (20 rps) y Kill Switch a $5 USD | Bajo |
| R-03 | Inyección XSS en comentarios y descripciones | Alto | Medio | Alto | Sanitización bidireccional (frontend y backend) y cabeceras CSP | Bajo |
| R-04 | CORS permisivo universal (*) | Medio | Medio | Medio | Restricción de origen al dominio oficial y localhost de desarrollo | Aceptable |
| R-05 | Sobre-asignación de permisos en rol Lambda | Alto | Bajo | Medio | Política IAM restrictiva al ARN de tabla validada por Access Analyzer | Bajo |

## 6. Conclusiones y recomendaciones para el paso a pre-producción

1. El entorno actual en el repositorio se mantiene como entorno de desarrollo y validación local, sin despliegue activo en la cuenta de producción.
2. La arquitectura diseñada cumple con los requerimientos de costo cero ($0.00 USD) aprovechando la capa gratuita perpetua de DynamoDB, Lambda, API Gateway y CloudFront.
3. El siguiente paso técnico consiste en validar las pruebas unitarias y de integración de la sanitización y la lógica de idempotencia de votos antes de emitir cualquier solicitud de cambio (Pull Request) hacia la rama principal.
