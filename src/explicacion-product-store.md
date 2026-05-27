# 🧠 Guía Definitiva: Arquitectura del ProductStore (SignalStore)

Este documento detalla el funcionamiento técnico, la gestión de estados y los métodos del `ProductStore`.

---

## Filosofía del Store: Gestión del Estado

El **NgRx SignalStore** actúa como el "cerebro" y la **única fuente de la verdad** de la aplicación. Su función principal es **gestionar y actualizar el estado** de las variables reactivas (Signals) de forma controlada.

Cuando los datos cambian (por una búsqueda, una carga inicial o una eliminación), el Store se encarga de procesar ese cambio y notificar a Angular para que la interfaz se actualice de manera inmediata y eficiente, sin necesidad de recargar la página.

---

## 1. El Estado Global (`withState`)

El Store centraliza la "verdad" de la aplicación en 6 variables reactivas:

- **items**: Array de productos mostrados.
- **brands / categories**: Listas maestras (Data Entry).
- **totalItems**: Contador total para la paginación.
- **filterQuery**: El término de búsqueda actual.
- **loading**: Estado visual de carga.

---

## 2. Actualización de Datos con `patchState`

`patchState` es la única forma de modificar el estado en un SignalStore.

- **¿Qué hace?**: Realiza una actualización "parcial" e "inmutable". No borra todo el estado, solo cambia las propiedades que le pasas.
- **Seguridad**: Al ser inmutable, Angular detecta el cambio inmediatamente y repinta solo lo necesario en la interfaz.

---

## 3. Optimización con Mapas (`withComputed`)

En lugar de buscar nombres en arrays, transformamos los datos en **Diccionarios**:

- **brandMap / categoryMap**: Permiten obtener un nombre enviando un ID: `map()[id]`.
- **productsCount**: Un conteo automático basado en la cantidad de productos cargados.
- **filteredProducts**: Un filtro en tiempo real que reacciona mientras el usuario escribe, sin necesidad de ir al servidor (ideal para búsquedas rápidas en memoria).

---

## 4. Métodos de Acción (`withMethods`)

### `searchProducts` (Búsqueda con Paginación)

Es el método más complejo. Incluye:

1. **`debounceTime(300)`**: Evita disparar peticiones por cada letra que el usuario escribe.
2. **`distinctUntilChanged`**: Si el usuario borra una letra y la vuelve a escribir rápido (quedando igual que antes), no hace la petición.
3. **Paginación**: Si `page === 1`, sobrescribe la lista. Si es `page > 1`, concatena los nuevos productos (`[...state.items(), ...res.items]`).

### `loadAllProducts`

A diferencia de `searchProducts`, este trae los productos sin filtros. Se usa generalmente para resetear la vista o cargar la tienda por primera vez.

### `removeProduct(id)`

Elimina un producto localmente del estado sin recargar la página:
`items: state.items().filter((p) => p.id !== id)`

### `loadBrands` y `loadCategories`

Cargan las listas maestras. Se ejecutan una sola vez gracias al hook `onInit`.

---

## 5. Manejo de Errores y Flujos (`rxMethod`)

Todos los métodos usan `pipe` y `catchError`:

- **`catchError(() => EMPTY)`**: Si el servidor falla (Error 500, 404), la aplicación no se rompe ("crash"). Simplemente deja de cargar, apaga el spinner de `loading` y mantiene los datos que ya tenía.
- **`switchMap`**: Si el usuario hace una búsqueda nueva mientras la anterior seguía cargando, `switchMap` cancela la petición vieja y prioriza la última.

---

## 6. Ejemplo de Uso en el HTML (`product-list`)

Gracias a los mapas y signals, el HTML queda limpio y eficiente:

```html
<div *ngFor="let product of store.items()">
  <span class="badge"> {{ store.brandMap()[product.brandId] || 'Genérico' }} </span>

  <h3>{{ product.title }}</h3>

  <button (click)="store.removeProduct(product.id)">Eliminar</button>
</div>

<div *ngIf="store.loading()">Cargando productos...</div>

--- ## 7. Ciclo de Vida y Carga Automática (withHooks) El Store usa el hook onInit para asegurar que
la aplicación tenga datos apenas arranca: onInit(store): Es un disparador automático. En cuanto el
Store se inyecta en la aplicación, llama a loadBrands() y loadCategories(). Importancia: Esto
garantiza que los Diccionarios de nombres (Punto 3) estén cargados y listos antes de que el primer
producto llegue a la pantalla. Así evitamos que el usuario vea IDs numéricos en lugar de nombres de
marcas.
```
