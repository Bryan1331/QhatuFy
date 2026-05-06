# Guía Técnica Arquitectónica - QhatuFy 🛠️

¡Bienvenido(a) a la guía técnica de QhatuFy! Este documento está diseñado para ayudarte a entender las decisiones tecnológicas, las estructuras de las carpetas, flujos principales y cómo añadir o modificar características dentro de la aplicación.

---

## 1. Arquitectura de Rutas (Expo Router) 🛣️

Utilizamos **Expo Router**, que trae el concepto de *enrutamiento basado en sistema de archivos* (File-based routing) a React Native.

### ¿Qué significan los paréntesis `(auth)` y `(private)`?
Son **Grupos de Rutas (Route Groups)**. **No agregan su nombre a la URL o segmento de la ruta**.
- Sirven para **agrupar lógicamente** las pantallas y para asignarles un Layout (`_layout.tsx`) específico a ese grupo (por ejemplo, estilos diferentes para pantallas públicas vs privadas) sin afectar la URL.

### El Guardián de Rutas (`_layout.tsx`)
El archivo `src/app/_layout.tsx` funciona como el **Guardián de Autenticación (AuthGuard)** de la app. Escucha el estado global y evalúa:
1. **Autenticación**: Patea al `/welcome` si no estás logueado.
2. **KYC (Know Your Customer)**: Encierra al usuario en `complete-profile` si le falta información.
3. **Redirección Mágica**: Si entras a `/login` ya estando logueado, te lleva a tu `dashboard`.

---

## 2. Estado Global (Jotai) ⚛️

Usamos **Jotai** a través de `src/store/authAtom.ts` para guardar el estado del usuario de forma atómica y ligera.

### ¿Para qué sirve el Átomo `authAtom`?
Guarda tres cosas:
- `user`: Datos (id, name, email) y los campos del KYC (dni, direccion, celular).
- `isAuthenticated`: Booleano para saber si hay sesión activa.
- `token`: Reservado para el JWT.

**Modificar el Estado:** Importas `useSetAtom(authAtom)` y lo actualizas. Cualquier componente escuchando `useAtom(authAtom)` se re-renderizará al instante.

---

## 3. Integración con Supabase (Backend as a Service) 🗄️

Hemos sustituido cualquier mock o backend complejo por **Supabase**. Las funciones de conexión están centralizadas y limpias.

### Archivos clave:
- `src/services/supabase.ts`: Inicializa el cliente usando tus variables de entorno (`.env`).
- `src/services/authService.ts`: **Central de Lógica**. Aquí se encuentran `signUpUser`, `signInUser` y `updateUserProfile`. 

**¿Cómo añadir una nueva funcionalidad con base de datos?**
1. Crea una nueva función asíncrona en `authService.ts` (o en un nuevo servicio, ej: `paymentService.ts`).
2. Usa el cliente exportado de `supabase.ts` para hacer tus querys: `await supabase.from('tabla').insert(datos)`.
3. Maneja los errores con `try/catch` para poder mostrarlos en la UI.
4. Importa la función desde tu pantalla y actívala con un botón.

---

## 4. Estilos visuales y UI Premium (NativeWind) 💅

En QhatuFy usamos **NativeWind**, que nos permite usar **clases de TailwindCSS** (`className`) directamente en React Native.

**Reglas de Diseño Corporativo:**
- Fondos oscuros: `bg-[#0A0A0A]` o `bg-[#131517]`.
- Entradas (Inputs): `bg-[#1C1C1E]` o `bg-[#1D1D1F]` con bordes sutiles `border-white/5`.
- Acentos: `text-[#5C8FFB]` o botones `bg-blue-600`.

---

## 5. El Flujo de Navegación 🚀

1. 🏠 **Welcome (`/welcome`)**: Pantalla de aterrizaje.
2. 🔑 **Login / Register (`/login`, `/register`)**: Autenticación. Consumen directamente las funciones de `authService.ts` conectadas a Supabase Auth, realizan validaciones locales previas a la petición y actualizan el átomo Jotai.
3. 📝 **Complete Profile (`/complete-profile`)**: Flujo KYC. Pide DNI, Dirección y **Celular** (con el teclado `phone-pad`). Además captura fotos usando `expo-image-picker`. Todo se envía a Supabase en la tabla `perfiles`.
4. 📈 **Dashboard (`/dashboard`)**: Hogar del usuario autenticado y perfilado. Muestra el componente `PaymentCard` (acordeón dinámico calculado con `useMemo`).

---

## Conceptos Útiles y Patrones de UX 🧠

- **Componentes Nativos:** `View`, `Text`, `TouchableOpacity` sustituyen a los clásicos div/span de la web.
- **Evitar que el Teclado oculte Inputs (Patrón UX):**
  A veces el teclado nativo tapa el contenido de la pantalla. En QhatuFy esto se soluciona envolviendo el contenido con este patrón que puedes copiar si creas nuevas pantallas:
  ```tsx
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
         {/* Tu Formulario va aquí */}
      </ScrollView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  ```
- **Manejo de Errores Visuales:** Usa siempre estados de `loading` (booleans) y muestra un `ActivityIndicator` dentro del botón para dar retroalimentación al usuario y evitar dobles peticiones.
