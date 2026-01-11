# Guía de Configuración de PactFlow - Paso a Paso

Esta guía te ayudará a configurar PactFlow desde cero para usar Contract Testing en CreatorRoadmap.

## 📋 Requisitos Previos

- Una cuenta de email
- Acceso a internet
- Node.js y npm instalados (ya los tienes si estás trabajando en este proyecto)

## 🚀 Proceso Completo

### Paso 1: Crear Cuenta en PactFlow

1. **Visita PactFlow**:
   - Abre tu navegador y ve a: https://pactflow.io/
   - Haz clic en el botón **"Try for Free"** o **"Get Started"**

2. **Completa el registro**:
   - Ingresa tu **email**
   - Crea una **contraseña segura**
   - Ingresa el **nombre de tu organización** (puede ser tu nombre personal o el de tu empresa)
   - Acepta los términos y condiciones
   - Haz clic en **"Sign Up"** o **"Create Account"**

3. **Verifica tu email** (si es necesario):
   - Revisa tu bandeja de entrada
   - Haz clic en el enlace de verificación

4. **Inicia sesión**:
   - Una vez verificado, inicia sesión con tus credenciales

### Paso 2: Obtener tu URL de Organización

1. **Identifica tu URL**:
   - Una vez dentro del dashboard, mira la barra de direcciones
   - Tu URL será algo como: `https://mi-organizacion.pactflow.io`
   - O puedes verla en la configuración de tu perfil

2. **Anota esta URL**, la necesitarás para la configuración

### Paso 3: Crear API Token

1. **Accede a la configuración de tokens**:
   - Haz clic en tu **avatar/perfil** (esquina superior derecha)
   - Selecciona **"Settings"** o **"API Tokens"** del menú
   - O ve directamente a: `https://tu-org.pactflow.io/settings/api-tokens`

2. **Crear nuevo token**:
   - Haz clic en el botón **"Create API Token"** o **"New Token"**
   - Completa el formulario:
     - **Name**: `CreatorRoadmap Local Development` (o el nombre que prefieras)
     - **Description** (opcional): "Token para desarrollo local de CreatorRoadmap"
     - **Permissions**: Selecciona **"Read & Write"** (necesitas esto para publicar y verificar contratos)
   - Haz clic en **"Create Token"** o **"Generate"**

3. **⚠️ IMPORTANTE - Copiar el token**:
   - PactFlow mostrará el token **solo una vez**
   - Se verá algo como: `abc123def456ghi789...`
   - **Copia el token completo inmediatamente**
   - Guárdalo en un lugar seguro (gestor de contraseñas, notas seguras, etc.)
   - Si cierras esta ventana sin copiarlo, tendrás que crear un nuevo token

4. **Verificar que el token fue creado**:
   - Deberías ver el token listado en la página de API Tokens
   - Nota: Solo verás el nombre y fecha de creación, NO el valor del token (por seguridad)

### Paso 4: Configurar Variables de Entorno

1. **Crear/editar archivo `.env`**:
   - En la raíz del proyecto, crea o edita el archivo `.env`
   - Si no existe, créalo: `touch .env`

2. **Agregar las variables**:
   ```bash
   # PactFlow Configuration
   PACT_BROKER_BASE_URL=https://tu-organizacion.pactflow.io
   PACT_BROKER_TOKEN=tu_token_copiado_aqui
   ```

3. **Ejemplo real** (reemplaza con tus valores):
   ```bash
   PACT_BROKER_BASE_URL=https://mycompany.pactflow.io
   PACT_BROKER_TOKEN=abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567
   ```

4. **Verificar que el archivo está en `.gitignore`**:
   - El archivo `.env` ya está configurado para ser ignorado por git
   - Esto es importante para no exponer tus credenciales

### Paso 5: Verificar la Configuración

1. **Verificar que las variables están cargadas**:
   ```bash
   # En la terminal, desde la raíz del proyecto
   node -e "require('dotenv').config(); console.log('URL:', process.env.PACT_BROKER_BASE_URL); console.log('Token:', process.env.PACT_BROKER_TOKEN ? '✅ Configurado' : '❌ No configurado');"
   ```

2. **Probar la conexión** (opcional):
   ```bash
   # Esto intentará conectarse a PactFlow
   npm run test:pact:consumer
   ```

## 🔒 Seguridad

### ✅ Buenas Prácticas

- ✅ **NUNCA** commitees el archivo `.env` al repositorio
- ✅ Usa tokens con permisos mínimos necesarios
- ✅ Rota los tokens periódicamente (cada 3-6 meses)
- ✅ Usa diferentes tokens para desarrollo local vs CI/CD
- ✅ Si un token se compromete, revócalo inmediatamente

### ❌ Qué NO hacer

- ❌ No compartas tokens en chats, emails o documentos públicos
- ❌ No hardcodees tokens en el código
- ❌ No uses el mismo token para múltiples proyectos sin necesidad
- ❌ No dejes tokens en logs o mensajes de error

## 🐛 Troubleshooting

### Error: "PACT_BROKER_BASE_URL environment variable is required"

**Solución**: Verifica que el archivo `.env` existe y contiene `PACT_BROKER_BASE_URL`

### Error: "PACT_BROKER_TOKEN environment variable is required"

**Solución**: Verifica que el archivo `.env` contiene `PACT_BROKER_TOKEN` con el valor correcto

### Error: "Authentication failed" o "401 Unauthorized"

**Causas posibles**:
- El token es incorrecto o fue revocado
- El token no tiene los permisos necesarios
- La URL de PactFlow es incorrecta

**Solución**:
1. Verifica que copiaste el token completo (sin espacios)
2. Crea un nuevo token si es necesario
3. Verifica que la URL es correcta (debe terminar en `.pactflow.io`)

### Error: "Cannot connect to PactFlow"

**Causas posibles**:
- Problemas de red
- URL incorrecta
- PactFlow está caído (poco probable)

**Solución**:
1. Verifica tu conexión a internet
2. Verifica que la URL es correcta
3. Intenta acceder a PactFlow desde el navegador

## 📚 Recursos Adicionales

- [Documentación oficial de PactFlow](https://docs.pactflow.io/)
- [Guía de API Tokens](https://docs.pactflow.io/docs/getting-started/api-tokens)
- [Dashboard de PactFlow](https://pactflow.io/dashboard)

## ✅ Checklist de Configuración

- [ ] Cuenta creada en PactFlow
- [ ] URL de organización identificada
- [ ] API Token creado y copiado
- [ ] Variables de entorno configuradas en `.env`
- [ ] Verificación de configuración exitosa
- [ ] Primer test ejecutado correctamente

---

**¿Necesitas ayuda?** Revisa la sección de Troubleshooting o consulta la documentación oficial de PactFlow.

