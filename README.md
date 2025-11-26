

````md
# 🏥 HealPoint — Sistema de Gestión Médica

Proyecto desarrollado por **José Stiven Rodas Beltrán** y **Brandon Steven Carvajal Sepúlveda** como entrega final de la asignatura *Calidad y Pruebas de Software* — Universidad de Caldas, 2025.

---

## 📂 Clonar el Repositorio

```bash
git clone https://github.com/Brandonscs/HealPoint.git
````

---

## 🚀 Cómo Ejecutar el Proyecto

### 🖥️ Backend — Spring Boot (IntelliJ IDEA 2025.2.4)

1. Abrir **IntelliJ IDEA 2025.2.4**.
2. Seleccionar **Open** y elegir la carpeta `/backend`.
3. Esperar a que **Maven descargue las dependencias**.
4. Configurar el archivo `.env` o `application.properties` con tu base de datos.
5. Ejecutar la clase principal:

```
src/main/java/com.healpoint/HealPointApplication.java
```

6. Backend correrá en:

```
http://localhost:8080
```

---

### 💻 Frontend — React (Visual Studio Code)

1. Abrir **Visual Studio Code**.
2. Seleccionar **Open Folder** → carpeta `/frontend`.
3. Abrir terminal y ejecutar:

```bash
npm install
npm run dev
```

4. El frontend arrancará en:

```
http://localhost:5173
```

---

## 🧰 Requisitos del Sistema

### 🔹 Hardware

* RAM: **mínimo 4 GB (recomendado 8 GB)**
* Procesador **Intel i3 o superior**
* Conexión estable a internet
* Resolución mínima **1366x768**

### 🔹 Software

* **Windows 10/11, Linux o macOS**
* **Node.js** (última versión recomendada)
* **Java 17+**
* **IntelliJ IDEA 2025.2.4** (para backend)
* **Visual Studio Code** (para frontend)
* Navegador actualizado (Chrome, Firefox, Edge)
* Base de datos configurada según archivo `.env`

---

## 🧑‍💼 Roles del Sistema

### 👨‍💻 Administrador

* Gestión de usuarios
* Gestión de roles
* Gestión de estados
* Agenda global de citas
* Monitoría / auditoría de acciones

### 👨‍⚕️ Médico

* Gestionar disponibilidad
* Ver citas asignadas
* Cambiar estado de citas
* Registrar historiales médicos

### 👤 Paciente

* Agendar citas
* Ver sus citas
* Consultar historial médico

---

# 📘 Guía Completa de Uso del Sistema

A continuación encontrarás el paso a paso para cada rol.

---

## 🔐 1. Inicio de Sesión

1. Ingrese sus credenciales.
2. Presione **Iniciar sesión**.
3. El sistema lo redirecciona automáticamente al dashboard de su rol.

---

# 🏛️ 2. Módulos del Rol Administrador

## ▶️ Dashboard (Inicio)

Incluye:

* Tarjetas de acceso rápido
* Navbar superior con nombre, rol y botón cerrar sesión
* Sidebar con módulos principales

---

## 👥 Gestión de Usuarios

Permite:

* Crear usuarios
* Editar información
* Asignar roles
* Cambiar estados
* Eliminar usuarios

Incluye:

* Barra de búsqueda
* Filtro por rol
* Tabla dinámica
* Botón **Nuevo Usuario**

---

## 🔑 Gestión de Roles

Permite:

* Crear nuevos roles
* Editar roles
* Administrar permisos
* Cambiar estados

Incluye:

* Búsqueda por nombre
* Filtro por estado
* Tabla con ID, nombre y descripción

---

## 🔄 Gestión de Estados

Permite:

* Crear estados
* Editar estados
* Eliminar estados

Incluye:

* Tabla con ID, nombre, descripción
* Botón **Nuevo Estado**

---

## 🗓️ Agenda Global de Citas

El administrador puede:

* Ver **todas** las citas
* Filtrar por médico, paciente, fecha o estado
* Cambiar vista **Tabla / Calendario**
* Ver estadísticas:

  * Total de citas
  * Pendientes
  * Completadas

---

## 📊 Monitoría del Sistema

Permite visualizar:

* Creaciones
* Actualizaciones
* Eliminaciones

Incluye:

* Exportación de registros
* Filtros por usuario, tabla, tipo de acción y fechas
* Tabla detallada con eventos

---

# 🩺 3. Módulos del Rol Médico

## ▶️ Dashboard Médico

Incluye:

* Disponibilidad
* Citas asignadas
* Historial Médico
* Configuración (próximamente)

---

## 🕒 Gestión de Disponibilidad

Permite:

* Crear horarios
* Editar rangos
* Eliminar horarios

Incluye:

* Tarjetas por día
* Botón **Nueva Disponibilidad**

---

## 📅 Mis Citas

Permite:

* Ver citas asignadas
* Filtrar por estado, fecha o paciente
* Ver detalles
* Cambiar estado de cita

Incluye:

* Métricas:

  * Total
  * Hoy
  * Pendientes
  * Completadas
* Tarjetas con fecha, hora, paciente, estado y acciones

---

## 📚 Historial Médico

Permite registrar:

* Diagnósticos
* Tratamientos
* Observaciones

Incluye:

* Botón **+ Nuevo Historial**
* Búsqueda avanzada
* Tabla con paciente, fecha, diagnóstico, tratamiento, acciones

---

# 👤 4. Módulos del Rol Paciente

## ▶️ Dashboard Paciente

Accesos rápidos a:

* Agendar cita
* Mis citas
* Historial médico
* Configuración

---

## 📆 Agendar Cita

El paciente puede:

* Seleccionar especialidad
* Elegir médico
* Escoger fecha y hora disponibles
* Describir motivo de consulta
* Confirmar solicitud

---

## 📋 Mis Citas

Permite:

* Ver todas las citas
* Revisar estado (pendiente, confirmada, completada)
* Cancelar citas
* Ver detalles del médico

Incluye:

* Tarjetas con:

  * Fecha
  * Hora
  * Médico
  * Especialidad
  * Estado
* Botón **Cancelar Cita**

---

## 📝 Historial Médico

Permite:

* Consultar diagnósticos previos
* Ver tratamientos u observaciones
* Buscar registros

Si no tiene registros:
**“No hay historiales médicos registrados”**

---

# 📌 Recomendaciones

* Mantener datos actualizados
* Revisar citas periódicamente
* Cancelar con anticipación
* No compartir credenciales
* Revisar historial médico
* Reportar errores al equipo de desarrollo
* Revisar notificaciones del sistema

---

# 👨‍💻 Autores

| Nombre                                | Correo                                                                | Teléfono     |
| ------------------------------------- | --------------------------------------------------------------------- | ------------ |
| **José Stiven Rodas Beltrán**         | [jestiben1128@gmail.com](mailto:jestiben1128@gmail.com)               |+57 324 983 1975 |
| **Brandon Steven Carvajal Sepúlveda** | [brandoncarvajal2002@gmail.com](mailto:brandoncarvajal2002@gmail.com) |+57 313 212 3150 |

---

# 🏫 Universidad de Caldas

**Ingeniería en Informática – 6° Semestre**
**Proyecto Final — 2025**

---

# 📄 Licencia

Este proyecto y su documentación **NO pueden ser reproducidos** sin autorización expresa de los autores y la Universidad de Caldas.

```




