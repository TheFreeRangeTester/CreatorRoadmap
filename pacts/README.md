# Pact Contract Testing

Este directorio contiene los tests de contratos usando [Pact](https://docs.pact.io/) y [PactFlow](https://pactflow.io/) para validar los contratos entre el frontend (consumer) y el backend (provider).

## ¿Qué es Contract Testing?

Contract Testing es una metodología que valida que las interacciones entre servicios (en este caso, frontend y backend) cumplen con un "contrato" acordado. A diferencia de los tests de integración, los contract tests:

- Se ejecutan de forma aislada (no requieren ambos servicios corriendo)
- Validan la estructura de las requests/responses
- Detectan cambios que rompen la compatibilidad antes de desplegar
- Permiten desarrollo independiente de frontend y backend

## Arquitectura

```
Frontend (Consumer) → Genera Contratos → PactFlow → Backend (Provider) Verifica
```

1. **Consumer Tests**: El frontend ejecuta tests que generan contratos definiendo qué espera del backend
2. **PactFlow**: Almacena y gestiona los contratos, proporciona dashboard y reportes
3. **Provider Verification**: El backend verifica que cumple con todos los contratos publicados

## Configuración Inicial

### 1. Configurar PactFlow

#### Paso 1: Crear cuenta en PactFlow

1. Ve a [PactFlow](https://pactflow.io/)
2. Haz clic en **"Try for Free"** o **"Sign Up"**
3. Completa el formulario de registro:
   - Email
   - Nombre de organización
   - Contraseña
4. Confirma tu email si es necesario

#### Paso 2: Obtener el API Token

Una vez que hayas iniciado sesión en PactFlow:

1. **Accede a Settings (Configuración)**:
   - Haz clic en tu avatar/perfil en la esquina superior derecha
   - Selecciona **"Settings"** o **"API Tokens"**

2. **Crear un nuevo token**:
   - Haz clic en **"Create API Token"** o **"New Token"**
   - Asigna un nombre descriptivo (ej: "CreatorRoadmap Local Dev")
   - Selecciona los permisos necesarios:
     - ✅ **Read & Write** (para publicar y verificar contratos)
     - ✅ **Can I Deploy** (para verificar despliegues)
   - Haz clic en **"Create"** o **"Generate"**

3. **Copiar el token**:
   - ⚠️ **IMPORTANTE**: El token se muestra **solo una vez**
   - Copia el token inmediatamente y guárdalo en un lugar seguro
   - Si lo pierdes, tendrás que crear uno nuevo

4. **Obtener la URL de tu organización**:
   - La URL será algo como: `https://tu-organizacion.pactflow.io`
   - Puedes verla en la barra de direcciones del navegador o en la configuración

#### Paso 3: Configurar variables de entorno

Crea o actualiza tu archivo `.env` en la raíz del proyecto:

```bash
# PactFlow Configuration
PACT_BROKER_BASE_URL=https://tu-organizacion.pactflow.io
PACT_BROKER_TOKEN=tu_token_copiado_aqui
```

**Ejemplo real:**
```bash
PACT_BROKER_BASE_URL=https://mycompany.pactflow.io
PACT_BROKER_TOKEN=abc123xyz789...
```

⚠️ **Seguridad**: 
- **NUNCA** commitees el archivo `.env` al repositorio
- El archivo `.env` ya está en `.gitignore`
- Para CI/CD, usa variables de entorno secretas en tu plataforma (GitHub Secrets, GitLab CI Variables, etc.)

### 2. Estructura de Directorios

```
pacts/
  ├── contracts/          # Contratos generados (gitignored)
  ├── consumer-tests/    # Tests del consumer (frontend)
  │   ├── setup.ts
  │   ├── helpers.ts
  │   ├── auth.contract.test.ts
  │   ├── ideas.contract.test.ts
  │   ├── user.contract.test.ts
  │   ├── creators.contract.test.ts
  │   └── store.contract.test.ts
  ├── provider-tests/     # Tests del provider (backend)
  │   ├── setup.ts
  │   ├── state-handlers.ts
  │   └── verify.contracts.test.ts
  ├── pact-setup.ts      # Configuración compartida
  └── README.md          # Esta documentación
```

## Ejecutar Tests

### Tests del Consumer (Frontend)

Ejecuta los tests del consumer que generan los contratos:

```bash
npm run test:pact:consumer
```

Esto:
1. Ejecuta los tests del consumer
2. Genera archivos de contrato en `pacts/contracts/`
3. Publica automáticamente los contratos a PactFlow

### Verificación del Provider (Backend)

Ejecuta la verificación de contratos desde PactFlow:

```bash
npm run test:pact:provider
```

Esto:
1. Inicia el servidor Express en modo test
2. Obtiene contratos desde PactFlow
3. Verifica que el backend cumple con todos los contratos
4. Publica los resultados de verificación a PactFlow

### Ejecutar Todo

```bash
npm run test:pact:all
```

Ejecuta consumer y provider en secuencia.

## Ver Reportes en PactFlow

1. Accede a tu dashboard de PactFlow: `https://tu-org.pactflow.io`
2. Navega a la sección "Pacts" para ver todos los contratos
3. Revisa el estado de verificación de cada contrato
4. Usa el dashboard para identificar qué cambios rompen contratos

## Agregar Nuevos Contratos

### 1. Crear Test del Consumer

Crea un nuevo archivo en `pacts/consumer-tests/` o agrega tests a un archivo existente:

```typescript
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { Matchers } from '@pact-foundation/pact';
import { createPact, publishContracts, MOCK_SERVER_URL } from './setup';

describe('Nuevo Endpoint Contract', () => {
  const pact = createPact();

  beforeAll(() => pact.setup());
  afterAll(async () => {
    await pact.finalize();
    if (process.env.PACT_BROKER_BASE_URL) {
      await publishContracts();
    }
  });

  it('should handle new endpoint', async () => {
    await pact.addInteraction({
      state: 'required state',
      uponReceiving: 'a request to new endpoint',
      withRequest: {
        method: 'GET',
        path: '/api/new-endpoint',
      },
      willRespondWith: {
        status: 200,
        body: {
          data: Matchers.string(),
        },
      },
    });

    const response = await fetch(`${MOCK_SERVER_URL}/api/new-endpoint`);
    expect(response.status).toBe(200);
  });
});
```

### 2. Agregar State Handler (si es necesario)

Si el nuevo contrato requiere un estado específico, agrega el handler en `pacts/provider-tests/state-handlers.ts`:

```typescript
export const stateHandlers: Record<string, () => Promise<void>> = {
  'required state': async () => {
    // Setup necesario para este estado
  },
  // ... otros handlers
};
```

### 3. Ejecutar y Verificar

```bash
# Generar contrato
npm run test:pact:consumer

# Verificar que el provider cumple
npm run test:pact:provider
```

## Interpretar Reportes de PactFlow

### Estados de Contratos

- ✅ **Verified**: El provider cumple con el contrato
- ❌ **Failed**: El provider no cumple (cambios incompatibles)
- ⏳ **Pending**: Contrato nuevo, aún no verificado
- 🔄 **Changed**: Contrato modificado, requiere nueva verificación

### Can I Deploy?

Usa el comando `pact:can-i-deploy` para verificar si es seguro desplegar:

```bash
npm run pact:can-i-deploy
```

Esto verifica que todas las versiones de consumer y provider son compatibles.

## Integración con CI/CD

### GitHub Actions Example

```yaml
- name: Run Pact Consumer Tests
  run: npm run test:pact:consumer
  env:
    PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_BASE_URL }}
    PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

- name: Verify Pact Contracts
  run: npm run test:pact:provider
  env:
    PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_BASE_URL }}
    PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Troubleshooting

### Error: "PACT_BROKER_BASE_URL environment variable is required"

Asegúrate de tener las variables de entorno configuradas en tu `.env` o en CI.

### Error: "Contract verification failed"

1. Revisa los logs en `pacts/logs/`
2. Verifica en PactFlow qué interacciones fallaron
3. Compara la respuesta real del provider con lo esperado en el contrato
4. Actualiza el contrato o corrige el provider según corresponda

### Los contratos no se publican

- Verifica que `PACT_BROKER_TOKEN` es válido
- Revisa que la URL de PactFlow es correcta
- Comprueba los logs para ver errores de autenticación

### El provider no puede obtener contratos

- Verifica que los contratos fueron publicados correctamente
- Revisa que el consumer y provider names coinciden
- Asegúrate de que el token tiene permisos de lectura

## Mejores Prácticas

1. **Mantén los contratos actualizados**: Cuando cambies la API, actualiza los contratos
2. **Usa matchers flexibles**: Usa `Matchers.string()` en lugar de valores hardcodeados cuando sea posible
3. **Agrupa tests relacionados**: Mantén tests de un mismo endpoint en el mismo archivo
4. **Documenta estados complejos**: Agrega comentarios en state handlers complejos
5. **Revisa PactFlow regularmente**: El dashboard te ayuda a identificar problemas temprano

## Recursos

- [Documentación de Pact](https://docs.pact.io/)
- [PactFlow Dashboard](https://pactflow.io/)
- [Pact JS Documentation](https://github.com/pact-foundation/pact-js)

