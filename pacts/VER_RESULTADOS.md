# 📊 Cómo Ver los Resultados en PactFlow

## 🚀 Acceso Rápido

**Tu URL de PactFlow:** https://free-range-testers.pactflow.io

**Contrato publicado:** https://free-range-testers.pactflow.io/pacts/provider/CreatorRoadmap-Backend/consumer/CreatorRoadmap-Frontend

## 📍 Dónde Ver los Resultados

### 1. **Dashboard Principal**
- URL: https://free-range-testers.pactflow.io
- Aquí verás un resumen de todos tus contratos y su estado de verificación

### 2. **Página de Contratos (Pacts)**
- URL: https://free-range-testers.pactflow.io/pacts
- Muestra todos los contratos entre consumers y providers
- Puedes filtrar por:
  - Consumer: `CreatorRoadmap-Frontend`
  - Provider: `CreatorRoadmap-Backend`
  - Estado de verificación (Verified, Failed, Pending)

### 3. **Vista de Contrato Específico**
- URL: https://free-range-testers.pactflow.io/pacts/provider/CreatorRoadmap-Backend/consumer/CreatorRoadmap-Frontend
- Muestra:
  - Todas las versiones del contrato
  - Estado de verificación de cada versión
  - Diferencias entre versiones
  - Historial de cambios

### 4. **Matrix de Compatibilidad**
- URL: https://free-range-testers.pactflow.io/matrix
- Muestra qué versiones de consumer y provider son compatibles
- Útil para verificar si es seguro desplegar

### 5. **Can I Deploy?**
- URL: https://free-range-testers.pactflow.io/can-i-deploy
- Verifica si es seguro desplegar una versión específica
- También puedes usar el comando CLI:
  ```bash
  npm run pact:can-i-deploy
  ```

## 🔍 Información que Verás

### Estados de Contratos
- ✅ **Verified**: El provider cumple con el contrato
- ❌ **Failed**: El provider no cumple (cambios incompatibles)
- ⏳ **Pending**: Contrato nuevo, aún no verificado
- 🔄 **Changed**: Contrato modificado, requiere nueva verificación

### Detalles del Contrato
- **Interacciones**: Todas las requests/responses definidas
- **Matchers**: Qué campos son flexibles vs. exactos
- **Versiones**: Historial de cambios del contrato
- **Verificaciones**: Resultados de las verificaciones del provider

## 📤 Publicar Contratos

### Automáticamente (después de tests)
Los contratos se publican automáticamente cuando ejecutas:
```bash
npm run test:pact:consumer
```
(Solo si `PACT_BROKER_BASE_URL` está configurado en `.env`)

### Manualmente
Si quieres publicar manualmente:
```bash
npm run pact:publish
```

## 🔐 Autenticación

Para acceder a PactFlow, necesitas:
1. Tu cuenta de PactFlow (la misma que usaste para crear el token)
2. El token está guardado en tu `.env` (no lo compartas)

## 📊 Ejemplo de Navegación

1. **Ir al Dashboard**: https://free-range-testers.pactflow.io
2. **Click en "Pacts"** en el menú superior
3. **Filtrar por Consumer**: `CreatorRoadmap-Frontend`
4. **Ver detalles** del contrato haciendo click
5. **Revisar verificaciones** en la pestaña "Verifications"

## 🎯 Próximos Pasos

1. **Configurar Provider Verification**: Ejecuta `npm run test:pact:provider` para verificar que el backend cumple con los contratos
2. **Configurar Webhooks**: Para que PactFlow notifique automáticamente cuando cambien los contratos
3. **Integrar con CI/CD**: Para publicar y verificar contratos automáticamente en cada commit

## 📝 Notas

- Los contratos se publican con la versión del commit git (o versión del package.json)
- Los tags se basan en la rama de git actual
- Cada vez que ejecutas los tests, se genera un nuevo contrato si hay cambios

