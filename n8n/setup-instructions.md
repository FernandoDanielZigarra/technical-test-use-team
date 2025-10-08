# n8n - Guía Rápida de Configuración

## 1. Preparar el entorno
- Asegúrate de tener Docker y Docker Compose instalados.
- Copia las variables desde `.env.example` y define `N8N_BASIC_AUTH_USER` y `N8N_BASIC_AUTH_PASSWORD`.

## 2. Levantar el servicio
```bash
# Desde la raíz del proyecto
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
openssl rand -base64 756 > mongo-keyfile
chmod 400 mongo-keyfile

docker-compose up -d n8n
```

## 3. Acceder y autenticarte
- URL: http://localhost:5678
- Usuario/contraseña: los definidos en `.env` (por defecto `admin / admin_change_me`).

## 4. Importar el workflow
1. Pulsa **Import** en la esquina superior derecha.
2. Selecciona `n8n/workflow.json` desde este repositorio.
3. Confirma con **Import** y verifica que el diagrama se vea completo.

## 5. Configurar credenciales de correo
- El workflow incluido usa el nodo **Gmail**. Si quieres mantenerlo así:
	1. Abre el nodo **Send a message**.
	2. En la sección **Credentials**, crea o selecciona una credencial **Gmail OAuth2**.
	3. Sigue el asistente de n8n para conectar tu cuenta (OAuth o App Password).
- Si prefieres otro proveedor (Mailtrap, SendGrid, SMTP genérico), cambia el tipo de nodo a **Email Send** y configura tus parámetros SMTP.
- Modifica el campo **sendTo** si quieres enviar el CSV a una dirección distinta.

## 6. Activar el flujo
- Haz clic en el switch **Activate** (esquina superior derecha).
- Espera a ver el badge verde “Active”.

## 7. Probar la integración
1. En el frontend, abre un proyecto y pulsa **📤 Exportar Backlog**.
2. Verifica en N8N que el workflow se ejecute correctamente.
3. Comprueba que recibes el correo con el CSV adjunto.

> ℹ️ Las credenciales que vinculas en n8n se guardan en tu instancia local, no en este repositorio ni dentro del `workflow.json`.

> ✅ Listo. N8N queda integrado para exportar tareas automáticamente cuando los usuarios lo soliciten desde la aplicación.