# Grade List Frontend

Frontend web de **Grade List**, una aplicación para la gestión de tareas por usuario desarrollada con HTML, CSS y JavaScript.

La aplicación permite registrarse, iniciar sesión y administrar tareas consumiendo la API REST de Grade List.

El proyecto incluye autenticación mediante JWT, CRUD completo de tareas, filtros, edición desde la interfaz, manejo de estados de carga y error, configuración de API por entorno, Docker, CI/CD con GitHub Actions, publicación de imágenes en GitHub Container Registry y despliegue automático con rollback.

---

## Descripción

Grade List proporciona la interfaz web utilizada por los usuarios para interactuar con el sistema.

Desde la aplicación un usuario puede:

- Registrarse.
- Iniciar sesión.
- Mantener una sesión autenticada.
- Crear tareas.
- Consultar sus tareas.
- Editar tareas.
- Marcar tareas como completadas o pendientes.
- Eliminar tareas.
- Filtrar tareas.
- Consultar el contador de tareas según el filtro seleccionado.
- Cerrar sesión.

El frontend se comunica con el backend mediante HTTP y utiliza JWT para acceder a las rutas protegidas.

---

## Arquitectura general

```text
Usuario
   │
   ▼
Navegador
   │
   ▼
Grade List Frontend
HTML + CSS + JavaScript
   │
   ▼
Nginx
   │
   ▼
Nginx Proxy Manager
   │
   ▼
Grade List API
Node.js + Express
   │
   ▼
MySQL
```

En el entorno del homelab:

```text
Usuario
   │
   ▼
http://grade.home
   │
   ▼
Nginx Proxy Manager
   │
   ▼
grade-list-frontend
   │
   ▼
http://api.home
   │
   ▼
Grade List API
```

---

## Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API
- Web Storage API

### Autenticación

- JWT
- sessionStorage

### Contenedores

- Docker
- Docker Compose
- Nginx

### DevOps

- Git
- GitHub
- GitHub Actions
- GitHub Container Registry (GHCR)
- Self-hosted GitHub Actions Runner

---

## Funcionalidades

### Registro

El usuario puede crear una cuenta desde la interfaz.

El frontend envía los datos hacia:

```text
POST /auth/register
```

Después de un registro correcto, el usuario puede iniciar sesión.

---

## Inicio de sesión

El usuario puede autenticarse utilizando su correo electrónico y contraseña.

La solicitud se envía hacia:

```text
POST /auth/login
```

Después de una autenticación correcta, el frontend recibe un token JWT.

El token se almacena utilizando:

```text
sessionStorage
```

Este token se utiliza posteriormente para acceder a las rutas protegidas de la API.

---

## Manejo de sesión

Las páginas protegidas verifican que exista una sesión válida.

El token se envía utilizando el header:

```text
Authorization: Bearer <token>
```

Si la API responde:

```text
401 Unauthorized
```

el frontend elimina la sesión almacenada y redirige al usuario al flujo de autenticación.

Esto evita mantener una sesión inválida cuando el token ha expirado o ya no es aceptado por la API.

---

## Gestión de tareas

El frontend permite realizar el CRUD completo de tareas.

### Crear tarea

El usuario puede agregar una nueva tarea desde el formulario principal.

El título debe contener entre:

```text
3 y 255 caracteres
```

La operación utiliza:

```text
POST /api/tareas
```

---

### Consultar tareas

Después de iniciar sesión, el frontend obtiene las tareas pertenecientes al usuario autenticado.

```text
GET /api/tareas
```

El backend determina el propietario de las tareas utilizando el JWT.

El frontend nunca selecciona manualmente el `user_id`.

---

### Editar tarea

Las tareas pueden editarse directamente desde la interfaz.

Durante la edición se muestran las opciones:

```text
Guardar
Cancelar
```

La interfaz también contempla interacción mediante teclado durante el proceso de edición.

La actualización utiliza:

```text
PUT /api/tareas/:id
```

---

### Completar tarea

El estado de una tarea puede alternarse entre:

```text
Pendiente
Completada
```

La operación utiliza:

```text
PATCH /api/tareas/:id/toggle
```

---

### Eliminar tarea

Antes de eliminar una tarea se muestra un modal de confirmación.

La operación utiliza:

```text
DELETE /api/tareas/:id
```

Mientras la eliminación está en progreso, la interfaz bloquea acciones duplicadas para evitar múltiples solicitudes accidentales.

---

## Filtros

La interfaz dispone de tres filtros principales:

```text
Todas
Pendientes
Completadas
```

El contador de tareas cambia según el filtro seleccionado.

Los filtros permiten consultar de forma rápida el estado actual de las tareas del usuario.

---

## Estados de interfaz

La aplicación contempla diferentes estados durante su funcionamiento.

Entre ellos:

- Carga inicial de tareas.
- Lista de tareas vacía.
- Errores provenientes de la API.
- Solicitudes en progreso.
- Prevención de peticiones duplicadas.
- Confirmación de eliminación.
- Edición activa.
- Sesión expirada.
- Error de autenticación.

Esto permite que el usuario reciba retroalimentación visual durante las operaciones.

---

## Accesibilidad

La interfaz incorpora diferentes mejoras de accesibilidad.

Entre ellas:

- Uso de `aria-live` para mensajes dinámicos.
- Estado accesible de los botones de filtro.
- Modal de eliminación controlado.
- Interacción mediante teclado durante la edición.
- Bloqueo de acciones mientras una operación crítica está en progreso.

---

## Diseño responsive

La interfaz fue adaptada para funcionar correctamente en diferentes tamaños de pantalla.

También se contempla el manejo de títulos largos para evitar que el contenido rompa el diseño de las tarjetas o listas de tareas.

---

## Configuración de la API

La URL del backend no está fijada directamente dentro de la imagen Docker.

Se configura mediante:

```env
API_URL=http://api.home
```

El archivo de referencia es:

```text
.env.example
```

Ejemplo:

```env
FRONTEND_VERSION=v1.0.0
API_URL=http://api.home
```

Esto permite utilizar diferentes URLs de API dependiendo del entorno.

---

## Configuración en runtime

El frontend utiliza configuración generada cuando arranca el contenedor.

El archivo:

```text
js/config.template.js
```

contiene:

```javascript
const API_URL = "${API_URL}";
```

Durante el inicio del contenedor, el script:

```text
docker-entrypoint-config.sh
```

utiliza `envsubst` para generar:

```text
js/config.js
```

con el valor real de la variable `API_URL`.

En producción:

```javascript
const API_URL = "http://api.home";
```

El flujo es:

```text
Variable de entorno
      │
      ▼
API_URL
      │
      ▼
config.template.js
      │
      ▼
envsubst
      │
      ▼
config.js
      │
      ▼
Frontend
```

Este mecanismo permite utilizar **la misma imagen Docker en diferentes entornos sin reconstruirla**.

---

## Docker

El frontend se distribuye mediante una imagen Docker basada en Nginx.

La imagen de producción se publica en:

```text
ghcr.io/graderd/grade-list-frontend
```

Nginx sirve los archivos estáticos de la aplicación:

```text
HTML
CSS
JavaScript
Imágenes
```

La aplicación no necesita exponer directamente un puerto del host en producción.

Nginx Proxy Manager accede al contenedor mediante una red Docker compartida.

---

## Docker Compose

El servicio utiliza una imagen versionada:

```text
ghcr.io/graderd/grade-list-frontend:${FRONTEND_VERSION}
```

Ejemplo de configuración:

```env
FRONTEND_VERSION=v1.0.1
API_URL=http://api.home
```

La red:

```text
proxy-net
```

es una red Docker externa compartida con Nginx Proxy Manager.

Esto permite que el proxy acceda directamente al contenedor del frontend.

---

## GitHub Container Registry

Las imágenes Docker del frontend se publican en:

```text
ghcr.io/graderd/grade-list-frontend
```

Las versiones se publican utilizando tags Git con formato:

```text
vX.Y.Z
```

Ejemplo:

```bash
git tag -a v1.0.1 -m "Frontend v1.0.1"
git push origin v1.0.1
```

El workflow encargado de publicar las imágenes es:

```text
.github/workflows/publish-image.yml
```

El proceso:

```text
Tag Git
   ↓
GitHub Actions
   ↓
Docker Build
   ↓
GHCR
   ↓
Imagen versionada
```

---

## CI con GitHub Actions

El repositorio dispone de integración continua mediante:

```text
.github/workflows/ci.yml
```

El pipeline realiza diferentes validaciones:

```text
Checkout
   ↓
Validación de archivos
   ↓
Validación de Docker Compose
   ↓
Construcción de imagen Docker
   ↓
Validación de Nginx
```

Entre las comprobaciones realizadas se encuentran:

- Existencia de archivos requeridos.
- Validación de `docker compose`.
- Construcción correcta de la imagen.
- Validación de configuración mediante `nginx -t`.

Esto permite detectar errores antes de integrar cambios a la rama principal.

---

## CD y despliegue automático

El frontend dispone de Continuous Deployment mediante GitHub Actions.

Después de publicar correctamente una imagen, el workflow inicia automáticamente el despliegue.

El flujo completo es:

```text
Merge a main
   ↓
Crear tag vX.Y.Z
   ↓
Push del tag
   ↓
GitHub Actions
   ↓
Construcción de imagen
   ↓
Publicación en GHCR
   ↓
Workflow de deploy
   ↓
Self-hosted Runner
   ↓
Pull de nueva imagen
   ↓
Docker Compose
   ↓
Smoke test
   ↓
Producción
```

El workflow de despliegue se encuentra en:

```text
.github/workflows/deploy.yml
```

---

## Self-hosted Runner

El despliegue utiliza un GitHub Actions Runner instalado dentro del homelab.

El runner utiliza las etiquetas:

```text
self-hosted
linux
x64
production
frontend
```

El runner ejecuta el despliegue directamente en el servidor de producción.

La ubicación del proyecto es:

```text
/srv/docker/stacks/frontend/grade-list-frontend
```

---

## Verificación del despliegue

Después de desplegar una nueva versión, el workflow realiza varias comprobaciones.

Entre ellas:

- El contenedor debe estar ejecutándose.
- La imagen debe corresponder con la versión solicitada.
- El frontend debe responder mediante Nginx Proxy Manager.
- El smoke test debe devolver HTTP `200`.

La validación utiliza:

```text
Host: grade.home
```

contra el proxy del homelab.

Esto comprueba no solamente el contenedor, sino también la ruta utilizada realmente por los usuarios.

---

## Rollback automático

El frontend dispone de rollback automático.

Antes de desplegar una nueva versión, el workflow obtiene la versión estable actualmente configurada.

Ejemplo:

```text
FRONTEND_VERSION=v1.0.1
```

Si la nueva versión falla, el workflow puede restaurar automáticamente la anterior.

El rollback se activa si ocurre alguno de estos problemas:

- Docker Compose no puede levantar el servicio.
- El contenedor utiliza una imagen diferente de la solicitada.
- El smoke test falla.
- El frontend no devuelve HTTP `200`.

Flujo:

```text
Versión estable
   ↓
Nueva versión
   ↓
Deploy
   ↓
Smoke test
   ↓
¿Correcto?
   ├── Sí
   │    ↓
   │  Mantener nueva versión
   │
   └── No
        ↓
      Rollback
        ↓
      Restaurar versión anterior
```

Después de un despliegue correcto, el workflow actualiza únicamente:

```text
FRONTEND_VERSION
```

dentro del archivo `.env`.

La variable:

```text
API_URL
```

se mantiene sin modificaciones.

El mecanismo de rollback fue validado mediante un fallo controlado antes de considerarse listo.

---

## Flujo de desarrollo

Los cambios siguen un flujo basado en ramas.

```text
Crear rama
   ↓
Desarrollar cambio
   ↓
Validar
   ↓
Commit
   ↓
Push
   ↓
Pull Request
   ↓
GitHub Actions CI
   ↓
Validación
   ↓
Merge a main
```

Para publicar una nueva versión:

```text
Merge a main
   ↓
Crear tag vX.Y.Z
   ↓
Push del tag
   ↓
Publicar imagen
   ↓
GHCR
   ↓
Deploy automático
   ↓
Smoke test
   ↓
Producción
```

Si el despliegue falla:

```text
Deploy
   ↓
Fallo
   ↓
Rollback automático
   ↓
Versión estable anterior
```

---

## Relación con el backend

Este repositorio contiene únicamente el frontend de Grade List.

La API se desarrolla y mantiene en un repositorio separado:

```text
Graderd/Todo-List
```

El frontend consume endpoints como:

```text
POST   /auth/register
POST   /auth/login

GET    /api/tareas
POST   /api/tareas
GET    /api/tareas/:id
PUT    /api/tareas/:id
PATCH  /api/tareas/:id/toggle
DELETE /api/tareas/:id
```

El backend es responsable de:

- Autenticación.
- Validación.
- Autorización.
- Aislamiento entre usuarios.
- Persistencia en MySQL.
- Health checks.
- Métricas.
- Seguridad del servidor.

El frontend es responsable de:

- Interfaz de usuario.
- Gestión de sesión en el navegador.
- Consumo de la API.
- Presentación de tareas.
- Filtros.
- Estados de interfaz.
- Interacción del usuario.

---

## Infraestructura de producción

La aplicación completa funciona dentro del homelab.

```text
                    Usuario
                       │
                       ▼
                  grade.home
                       │
                       ▼
              Nginx Proxy Manager
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
      Grade List Frontend      api.home
             │                   │
             │                   ▼
             └────────────► Grade List API
                                 │
                                 ▼
                               MySQL
```

Frontend y backend se encuentran separados en repositorios y contenedores diferentes.

---

## Estructura general

```text
grade-list-frontend/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── publish-image.yml
│       └── deploy.yml
│
├── css/
│
├── image/
│
├── js/
│   ├── config.template.js
│   └── ...
│
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint-config.sh
├── index.html
├── .env.example
├── .gitignore
└── README.md
```

La carpeta `js/` contiene los scripts responsables de autenticación, tareas, configuración y comportamiento de la interfaz.

---

## Estado actual

El frontend cuenta actualmente con:

- Registro de usuarios.
- Inicio de sesión.
- Manejo de sesión mediante JWT.
- Almacenamiento de sesión en `sessionStorage`.
- Protección de páginas.
- Manejo de errores `401`.
- CRUD completo de tareas.
- Creación de tareas.
- Consulta de tareas.
- Edición de tareas.
- Toggle completada/pendiente.
- Eliminación de tareas.
- Modal de confirmación.
- Filtros.
- Contador de tareas.
- Prevención de solicitudes duplicadas.
- Estados de carga.
- Estado de lista vacía.
- Manejo de errores.
- Validación de títulos.
- Diseño responsive.
- Manejo de títulos largos.
- Configuración de API por entorno.
- Configuración generada en runtime.
- Docker.
- Docker Compose.
- Nginx.
- CI con GitHub Actions.
- Publicación automática en GHCR.
- Imágenes Docker versionadas.
- Self-hosted Runner.
- CD automático.
- Smoke tests.
- Rollback automático.
- Integración validada con Grade List API.

---

## Estado de producción

Versión validada:

```text
v1.0.1
```

Configuración:

```env
FRONTEND_VERSION=v1.0.1
API_URL=http://api.home
```

Imagen:

```text
ghcr.io/graderd/grade-list-frontend:v1.0.1
```

La aplicación se encuentra disponible internamente mediante:

```text
http://grade.home
```

La API utilizada es:

```text
http://api.home
```

La integración completa fue probada funcionalmente de extremo a extremo:

```text
Registro
   ↓
Login
   ↓
Crear tarea
   ↓
Editar tarea
   ↓
Completar tarea
   ↓
Eliminar tarea
```

Todas estas operaciones fueron validadas correctamente desde la interfaz web.

---

## Repositorios relacionados

### Frontend

```text
github.com/Graderd/grade-list-frontend
```

### Backend

```text
github.com/Graderd/Todo-List
```

El proyecto utiliza repositorios separados para mantener desacopladas la interfaz web y la API.

---

## Autor

Desarrollado como proyecto práctico de **Frontend, integración de APIs, Docker, CI/CD y despliegue**, como parte del proyecto Grade List y de una ruta de aprendizaje DevOps.