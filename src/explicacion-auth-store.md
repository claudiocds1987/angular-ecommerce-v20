# 🛠️ Arquitectura de Sesión: AuthStore y Rehidratación

> Gestión de identidad con **NgRx SignalStore** (Frontend) + **JWT** (Backend) · Flujo de refresco de página

---

## 1. El corazón del estado: `AuthStore`

Store Global (Singleton) que centraliza el estado de autenticación.

### Estado (`withState`)

| Propiedad | Tipo             | Descripción                                                                |
| --------- | ---------------- | -------------------------------------------------------------------------- |
| `user`    | `User \| null`   | Objeto con datos, rol y token del usuario. `null` si no hay sesión activa. |
| `loading` | `boolean`        | Gestiona la UI durante peticiones asíncronas en curso.                     |
| `error`   | `string \| null` | Almacena el error de la última petición fallida.                           |

---

## 2. Flujo de login (`login rxMethod`)

Proceso de creación de la sesión.

**Recorrido:** `Credenciales` → `POST /login` → `Respuesta exitosa` → `Redirigir`

### Pasos

**a) Petición**
Envía credenciales al endpoint `${apiUrl}/login`.

**b) Persistencia física** `localStorage`
Al recibir respuesta exitosa, guarda `user.token` en `localStorage` bajo la clave `'token'`.

**c) Persistencia en memoria** `Store`
Actualiza el estado del Store con el objeto `user` completo.

**d) Enrutamiento inteligente**
Lee `user.role` (obtenido de la DB) y redirige a `/admin` o a la tienda `/`.

---

## 3. Mecanismo de resiliencia: `initializeAuth`

Resuelve la pérdida de memoria volátil al refrescar la página (F5).

> ⚠️ **Cuándo ejecutarlo:** En el arranque de la aplicación, generalmente en `app.component.ts` o un `APP_INITIALIZER`.

### Pasos

**Paso 1 — Detección**
Busca `'token'` en `localStorage`. Si no existe → aborta (el usuario es invitado).

**Paso 2 — Validación crucial** `GET /me`
Si hay token, consulta el endpoint `/me`. El backend extrae la identidad del JWT inyectado en la cabecera por el Interceptor.

**Paso 3 — Rehidratación** ✅
Si el servidor responde con éxito → el Store se "llena" nuevamente con los datos del usuario.

**Paso 4 — Fallback de seguridad** ❌
Si el token expiró → el bloque `catch` limpia `localStorage` para evitar reintentos fallidos futuros.

---

## 4. Finalización de sesión: `logout`

Proceso de limpieza total para garantizar la seguridad del usuario.

### Limpieza de disco

- **a)** Elimina `'token'` del `localStorage`.
- **b)** Elimina `'shopping_cart'` del `localStorage`.

### Limpieza de memoria

- **c)** Resetea el estado del usuario en el Store a `null` y vacía el carrito vía `CartService`.
- **d)** Redirige al usuario a `/login`.
