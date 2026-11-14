# Arquitectura AWS Serverless y estrategia de cuentas

> **Proyecto:** Creadores Bootcamp AWS Builder Center  
> **Dominio:** `creadores.awsugplayavicente.com`  
> **Comunidad:** AWS User Group Playa Vicente  
> **Costo Operativo Esperado:** **$0.00 USD / mes (Free Tier Perpetuo)**

---

## 1. Asignación de Cuenta en tu Organización AWS

Dentro de tu estructura de **AWS Organizations**, tienes las siguientes cuentas activas:

| Cuenta | ID | Rol Sugerido | Justificación |
| :--- | :--- | :--- | :--- |
| **`AWSUGPlayaVicente`** | `335596040106` | **Producción (Recomendada)** | • El dominio `awsugplayavicente.com` y sus zonas de Route 53 pertenecen a la comunidad.<br>• Respaldo institucional oficial del User Group.<br>• Blast radius aislado de tus cuentas personales o de auditoría. |
| **`Workshops`** | `116129308808` | **Staging / Pruebas** | • Para experimentar con CDK, Lambdas o esquemas de DynamoDB antes de pasar a la cuenta oficial. |

---

## 2. Estrategia de Etiquetado Obligatorio (FinOps & Auditoría ISO 27001)

Para que puedas rastrear cada milésima de centavo en **AWS Cost Explorer** y aplicar alertas de presupuesto quirúrgicas, todos los recursos creados en la cuenta deben llevar las siguientes etiquetas:

```json
{
  "Project": "creadores-bootcamp",
  "Environment": "production",
  "ManagedBy": "AWSUGPlayaVicente",
  "CostCenter": "community-creadores",
  "Owner": "roberto-flores",
  "Compliance": "ISO27001-Audited"
}
```

> [!TIP]
> Activa **`Project`** y **`CostCenter`** como **Cost Allocation Tags** en la consola de *AWS Billing > Cost allocation tags*. Esto permite filtrar presupuestos y dashboards exclusivamente para esta aplicación.

---

## 3. Servicios AWS Utilizados ($0 USD Free Tier)

```
[ Usuario Navegador ]
         │
         ▼
[ Amazon CloudFront + S3 ] (Hosting Frontend SPA - 1 TB/mes gratis)
         │
         ├──► [ Amazon Cognito User Pool ] (Auth - 50,000 MAU gratis)
         │
         ▼
[ Amazon API Gateway HTTP API ] (1M req/mes gratis)
         │
         ▼
[ AWS Lambda (Node.js/Python) ] (1M invocaciones + 3.2M seg cómputo gratis)
         │
         ▼
[ Amazon DynamoDB ] (Modo Provisioned: 25 WCU + 25 RCU + 25 GB gratis perpetuo)
```

---

## 4. Alertas de Presupuesto y "Kill Switch" Automático ($5 / $7 USD)

### A. Configuración de AWS Budgets
1. Crear un presupuesto mensual de **$10.00 USD** con filtro de tag: `Project = creadores-bootcamp`.
2. **Alerta 1 ($5.00 USD / 50%):** Notificación por correo electrónico y SMS.
3. **Alerta 2 ($7.00 USD / 70%):** Notificación de urgencia.
4. **Alerta Crítica ($10.00 USD / 100%):** Dispara un tema **Amazon SNS (`arn:aws:sns:...:KillSwitchTopic`)**.

---

### B. Lambda de Emergencia: "Circuit Breaker / Kill Switch"

Cuando SNS recibe el evento de superar el presupuesto, invoca esta Lambda con permisos IAM mínimos (`lambda:PutFunctionConcurrency`, `cloudfront:UpdateDistribution`).

```python
import boto3
import os

lambda_client = boto3.client('lambda')
cloudfront_client = boto3.client('cloudfront')

def lambda_handler(event, context):
    print("ALERTA CRITICA DE PRESUPUESTO: Disparando Kill Switch...")
    
    # 1. Poner concurrencia de las Lambdas del backend en 0 (corta ejecuciones a $0 de inmediato)
    backend_functions = [
        os.environ.get('ARTICLES_LAMBDA_NAME', 'creadores-articles-api'),
        os.environ.get('LIKES_LAMBDA_NAME', 'creadores-likes-api')
    ]
    
    for fn in backend_functions:
        try:
            lambda_client.put_function_concurrency(
                FunctionName=fn,
                ReservedConcurrentExecutions=0
            )
            print(f"Concurrencia de {fn} ajustada a 0.")
        except Exception as e:
            print(f"Error ajustando concurrencia en {fn}: {e}")
            
    # NOTA: Los datos en DynamoDB y S3 se conservan intactos.
    # Para rehabilitar el servicio, solo vuelves a subir la concurrencia a 5 o 10.
    return {
        'statusCode': 200,
        'body': 'Kill Switch ejecutado exitosamente. Cómputo detenido.'
    }
```
