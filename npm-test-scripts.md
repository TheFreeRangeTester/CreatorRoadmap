# Scripts NPM para Testing en Fanlist

## Scripts Disponibles

### Scripts Básicos
```bash
# Ejecutar tests básicos
npm run test:fanlist

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests verbosos
npm run test:verbose
```

### Scripts para IDEs
```bash
# Desde la raíz del proyecto:

# Tests básicos
node test-ide.mjs

# Tests con cobertura
node test-ide.mjs --coverage

# Modo watch (observar cambios)
node test-ide.mjs --watch

# Cobertura verbose
node test-ide.mjs --coverage --verbose
```

## Configuración VS Code

### 1. Ejecutar desde Command Palette
- Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
- Escribe "Tasks: Run Task"
- Selecciona una de estas opciones:
  - **Fanlist: Run Tests** - Tests básicos
  - **Fanlist: Run Tests with Coverage** - Con cobertura
  - **Fanlist: Watch Tests** - Modo continuo
  - **Fanlist: Verbose Coverage** - Cobertura detallada

### 2. Keyboard Shortcuts
Agrega estos atajos a tu `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "Fanlist: Run Tests"
  },
  {
    "key": "ctrl+shift+c",
    "command": "workbench.action.tasks.runTask", 
    "args": "Fanlist: Run Tests with Coverage"
  }
]
```

### 3. Debug Tests
- Ve a la pestaña "Run and Debug" (Ctrl+Shift+D)
- Selecciona "Debug Tests" o "Debug Tests with Coverage"
- Presiona F5 para iniciar

## Configuración WebStorm/IntelliJ

### 1. Crear Run Configuration
1. Ve a `Run > Edit Configurations`
2. Haz clic en `+` y selecciona `Node.js`
3. Configura:
   - **Name**: Fanlist Tests
   - **JavaScript file**: `test-ide.mjs`
   - **Application parameters**: (vacío para básico, `--coverage` para cobertura)

### 2. Para Coverage
1. Crea otra configuración igual
2. **Name**: Fanlist Tests Coverage  
3. **Application parameters**: `--coverage`

## Reportes de Cobertura

### Ubicación de Reportes
- **HTML**: `coverage-report.html` (se abre en el navegador)
- **Console**: Output directo en terminal

### Métricas Incluidas
- **Cobertura de líneas**: % de líneas ejecutadas
- **Cobertura de funciones**: % de funciones llamadas
- **Archivos individuales**: Desglose por archivo
- **Targets**: Objetivos de cobertura (80% líneas, 75% funciones)

## Archivos de Testing

### Framework Principal
- `test-runner.mjs` - Framework de testing personalizado
- `test-ide.mjs` - Runner optimizado para IDEs
- `test-coverage.mjs` - Análisis de cobertura

### Configuración IDE
- `.vscode/tasks.json` - Tasks de VS Code
- `.vscode/launch.json` - Configuración de debug
- `npm-test-scripts.md` - Esta guía

## Ejemplo de Uso

```bash
# Terminal básico
$ node test-ide.mjs
🧪 Fanlist IDE Test Runner
========================================
Mode: Single Run
Coverage: Disabled
Verbose: Disabled
========================================

# Con cobertura
$ node test-ide.mjs --coverage
🧪 Fanlist IDE Test Runner  
========================================
Mode: Single Run
Coverage: Enabled
Verbose: Disabled
========================================

# Modo watch (desarrollo)
$ node test-ide.mjs --watch
🧪 Fanlist IDE Test Runner
========================================
Mode: Watch
Coverage: Disabled
Verbose: Disabled
========================================
🔄 Starting watch mode...
👀 Watching for changes...
```

## Integración con CI/CD

Para usar en GitHub Actions o similar:
```yaml
- name: Run Tests with Coverage
  run: node test-ide.mjs --coverage
```