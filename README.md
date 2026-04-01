# forestPlus-FRONT (v1)

Aplicación frontend de gestión forestal (Versión 1). Este proyecto está desarrollado en **Angular 18** y actúa como la primera iteración de la plataforma de cara al usuario final y administradores.

## Arquitectura y Tecnologías
La aplicación cliente está construida sobre un stack moderno en ecosistema Angular:

- **Framework:** Angular 18 (Core, Routing, Forms, Animations).
- **UI & Estilos:** Angular Material `^18.2` y TailwindCSS `^3.4`. Uso extensivo de utilidades gracias a `@ngneat/tailwind`. Tipografías de Google Fonts y set de iconos de FontAwesome (`@fortawesome/fontawesome-free`).
- **Visualización y Mapas:** 
  - Gráficos integrados mediante `chart.js` y `ng2-charts`.
  - Visualización espacial/mapas mediante `maplibre-gl`.
- **Integración API & Tokens:** Generación automática del cliente mediante `openapi-generator-cli` apuntando al backend en `/v3/api-docs`. Manejo de tokens y decodificación mediante `jwt-decode`.
- **Internacionalización (i18n):** `@ngx-translate/core` para soporte multi-idioma.

## Estructura de Módulos (Features)
El enrutado principal (`app.routes.ts`) divide la aplicación en varias secciones clave protegidas por guards de autenticación y roles:

1. **Rutas Públicas:** Páginas de Login, Registro, Verificación de Email y Reseteo de contraseñas.
2. **Dashboard de Usuario (`User`):**
   - **Inicio / Mis árboles:** Vista y gestión de los árboles que el usuario posee, incluyendo compras de nuevos ejemplares (`/buy-tree`).
   - **Terrenos (`Lands`) / Mi Compañía:** Detalles de asignaciones espaciales para el perfil del usuario.
   - **Perfil:** Ajustes de usuario.
3. **Panel de Administración (`Admin` / `Company Admin`):**
   - Gestión integral de entidades de alto nivel: **Usuarios**, **Compañías**, **Terrenos (Lands)**, **Especies de Árboles (Tree Types)** y **Plantaciones Planificadas (Planned Plantations)**.
   - Formularios específicos asociados a cada entidad para su creación o manipulación por parte del administrador.

## Ejecución y Scripts Destacados
El archivo `package.json` expone los siguientes comandos útiles:

- `npm run start`: Inicia el servidor de desarrollo en entorno automático.
- `npm run start-local`: Inicia usando la configuración `local`.
- `npm run start-prod`: Inicia usando la configuración `production`.
- `npm run build:prod`: Empaqueta la aplicación para producción de forma optimizada.
- `npm run prod-to-back`: Compila y transfiere (`robocopy`) automáticamente la carpeta contenida en `/dist` al proyecto de Backend en Java/Spring Boot (`forestPlus-BACK/src/main/resources/static`).
- `npm run gen-api`: Genera los DAOs de Typescript usando la especificación del Swagger expuesto localmente en el puerto `8080`.

## Configuración y Entornos
La carpeta `src/environments/` aloja las configuraciones. Dependiendo del entorno, la aplicación:
- Apunta a `https://forestplusapp.com` como base del API productiva.
- Dispone de variables conectadas a la pasarela de pagos de **Redsys** (`sis.redsys.es`), URL del TPV y callbacks de pago. 
- Contiene variables como `envColor`, y banderines como `canBuy` y `launchDate` orientados a comportamientos funcionales dinámicos (UI condicional).