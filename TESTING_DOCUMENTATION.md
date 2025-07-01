# Documentación Completa de Unit Testing - Fanlist

## Resumen

Se ha implementado una suite completa de unit tests que apunta a alcanzar **90% de cobertura** para el proyecto Fanlist. Este documento proporciona una guía completa sobre la configuración de testing, las mejores prácticas implementadas y cómo ejecutar las pruebas.

## Configuración de Testing

### Jest Configuration

El proyecto utiliza Jest con TypeScript para testing comprehensivo:

- **Framework**: Jest con ts-jest preset
- **Entorno**: jsdom para testing de componentes React
- **Cobertura objetivo**: 90% en branches, functions, lines y statements
- **Setup**: Configuración automática con mocks y utilidades globales

### Archivos de Configuración

#### `jest.config.js`
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/client/src', '<rootDir>/server', '<rootDir>/shared'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  // ... configuración adicional
}
```

#### `jest.setup.js`
- Configuración global de mocks
- Setup de testing-library/jest-dom
- Mocks de APIs del navegador (fetch, localStorage, etc.)
- Configuración de entorno de testing

## Estructura de Tests

### 1. Tests de Schemas (`shared/__tests__/`)

#### `schema.test.ts`
**Cobertura**: Validación completa de todos los schemas Zod

**Casos de prueba principales**:
- ✅ Validación de schemas de usuarios (`insertUserSchema`, `userResponseSchema`)
- ✅ Validación de schemas de ideas (`insertIdeaSchema`, `suggestIdeaSchema`)
- ✅ Validación de schemas de votación (`insertVoteSchema`)
- ✅ Validación de schemas de enlaces públicos
- ✅ Validación de schemas de perfil y suscripciones
- ✅ Casos edge: datos inválidos, campos requeridos, límites de longitud

**Beneficios**:
- Garantiza integridad de datos
- Previene errores de validación en producción
- Documenta reglas de negocio a través de tests

### 2. Tests de Servidor (`server/__tests__/`)

#### `storage.test.ts`
**Cobertura**: Todas las operaciones CRUD del sistema de almacenamiento

**Funcionalidades probadas**:
- 🔸 **Operaciones de Usuario**: CRUD completo, autenticación, gestión de suscripciones
- 🔸 **Operaciones de Ideas**: Creación, actualización, eliminación, aprobación de sugerencias
- 🔸 **Sistema de Votación**: Votación con usuarios autenticados y por sesión
- 🔸 **Enlaces Públicos**: Generación, gestión y validación de tokens
- 🔸 **Estadísticas**: Métricas de audiencia, cuotas de ideas
- 🔸 **Posicionamiento**: Sistema de ranking dinámico

#### `premium-middleware.test.ts`
**Cobertura**: Middleware de acceso premium

**Casos validados**:
- ✅ Verificación de usuarios premium vs gratuitos
- ✅ Validación de trials activos/expirados
- ✅ Middleware condicional basado en headers
- ✅ Manejo de usuarios no autenticados

#### `stripe-test-helpers.test.ts`
**Cobertura**: Utilidades de testing para Stripe

**Funcionalidades**:
- ✅ Simulación de pagos exitosos/fallidos
- ✅ Cancelación de suscripciones
- ✅ Generación de eventos webhook
- ✅ Validación de modo testing

### 3. Tests de Frontend (`client/src/__tests__/`)

#### Componentes (`components/`)

##### `idea-card.test.tsx`
**Cobertura**: Componente principal de visualización de ideas

**Casos de prueba**:
- 🎨 **Renderizado**: Título, descripción, votos, posición
- 🎯 **Interacciones**: Votación, edición, eliminación
- 👑 **Permisos**: Acciones de creador vs audiencia
- 📱 **Responsividad**: Adaptación móvil
- ♿ **Accesibilidad**: Navegación por teclado, ARIA labels
- 🔄 **Estados**: Loading, error, diferentes tipos de datos

#### Hooks (`hooks/`)

##### `use-auth.test.tsx`
**Cobertura**: Hook principal de autenticación

**Funcionalidades probadas**:
- 🔐 **Autenticación**: Login, registro, logout
- 👤 **Estado de usuario**: Rol, suscripción, trial
- 🔄 **Actualizaciones**: Perfil, contraseña
- ⚡ **Estados de carga**: Loading states, errores
- 🔍 **Verificaciones**: Premium, creator, audience

#### Utilidades (`lib/`)

##### `utils.test.ts`
**Cobertura**: Funciones utilitarias del sistema

**Funciones probadas**:
- 🎨 `cn()`: Combinación de clases CSS con Tailwind
- 📅 `formatDate()`: Formateo de fechas con i18n
- ✂️ `truncateText()`: Truncado inteligente de texto
- ✉️ `validateEmail()`: Validación robusta de emails
- 🎲 `generateRandomToken()`: Generación segura de tokens
- ⏱️ `debounce()`: Debouncing para optimización

#### Integración (`integration/`)

##### `app.test.tsx`
**Cobertura**: Tests de integración de la aplicación completa

**Áreas cubiertas**:
- 🚀 **Inicialización**: Providers, contextos, configuración
- 🗺️ **Routing**: Rutas públicas, protegidas, navegación
- 🎨 **Temas**: Cambio y persistencia de temas
- 🌍 **i18n**: Internacionalización y cambio de idioma
- ⚠️ **Manejo de Errores**: Graceful degradation
- 📱 **Responsive**: Adaptación a diferentes viewports
- ♿ **Accesibilidad**: Standards WCAG
- ⚡ **Performance**: Tiempos de carga, memory leaks

## Mejores Prácticas Implementadas

### 1. **Estructura Consistente**
- Organización clara por módulos (shared, server, client)
- Naming conventions descriptivos
- Setup y teardown apropiados

### 2. **Mocking Estratégico**
- Mocks mínimos necesarios
- Preservación de lógica real donde es posible
- Mocks consistentes entre tests

### 3. **Casos de Prueba Comprehensivos**
- Happy paths y edge cases
- Error handling robusto
- Validación de estados intermedios
- Tests de integración realistas

### 4. **TypeScript Integration**
- Type safety en todos los tests
- Interfaces compartidas entre test y código
- Validación en tiempo de compilación

### 5. **Accessibility Testing**
- Verificación de ARIA labels
- Testing de navegación por teclado
- Validación de estructura semántica

## Comandos de Testing

### Ejecutar Tests
```bash
# Ejecutar todos los tests
npx jest

# Tests con watch mode
npx jest --watch

# Tests con cobertura
npx jest --coverage

# Tests en CI (sin watch)
npx jest --coverage --watchAll=false
```

### Tests Específicos
```bash
# Ejecutar tests de un archivo específico
npx jest schema.test.ts

# Ejecutar tests por patrón
npx jest --testNamePattern="User Operations"

# Ejecutar tests de una carpeta
npx jest client/src/__tests__/components/
```

## Métricas de Cobertura Objetivo

El proyecto está configurado para requerir **90% de cobertura** en:

- **Branches**: 90% - Todas las ramas de código
- **Functions**: 90% - Todas las funciones y métodos
- **Lines**: 90% - Líneas de código ejecutadas
- **Statements**: 90% - Declaraciones ejecutadas

### Archivos Excluidos de Cobertura
- Archivos de configuración (`*.config.{ts,js}`)
- Punto de entrada principal (`main.tsx`, `index.ts`)
- Tipos TypeScript (`*.d.ts`)
- Node modules

## Continuous Integration

### GitHub Actions Setup (Recomendado)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
```

## Debugging Tests

### Estrategias de Debug
```bash
# Ejecutar un test específico con verbose
npx jest --verbose schema.test.ts

# Debug con Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Ver qué archivos no tienen cobertura
npx jest --coverage --verbose
```

### Troubleshooting Común

1. **Problemas de ES Modules**
   - Verificar configuración de `type: "module"` en package.json
   - Usar `export default` en jest.config.js

2. **Errores de TypeScript**
   - Verificar paths en moduleNameMapping
   - Confirmar configuración de ts-jest

3. **Problemas de Mocking**
   - Verificar orden de imports vs mocks
   - Usar `jest.clearAllMocks()` en beforeEach

## Próximos Pasos

### Mejoras Recomendadas

1. **Visual Regression Testing**
   - Integrar Storybook con Chromatic
   - Screenshots automáticos de componentes

2. **Performance Testing**
   - Tests de timing crítico
   - Memory leak detection
   - Bundle size monitoring

3. **E2E Testing**
   - Playwright para flujos críticos
   - Testing cross-browser
   - Tests de integración real con APIs

4. **Mutation Testing**
   - Usar Stryker para validar calidad de tests
   - Detectar tests que no atrapan bugs reales

## Conclusión

Esta suite de testing proporciona una base sólida para mantener la calidad del código y prevenir regresiones. Con **90% de cobertura objetivo** y testing comprehensivo desde schemas hasta integración completa, el proyecto Fanlist tiene una infraestructura robusta para desarrollo seguro y escalable.

La implementación sigue las mejores prácticas de la industria y proporciona confianza para refactorings, nuevas features y deploys seguros a producción.