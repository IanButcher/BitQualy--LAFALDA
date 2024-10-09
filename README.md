#*BITQUALY*
**Índice:** 

[TOC]

----------
####Descripción
Esta aplicación web es un sistema de evaluación del personal empresarial.
Los componentes que usaremos para el desarrollo serán:
- Lenguaje de programación: JavaScript
- Backend: Node.js, Express.js
- Frontend: Motor de plantillas EJS
- Base de datos: MongoDB con Mongoose
- Autenticación: bcryptjs, Express-session, connect-flash

Los usuarios estarán definido por roles (administrador, evaluador, intermediario, empleado) que garantizarán una estructura organizada para la gestión de evaluaciones eficientes.

------------

####Requisitos

Para la ejecución del proyecto se necesitarán los siguientes software y herramientas:
- Node js versión: v20.12.2 o superior.
- MongoDB versión: v8.0.0 o superior
- MongoDB Compass versión:  v1.44.4  o superior
- Express.js versión: v4.21.0 o superior
- Navegador web actualizado



--------
####Instalación
Para poder acceder al desarrollo es necesario clonar el repositorio del proyecto que se encuentra en la plataforma de GITHUB.

1- Clonar el repositorio:

`git clone https://github.com/IanButcher/BitQualy--LAFALDA.git`

2- Entrar al directorio del proyecto:

`cd employee-evaluation-system`

3- Instalar dependencias:

`npm install`

4- Configurar variables de entorno:
Crear un archivo .env en el directorio raíz con la siguiente configuración:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nombre-de-tu-db
SESSION_SECRET=tuSecreto
```

5- Iniciar MongoDB: Asegúrate de que MongoDB esté corriendo localmente o proporciona la URI correcta en el archivo .env.

6- Ejecutar la aplicación:
`npm start`
> Note:
Para acceder a la aplicacion, entre a localhost:3000 en su buscador

------
####Uso
Una vez instalada la aplicación, se inicia con un login de acceso que deriva en las diferentes rutas de los usuarios del sistema.
Dentro de los usuarios se encuentran:
1. Administrador: 
- Tiene control total del sistema.
- Puede gestinar Intemediarios, Evaluadores y Empleados
- Puede crear nuevos usuarios y designarles roles.
- Puede crear, modificar, ver y eliminar formularios.
2. Evaluaduador:
- Tendrá acceso a visualizar la información de los empleados asignados.
- Realizará las autoevaluaciones.
- Recibirán las evaluaciones.
- Realizarán informes y notificaciones.
- Enviarán las evaluaciones a los empleados.
3. Empleados:
- Solo puede ver su propio perfir.
- Puede completar las autoevaluaciones.
- Recibirán notificaciones y comentarios.
4. Intermediarios: 
- Puede ver la información de los empleados.
- Realizaran devoluciones de los informes de cada evaluación realizada.

Cada rol tiene acceso limitado a determinadas funcionalidades según sus permisos.

----
####Rutas
1. Route - Login:
- **GET /**: página de login (todos los usuarios).
- **GET /user-creator**: nuevo usuario creado (solo administrador).
- **POST /save-new-users**: Crea un nuevo usuario (solo administrador).

2. Route - Empleado:
- **GET /empleados**: Visualiza todos los empleados (para administración, evaluadores e intermediarios).
- **GET /empleados/:id**: Obtiene el empleado por ID (para administración, evaluadores e intermediarios).

3. Route - Evaluador:
- **GET /evaluadores**: Visualiza todos los evaluadores (solo administración).
- **GET /evaluadores/:id**: Obtiene el evaluador por ID (solo administración).

4. Route -Intermediario:
- **GET /reguladores**: Visualiza todos los reguladores (solo administración).
- **GET /reguladores/:id**: Obtiene el reguladores por ID (solo administración).

5. Route - Evaluación:
- **GET /evaluaciones/new**: Muestra la evaluación específica (para todos los usuarios).
- **GET /evaluaciones/answer/:id/**: Obtiene las preguntas por ID (solo administración).
- **POST /evaluaciones/save-evaluacion**: Crea una nueva evaluación (solo administrador).
- **GET /evaluaciones/preview/:id**: Obtiene una evaluación por ID (solo administración).

6. Route - Formularios:
- **GET /formularios**: Muestra los formularios (solo administración).
- **GET /formularios/new**: Muestra el creador de un formulario nuevo (solo administración).
- **GET /formularios/preview/:id**: Obtiene un formulario específico por ID (para evaluadores y empleados).
- **POST /formularios/save-form**: Crea un nuevo formulario (solo administrador).
- **POST /formularios/eliminar/:id**: elimina un formulario (solo administrador).
- **PUT /formularios/:id**: Actualiza un formulario con sus correcciones.

#### Endpoints
> Importante:
Al ser una base de datos local, todos los datos enviados y recibidos seran a su propia base de datos

----
####Estructura del proyecto
   ```
   ├── middleware  # Lógica de intercambio de información
   ├── public           # Archivos estáticos (Imagenes, HTML, CSS, JS)
   ├── routes           # Definición de rutas para la API
   ├── Schemas       # Definición de esquemas de la base de datos (MongoDB)
   ├── views            # Plantillas HTML
   index.js                 # Archivo principal (conexión al servidor, rutas, base de datos, middleware) 
   ```


####Contribuir
1. Haz un fork del repositorio.
2. Crea una nueva rama (git checkout -b feature-branch).
3. Realiza tus cambios.
4. Confirma los cambios (git commit -m 'Añadir una característica').
5. Empuja a la rama (git push origin feature-branch).
6. Abre un Pull Request.

####Enlaces a la documentacion
Trello / tareas:
`https://trello.com/b/8FANcdZ7/tablero-bitqualy`

------
