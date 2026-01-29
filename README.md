# E-Commerce V20 con IA (Gemini)

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 20.3.13 e integra Inteligencia Artificial para la interacción con productos.

---

## 🛠️ Requisitos para el Desarrollo

### 1. Versión de Node.js (Crítico)
Este proyecto requiere **Node.js v22.21.1**. Si no tienes esta versión, el proyecto podría presentar errores de compilación.

* **Si usas NVM (recomendado):**
    ```bash
    nvm install 22.21.1
    nvm use 22.21.1
    ```
* **Si no tienes la versión correcta:** Por favor, instala [NVM (Node Version Manager)](https://github.com/coreybutler/nvm-windows) para asegurar la compatibilidad entre versiones de Node.

### 2. Permisos de Sistema
Para asegurar que las herramientas de Angular funcionen sin conflictos de permisos:
* Se recomienda ejecutar el editor (VS Code) en **Modo Administrador**.

### 3. Instalación de Dependencias
Una vez situada la versión de Node correcta, instala los módulos necesarios:
npm install

 🚀 Servidor de Desarrollo
 Para arrancar el proyecto localmente, utiliza el script configurado:
 npm start

 Una vez que el servidor esté corriendo, navega a http://localhost:5000/. La aplicación se recargará automáticamente si modificas los archivos fuente.

 🤖 Integración de IA
 El proyecto utiliza Google Generative AI (Gemini) para potenciar la búsqueda y descripción de productos.

- SDK: @google/generative-ai
- Modelo: gemini-3-flash-preview.
- Seguridad: Las llaves de API cuentan con restricciones de dominio (HTTP Referrer) para evitar el uso no autorizado en sitios externos.

🎨 Tecnologías Utilizadas
- Framework: Angular 20.
- Estilos: Tailwind CSS v4.1.
- Iconos: Iconify y Heroicons.
