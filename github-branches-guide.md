# Guía para trabajar con Branches y Merges en GitHub

Esta guía te ayudará a trabajar con branches (ramas) en GitHub para mantener un flujo de trabajo limpio y organizado en tu proyecto.

## Conceptos básicos

- **Branch (Rama)**: Una línea de desarrollo independiente que permite trabajar en features o correcciones sin afectar la rama principal.
- **Main/Master**: La rama principal que contiene código estable y listo para producción.
- **Merge**: El proceso de incorporar los cambios de una rama a otra.
- **Pull Request (PR)**: Una solicitud para incorporar cambios de una rama a otra con revisión.
- **Commit**: Un conjunto de cambios guardados en el repositorio.

## Flujo de trabajo recomendado (GitFlow Simplificado)

### 1. Preparación del repositorio

Si es un repositorio nuevo:

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

### 2. Crear una nueva rama para una feature

Siempre crea una nueva rama para cada feature o corrección:

```bash
# Asegúrate de estar en la rama principal actualizada
git checkout main
git pull

# Crear y cambiar a una nueva rama
git checkout -b feature/nueva-funcionalidad
```

Convenciones de nombres recomendadas para ramas:
- `feature/nombre-descriptivo` - Para nuevas funcionalidades
- `fix/nombre-del-bug` - Para correcciones de errores
- `improvement/nombre-mejora` - Para mejoras en código existente
- `docs/nombre-documentacion` - Para cambios en documentación

### 3. Desarrollar en la rama feature

Trabaja en tu código normalmente y realiza commits frecuentes:

```bash
# Hacer cambios en tus archivos...

# Ver los archivos modificados
git status

# Añadir archivos modificados
git add archivo1.js archivo2.js
# O añadir todos los cambios
git add .

# Crear un commit
git commit -m "Descripción clara de los cambios realizados"

# Subir la rama al repositorio remoto
git push -u origin feature/nueva-funcionalidad
```

Consejos para buenos commits:
- Haz commits pequeños y frecuentes
- Usa mensajes descriptivos que expliquen el propósito del cambio
- Sigue un formato consistente (p.ej. "feat: añade selector de idioma")

### 4. Crear un Pull Request (PR)

Cuando la feature esté lista para ser incorporada a main:

1. Ve a GitHub
2. Navega a tu repositorio
3. GitHub generalmente mostrará un banner sugiriendo crear un PR desde tu rama
4. Haz clic en "Compare & pull request"
5. Proporciona una descripción detallada de los cambios
6. Asigna revisores si es necesario
7. Haz clic en "Create pull request"

### 5. Revisar y hacer merge del PR

1. Los revisores pueden dejar comentarios y sugerir cambios
2. Realiza los cambios adicionales si son necesarios:
   ```bash
   # Haz más cambios
   git add .
   git commit -m "Implementa sugerencias de la revisión"
   git push
   ```
3. Una vez aprobado el PR, puedes hacer merge:
   - En GitHub: Haz clic en el botón "Merge pull request"
   - O desde la línea de comandos:
     ```bash
     git checkout main
     git merge feature/nueva-funcionalidad
     git push origin main
     ```

### 6. Eliminar la rama después del merge

Una vez completado el merge, puedes eliminar la rama:

```bash
# Eliminar rama localmente
git branch -d feature/nueva-funcionalidad

# Eliminar rama en GitHub
git push origin --delete feature/nueva-funcionalidad
```

## Comandos útiles adicionales

### Ver todas las ramas
```bash
# Ver ramas locales
git branch

# Ver todas las ramas (locales y remotas)
git branch -a
```

### Cambiar entre ramas
```bash
git checkout nombre-de-rama
```

### Actualizar tu rama con los cambios de main
```bash
# Estando en tu rama feature
git checkout feature/mi-funcionalidad
git merge main  # Incorpora cambios de main a tu rama

# O usando rebase (reorganiza tus commits sobre los de main)
git checkout feature/mi-funcionalidad
git rebase main
```

### Resolver conflictos de merge

Si hay conflictos durante un merge:

1. Git marcará los archivos con conflictos
2. Abre los archivos marcados y verás secciones como:
   ```
   <<<<<<< HEAD
   código de tu rama actual
   =======
   código de la rama que estás incorporando
   >>>>>>> feature/otra-rama
   ```
3. Edita el archivo para resolver el conflicto (elimina los marcadores y decide qué código mantener)
4. Añade los archivos resueltos
   ```bash
   git add archivo-con-conflicto.js
   ```
5. Completa el merge
   ```bash
   git commit  # Git generará un mensaje de commit automáticamente
   ```

## Estrategias para proyectos en equipo

- **Mantén main siempre estable**: Solo integra código probado y revisado.
- **Revisiones de código**: Siempre solicita revisiones de PR antes de hacer merge.
- **Pruebas antes de PR**: Asegúrate de que tu código funciona correctamente antes de crear un PR.
- **Ramas de corta duración**: Intenta que las ramas de feature no duren más de unos días para evitar conflictos masivos.
- **Commits atómicos**: Cada commit debe representar un cambio lógico completo y no romper la compilación.

## Ejemplo de workflow completo

```bash
# Iniciar trabajo en una nueva feature
git checkout main
git pull
git checkout -b feature/login-firebase

# Hacer cambios y commits
git add .
git commit -m "feat: implementa autenticación con Firebase"
git push -u origin feature/login-firebase

# Actualizar con cambios de main que ocurrieron mientras trabajabas
git checkout main
git pull
git checkout feature/login-firebase
git merge main
# Resolver conflictos si es necesario

# Subir cambios actualizados
git push

# Crear PR en GitHub y esperar revisión
# Hacer merge en GitHub

# Limpiar después del merge
git checkout main
git pull
git branch -d feature/login-firebase
```

## Herramientas visuales

Si prefieres interfaces gráficas:
- GitHub Desktop
- GitKraken
- SourceTree
- VS Code tiene integración con Git

## Guía de GitHub en Replit

Para trabajar con GitHub directamente desde Replit:

1. **Configuración inicial**: 
   - Ve a la pestaña "Version Control" en el panel lateral
   - Si el proyecto no está enlazado a GitHub, verás opciones para conectarlo

2. **Clonar un repositorio existente**:
   - En Replit, crea un nuevo repl
   - Selecciona "Import from GitHub"
   - Pega la URL de tu repositorio

3. **Crear branches en Replit**:
   - En la pestaña "Version Control", haz clic en el nombre de la rama actual
   - Selecciona "Create new branch" y dale un nombre

4. **Hacer commits y pushear cambios**:
   - Haz tus cambios en el código
   - En la pestaña "Version Control", verás los archivos modificados
   - Añade un mensaje de commit
   - Haz clic en "Commit & push"

5. **Cambiar entre branches**:
   - En la pestaña "Version Control", haz clic en el nombre de la rama actual
   - Selecciona la rama a la que quieres cambiar

6. **Pull Requests desde Replit**:
   - Después de pushear a una rama feature
   - Ve a GitHub y sigue el proceso normal de PR descrito anteriormente

Esta guía cubre lo básico para trabajar con branches en GitHub. Para casos más avanzados o flujos de trabajo específicos, puedes adaptar estas prácticas según tus necesidades.