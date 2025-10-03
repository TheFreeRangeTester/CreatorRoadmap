# 🤝 Guía de Contribución - CreatorRoadmap (Fanlist)

¡Gracias por tu interés en contribuir a CreatorRoadmap! Esta guía te ayudará a entender cómo contribuir de manera efectiva al proyecto.

## 📋 Tabla de Contenidos

- [🚀 Cómo Contribuir](#-cómo-contribuir)
- [📋 Estándares de Código](#-estándares-de-código)
- [🧪 Testing](#-testing)
- [📝 Pull Request Process](#-pull-request-process)
- [🏗️ Estructura del Proyecto](#️-estructura-del-proyecto)
- [🔧 Configuración del Entorno](#-configuración-del-entorno)
- [📚 Documentación](#-documentación)

## 🚀 Cómo Contribuir

### 1. **Fork del Repositorio**
```bash
# Fork el repositorio en GitHub, luego:
git clone https://github.com/tu-usuario/CreatorRoadmap.git
cd CreatorRoadmap
git remote add upstream https://github.com/patominer/CreatorRoadmap.git
```

### 2. **Crear una Branch**
```bash
git checkout -b feature/nombre-de-la-feature
# o
git checkout -b fix/descripcion-del-bug
```

### 3. **Hacer Cambios y Commit**
```bash
git add .
git commit -m "feat: add new feature description"
# o
git commit -m "fix: resolve bug description"
```

### 4. **Push y Pull Request**
```bash
git push origin feature/nombre-de-la-feature
# Luego crear un Pull Request en GitHub
```

## 📋 Estándares de Código

### **TypeScript**
- ✅ Usa TypeScript para todo el código
- ✅ Define tipos explícitos para funciones y variables
- ✅ Evita `any` - usa tipos específicos
- ✅ Sigue las convenciones de naming de TypeScript

### **React**
- ✅ Usa componentes funcionales con hooks
- ✅ Sigue las convenciones de naming de React
- ✅ Usa `useCallback` y `useMemo` cuando sea apropiado
- ✅ Maneja errores apropiadamente

### **Styling**
- ✅ Usa TailwindCSS para estilos
- ✅ Sigue el design system existente
- ✅ Usa componentes de shadcn/ui cuando sea posible
- ✅ Asegúrate de que sea responsive

### **Convenciones de Commits**
Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato/estilo
refactor: refactoring de código
test: añadir o modificar tests
chore: tareas de mantenimiento
```

## 🧪 Testing

### **Antes de hacer Push**
```bash
# Ejecutar todos los tests
npx tsx test-runner.mjs

# Verificar linting
npm run lint

# Verificar build
npm run build

# Análisis de cobertura
npx tsx test-coverage.mjs
```

### **Escribir Tests**
- ✅ Tests unitarios para funciones críticas
- ✅ Tests de integración para flujos completos
- ✅ Tests de componentes React
- ✅ Cobertura mínima del 80%

### **Estructura de Tests**
```
src/__tests__/
├── components/          # Tests de componentes
├── hooks/              # Tests de hooks
├── lib/                # Tests de utilidades
└── integration/        # Tests de integración
```

## 📝 Pull Request Process

### **Antes de Crear un PR**
- [ ] He ejecutado todos los tests localmente
- [ ] He verificado que no hay errores de linting
- [ ] He probado la funcionalidad manualmente
- [ ] He actualizado la documentación si es necesario
- [ ] He añadido tests para nueva funcionalidad

### **Descripción del PR**
- ✅ Descripción clara de los cambios
- ✅ Screenshots si es necesario
- ✅ Referencias a issues relacionados
- ✅ Lista de verificación completada

### **Proceso de Revisión**
1. **Automático**: GitHub Actions ejecuta tests
2. **Manual**: Revisión de código por @patominer
3. **Aprobación**: Al menos 1 aprobación requerida
4. **Merge**: Solo después de aprobación

## 🏗️ Estructura del Proyecto

```
CreatorRoadmap/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas de la app
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilidades
│   │   └── locales/       # Internacionalización
├── server/                 # Backend Express
│   ├── routes.ts          # Rutas de la API
│   ├── auth.ts            # Autenticación
│   ├── storage.ts         # Persistencia
│   └── services/          # Servicios externos
├── shared/                 # Código compartido
│   ├── schema.ts          # Schemas de validación
│   └── premium-utils.ts   # Utilidades premium
└── .github/               # Configuración de GitHub
    ├── workflows/         # GitHub Actions
    └── ISSUE_TEMPLATE/    # Templates de issues
```

## 🔧 Configuración del Entorno

### **Requisitos**
- Node.js 18+
- npm 9+
- PostgreSQL (para producción)

### **Instalación**
```bash
# Clonar repositorio
git clone https://github.com/patominer/CreatorRoadmap.git
cd CreatorRoadmap

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar en desarrollo
npm run dev
```

### **Scripts Disponibles**
```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run test         # Ejecutar tests
npm run lint         # Linting
npm run type-check   # Verificación de tipos
```

## 📚 Documentación

### **Documentos Importantes**
- [README.md](./README.md) - Información general del proyecto
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guía completa de testing
- [STRIPE_TESTING_GUIDE.md](./STRIPE_TESTING_GUIDE.md) - Testing de pagos

### **Actualizar Documentación**
- ✅ Actualiza README.md si cambias setup/instalación
- ✅ Actualiza documentación de API si cambias endpoints
- ✅ Añade comentarios en código complejo
- ✅ Actualiza tipos TypeScript

## 🐛 Reportar Bugs

### **Antes de Reportar**
- [ ] Verifica que no existe un issue similar
- [ ] Prueba en la versión más reciente
- [ ] Recopila información del sistema

### **Información Necesaria**
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Información del sistema

## ✨ Sugerir Features

### **Antes de Sugerir**
- [ ] Verifica que no existe una sugerencia similar
- [ ] Considera el impacto y complejidad
- [ ] Piensa en casos de uso específicos

### **Información Necesaria**
- Descripción clara de la feature
- Motivación y casos de uso
- Acceptance criteria
- Consideraciones técnicas
- Mockups/wireframes si aplica

## 🤝 Comunidad

### **Código de Conducta**
- Sé respetuoso y constructivo
- Ayuda a otros contribuidores
- Mantén un ambiente positivo
- Reporta comportamientos inapropiados

### **Obtener Ayuda**
- 📧 Email: [tu-email]
- 💬 Issues: Usa GitHub Issues para preguntas
- 📖 Documentación: Revisa la documentación existente

## 🎯 Roadmap

### **Próximas Features**
- [ ] Sistema de notificaciones
- [ ] Analytics avanzados
- [ ] API pública
- [ ] Mobile app
- [ ] Integraciones adicionales

### **Contribuir al Roadmap**
- Añade sugerencias en GitHub Issues
- Participa en discusiones
- Vota por features importantes

---

## 🙏 Agradecimientos

¡Gracias por contribuir a CreatorRoadmap! Cada contribución hace que el proyecto sea mejor para todos los creadores de contenido y sus audiencias.

---

**Última actualización**: $(date)  
**Mantenido por**: @patominer
