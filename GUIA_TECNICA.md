# Guía Técnica Arquitectónica - QhatuFy 🛠️

¡Bienvenido(a) a la guía técnica de QhatuFy! Este documento está diseñado para ayudarte a entender las decisiones tecnológicas, las estructuras de las carpetas y los flujos principales de la aplicación. Lo hemos redactado de manera **didáctica y clara** para que cualquier nuevo desarrollador pueda ponerse al corriente rápidamente.

---

## 1. Arquitectura de Rutas (Expo Router) 🛣️

Utilizamos **Expo Router**, que trae el concepto de *enrutamiento basado en sistema de archivos* (File-based routing) a React Native (similar a lo que hace Next.js en la web).

### ¿Qué significan los paréntesis `(auth)` y `(private)`?
Si exploras la carpeta `src/app`, notarás directorios con paréntesis: `(auth)` y `(private)`. 
Estos se llaman **Grupos de Rutas (Route Groups)**. Su propiedad principal es que **no agregan su nombre a la URL o segmento de la ruta**.
- Por ejemplo, el archivo `src/app/(auth)/login.tsx` no se navega como `/auth/login`, sino directamente como `/login`.
- **¿Para qué sirven entonces?** Sirven para **agrupar lógicamente** las pantallas y, más importante aún, para asignarles un Layout (`_layout.tsx`) específico a ese grupo (por ejemplo, estilos diferentes para pantallas públicas vs privadas) sin afectar la URL.

### ¿Cómo el `_layout.tsx` protege las rutas?
El archivo `src/app/_layout.tsx` funciona como el **Guardián de Autenticación (AuthGuard)** de la app.
En lugar de revisar la seguridad pantalla por pantalla, el `_layout.tsx` envuelve toda la aplicación. Escucha el estado global y evalúa tres cosas en cada cambio de pantalla:
1. **¿El usuario está autenticado?** Si no lo está, lo patea automáticamente a la pantalla de `/welcome` o `/login`.
2. **¿Ya completó su perfil?** Si está logueado pero aún no llena sus datos, lo encierra obligatoriamente en la pantalla de `complete-profile`.
3. **¿Está intentando entrar a zona prohibida?** Si trata de volver al login cuando ya tiene su sesión iniciada, lo redirige forzosamente hacia su `dashboard`.

---

## 2. Estado Global (Jotai) ⚛️

Para guardar información que necesitamos en *toda la app* (como saber quién es el usuario y si está logueado), usamos una librería llamada **Jotai**.

### ¿Qué es un "átomo" (`authAtom.ts`)?
En Jotai, un estado global no es un almacén gigante y complejo, sino piezas pequeñas llamadas **"átomos"**. 
Nuestro archivo `authAtom.ts` exporta un átomo que contiene tres piezas clave de información (una "caja de datos"):
- `user`: Datos del usuario (nombre, correo y un flag súper importante: `hasCompletedProfile`).
- `isAuthenticated`: Un interruptor (true/false) que nos dice si el usuario inició sesión con éxito.
- `token`: La llave de acceso para interactuar con los servidores en un futuro.

**¿Por qué usamos un átomo?**
Porque cualquier pantalla (login, perfil, dashboard, o el AuthGuard) puede "suscribirse" a este átomo. Si el usuario inicia sesión y cambia el estado de `isAuthenticated` a `true`, **todos los componentes que escuchan ese átomo** (como el _layout.tsx) se enteran al instante y actúan en consecuencia (como redirigir al usuario).

---

## 3. Lógica del Perfil Incompleto ⚠️

En QhatuFy, es fundamental que el usuario configure ciertos datos fijos (como su DNI/RUC) para poder generar citas. 

**¿Cómo funciona el flujo de perfil incompleto?**
1. Cuando el usuario hace Log-In por primera vez, nuestro servidor detecta que su perfil es nuevo y retorna un usuario con la bandera `hasCompletedProfile: false` dentro del estado global.
2. Tras el inicio de sesión exitoso, el AuthGuard del `_layout.tsx` enruta al usuario al `Dashboard` de manera predeterminada sin importar si su perfil está completo o no.
3. El `Dashboard` lee la bandera y despliega un banner de advertencia si `hasCompletedProfile` es `false`.
4. El usuario puede tocar el botón "COMPLETAR" que lo redigirá de manera voluntaria a la pantalla de `/(auth)/complete-profile`.
5. Cuando el usuario rellena su DNI y le da a finalizar, el átomo se actualiza con `hasCompletedProfile: true`, eliminando el banner del Dashboard y habilitando futuras acciones dentro de la app.

---

## 4. Estilos visuales (NativeWind) 💅

En lugar de escribir engorrosos objetos `StyleSheet.create({})` propios de React Native, en QhatuFy usamos **NativeWind**.

- **¿Qué es NativeWind?** Es un motor que permite usar **clases de TailwindCSS** directamente en componentes de React Native (por medio de la propiedad `className`).
- **¿Por qué lo usamos?** Porque nos permite diseñar pantallas de forma extremadamente ágil. En vez de escribir 5 líneas de código para centrar algo y ponerle padding, simplemente escribimos `className="flex-1 justify-center px-5"`. Esto disminuye las líneas de código visual, mantiene la consistencia del diseño corporativo y unifica la sintaxis moderna con el estándar de la web.

---

## 5. El Flujo de Navegación 🚀

El viaje del usuario, ahora que la arquitectura está limpia e implementada, sigue este camino estructurado:

1. 🏠 **Welcome (`/welcome`)**: Pantalla de aterrizaje. Informa de los beneficios del sistema a nuevos usuarios con un diseño elegante.
2. 🔑 **Login (`/login`)**: Autenticación corporativa estricta. Aquí validamos las credenciales y seteamos toda la sesión en nuestro átomo state (Jotai).
3. 📝 **Complete Profile (`/complete-profile`)**: Accesible desde el Dashboard cuando el usuario decide completar su perfil (disponible si `hasCompletedProfile` es false). Al completarlo, desaparecen las advertencias del dashboard.
4. 📈 **Dashboard (`/dashboard`)**: (Parte de nuestro grupo privado). Ahora es el hogar del usuario, donde verá el resumen de sus contratos, pagos y accesos rápidos a la gestión de agendamientos de citas.

---

## Conceptos Útiles 🧠

- **Componentes (`View`, `Text`, `TouchableOpacity`):** Son las piezas de legos nativas que nos provee React Native. A diferencia de la web, aquí no usamos `<div>` ni `<span>`.
- **KeyboardAvoidingView:** Un componente brillante que usamos en nuestras pantallas de Log-In y Registro. Su labor principal es empujar el contenido de la pantalla hacia arriba cada vez que el teclado virtual del celular del usuario se despliega, evitando que los campos de texto queden ocultos.
- **Expo:** El framework integral (la magia detrás del telón) que envuelve a React Native, otorgándonos un servidor de desarrollo rápido, acceso nativo sensato y herramientas preconfiguradas para no tener que pelear con compilaciones locales tortuosas.

