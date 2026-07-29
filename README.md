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
- UI: PrimeNG 20 (temas nativos Lara / Aura / Material / Nora) + PrimeIcons.
- Iconos: Iconify, Heroicons y PrimeIcons.

---

## PrimeNG (temas nativos, sin Tailwind)

Instalado y alineado con **Angular 20** (`primeng@20`, `@primeuix/themes`, `primeicons`).

> **Importante (v20):** ya no existen los CSS clásicos `lara-light-blue`, `saga-green`, etc. en `angular.json`.
> Los temas se activan con presets en `app.config.ts` vía `providePrimeNG`. El proyecto usa un preset **Lara + azul** (equivalente a `lara-light-blue`).

### Dependencias

```bash
nvm use 22.21.1
npm install primeng@20 @primeuix/themes primeicons
```

### Configuración global

1. **Tema** en `src/app/app.config.ts` (`provideAnimationsAsync` + `providePrimeNG` con preset Lara).
2. **Íconos** en `angular.json` → `styles`:
   - `node_modules/primeicons/primeicons.css`

### Cambiar de tema (presets por defecto)

```typescript
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Material from '@primeuix/themes/material';
import Nora from '@primeuix/themes/nora';

providePrimeNG({
  theme: { preset: Lara }, // o Aura | Material | Nora
});
```

Para una variante tipo “light blue”, se usa `definePreset(Lara, { semantic: { primary: { ...blue... } } })` (ver `app.config.ts`).

### Cómo importar y usar componentes (clases nativas)

Cada componente se importa de forma standalone (solo lo que uses):

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DatePicker } from 'primeng/datepicker'; // reemplazo de p-calendar en PrimeNG 20

@Component({
  standalone: true,
  imports: [FormsModule, Button, TableModule, DatePicker],
  template: `
    <p-button label="Guardar" icon="pi pi-check" styleClass="p-button" />

    <p-table [value]="products" styleClass="p-datatable">
      <ng-template #header>
        <tr>
          <th>Nombre</th>
        </tr>
      </ng-template>
      <ng-template #body let-product>
        <tr>
          <td>{{ product.name }}</td>
        </tr>
      </ng-template>
    </p-table>

    <p-datepicker [(ngModel)]="fecha" [showIcon]="true" />
  `,
})
export class EjemploPrimeNg {
  fecha: Date | null = null;
  products = [{ name: 'Producto 1' }];
}
```

Clases / selectores habituales que generan los componentes:

| Componente | Selector | Clases CSS nativas (ejemplos) |
|---|---|---|
| Botón | `p-button` | `p-button`, `p-button-label`, `pi` |
| Tabla | `p-table` | `p-datatable`, `p-datatable-table` |
| Fecha | `p-datepicker` (antes `p-calendar`) | `p-datepicker`, `p-datepicker-input` |

Íconos: clases `pi pi-*` (requiere `primeicons.css`).

### Verificación rápida

Con el servidor en marcha (`npm start`), abre:

`http://localhost:5000/#/primeng-smoke`

Deberías ver un botón y un datepicker con el tema Lara por defecto. Esa ruta es un smoke test y se puede eliminar cuando ya no la necesites.
