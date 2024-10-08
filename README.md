# Bit Qualy

# English


## Overview
The **Employee Evaluation System** is an Express.js application designed to streamline employee evaluations within an organization. It supports four roles: **Empleado**, **Evaluador**, **Intermediario**, and **Administrador**, each with specific permissions to handle evaluations, manage assessments, and oversee employees' performance.

## Features

- **Empleado**: 
  - View their own information.
  - Complete self-assessments assigned by other roles.
  
- **Evaluador**:
  - View all employees and their info.
  - Assign self-assessments to employees.
  - Evaluate employees.

- **Intermediario**:
  - View all employees.
  - Approve or deny evaluations completed by Evaluadores.

- **Administrador**:
  - Create, modify, view, and delete evaluation forms (formularios).
  - Create, assign, and manage evaluations.
  - Manage (create, modify, view, and delete) Intermediarios, Evaluadores, and Empleados.

## Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Database)

### Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/employee-evaluation-system.git
    cd employee-evaluation-system
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and configure the following:
    ```bash
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/your-db-name
    SESSION_SECRET=yourSecret
    ```

4. **Start MongoDB**:
    Make sure MongoDB is running locally or provide the correct URI in `.env`.

5. **Run the application**:
    ```bash
    npm start
    ```

> [!NOTE]  
> To access the application, check localhost:3000 in your browser

## Role Descriptions

1. **Empleado**: 
   - Can only view their own profile.
   - Allowed to complete any assigned self-assessment.
   
2. **Evaluador**:
   - Access to view information of all employees.
   - Can assign or evaluate self-assessments.

3. **Intermediario**:
   - Acts as a middleman who approves or denies evaluations conducted by Evaluadores.

4. **Administrador**:
   - Has full control of the system.
   - Can create, modify, view, and delete evaluation forms (formularios).
   - Can manage (CRUD) employees, Evaluadores, and Intermediarios.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templating engine
- **Database**: MongoDB with Mongoose
- **Authentication**: bcryptjs, Express-session, connect-flash

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a Pull Request.

## Endpoints

> [!IMPORTANT]  
> As the database is local, all the data will be post and retrieved to your own database

## Links to documentations

Trello / tasks: https://trello.com/b/8FANcdZ7/tablero-bitqualy

## License




# Spanish

## Resumen
El **Sistema de Evaluación de Empleados** es una aplicación desarrollada con Express.js diseñada para optimizar las evaluaciones de empleados dentro de una organización. Soporta cuatro roles: **Empleado**, **Evaluador**, **Intermediario**, y **Administrador**, cada uno con permisos específicos para gestionar evaluaciones, administrar autoevaluaciones y supervisar el rendimiento de los empleados.

## Características

- **Empleado**:
  - Ver su propia información.
  - Completar autoevaluaciones asignadas por otros roles.

- **Evaluador**:
  - Ver toda la información de los empleados.
  - Asignar autoevaluaciones a empleados.
  - Evaluar a empleados.

- **Intermediario**:
  - Ver toda la información de los empleados.
  - Aprobar o rechazar evaluaciones realizadas por Evaluadores.

- **Administrador**:
  - Crear, modificar, ver y eliminar formularios de evaluación.
  - Gestionar (crear, asignar y ver) las evaluaciones.
  - Administrar (crear, modificar, ver y eliminar) Intermediarios, Evaluadores y Empleados.

## Instalación y Configuración

### Prerrequisitos

- [Node.js](https://nodejs.org/) (Se recomienda la versión 14 o superior)
- [MongoDB](https://www.mongodb.com/) (Base de datos)

### Configuración

1. **Clonar el repositorio**:
    ```bash
    git clone https://github.com/yourusername/employee-evaluation-system.git
    cd employee-evaluation-system
    ```

2. **Instalar dependencias**:
    ```bash
    npm install
    ```

3. **Configurar variables de entorno**:
   Crear un archivo `.env` en el directorio raíz con la siguiente configuración:
    ```bash
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/nombre-de-tu-db
    SESSION_SECRET=tuSecreto
    ```

4. **Iniciar MongoDB**:
    Asegúrate de que MongoDB esté corriendo localmente o proporciona la URI correcta en el archivo `.env`.

5. **Ejecutar la aplicación**:
    ```bash
    npm start
    ```

> [!NOTE]  
> Para acceder a la aplicacion, entre a localhost:3000 en su buscador

## Descripción de Roles

1. **Empleado**: 
   - Solo puede ver su propio perfil.
   - Puede completar autoevaluaciones asignadas.

2. **Evaluador**:
   - Tiene acceso para ver la información de todos los empleados.
   - Puede asignar autoevaluaciones y evaluar empleados.

3. **Intermediario**:
   - Puede ver toda la información de los empleados.
   - Se encarga de aprobar o rechazar evaluaciones realizadas por los Evaluadores.

4. **Administrador**:
   - Tiene control total del sistema.
   - Puede gestionar Intermediarios, Evaluadores y Empleados.
   - Puede crear, modificar, ver y eliminar formularios de evaluación.

## Tecnología Utilizada

- **Backend**: Node.js, Express.js
- **Frontend**: Motor de plantillas EJS
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: bcryptjs, Express-session, connect-flash

## Contribuir

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature-branch`).
3. Realiza tus cambios.
4. Confirma los cambios (`git commit -m 'Añadir una característica'`).
5. Empuja a la rama (`git push origin feature-branch`).
6. Abre un Pull Request.

## Endpoints

> [!IMPORTANT]  
> Al ser una base de datos local, todos los datos enviados y recibidos seran a su propia base de datos

## Enlaces a la documentacion

Trello / tareas: https://trello.com/b/8FANcdZ7/tablero-bitqualy

## Licencia

