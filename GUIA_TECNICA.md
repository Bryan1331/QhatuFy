# Guía Técnica de QhatuFy 📘

Bienvenido(a). Esta guía explica **todo lo que necesitas saber** para entender y trabajar en el proyecto QhatuFy. Está escrita en un lenguaje sencillo, paso a paso. No importa si eres principiante.

---

## 📖 Parte 1: Glosario (Palabras que vas a ver mucho)

Antes de tocar el código, necesitas entender qué significan estas palabras.

| Término | ¿Qué es? |
|---|---|
| **React Native** | La herramienta con la que está hecha la app. Escribes código una sola vez y funciona en Android y en iPhone. |
| **Expo** | Un "kit de ayuda" que simplifica React Native. Nos da herramientas listas como la cámara, el almacenamiento, etc. |
| **TypeScript (.tsx)** | Es JavaScript pero con "reglas de seguridad". Te avisa si cometes un error antes de ejecutar la app. Los archivos terminan en `.tsx` en vez de `.js`. |
| **Pantalla (Screen)** | Un archivo que el usuario puede ver. Por ejemplo, la pantalla de Login o la de Dashboard. |
| **Componente** | Una pieza reutilizable. Un botón es un componente, una tarjeta es un componente. Es como un bloque de Lego: lo creas una vez y lo usas donde quieras. |
| **Expo Router** | El "GPS" de la app. Decide qué pantalla mostrar según la carpeta donde esté el archivo. Si creas el archivo `login.tsx` dentro de `src/app/(auth)/`, la app automáticamente crea la ruta `/login`. |
| **Ruta** | La "dirección" de una pantalla. Ejemplo: `/login`, `/dashboard`, `/welcome`. |
| **Jotai (Estado Global)** | La "memoria compartida" de la app. Si el usuario inicia sesión en la pantalla A, la pantalla B también lo sabe porque Jotai se lo dice. |
| **Átomo (Atom)** | Un pedazo específico de memoria de Jotai. `authAtom` es el átomo que recuerda si hay un usuario logueado o no. |
| **Supabase** | Nuestra base de datos en internet. Ahí se guardan los usuarios, las contraseñas, las fotos del DNI, todo. Es como un Google Drive pero para datos de la app. |
| **NativeWind / Tailwind** | El sistema de diseño. En vez de escribir archivos CSS largos, usamos "palabras clave" directamente en el código. Ejemplo: `bg-red-500` = fondo rojo. `text-white` = texto blanco. |
| **KYC** | "Know Your Customer" (Conoce a tu Cliente). Es el proceso donde le pedimos al usuario su DNI, dirección y foto para verificar su identidad. |
| **`View`** | El equivalente a un `<div>` en web. Es una "caja" invisible que sirve para agrupar cosas. |
| **`Text`** | El equivalente a un `<p>` o `<h1>` en web. Todo texto visible DEBE ir dentro de un `<Text>`. |
| **`TouchableOpacity`** | El equivalente a un `<button>` en web. Es el botón táctil de React Native. Se llama así porque se vuelve semitransparente ("opacity") cuando lo tocas. |
| **`onPress`** | Es el equivalente a `onClick` en web. Define qué función se ejecuta cuando el usuario presiona el botón. |
| **`useRouter()`** | Un "control remoto" que te permite cambiar de pantalla desde el código. |
| **`useAtom()`** | Un "cable" que conecta tu pantalla con la memoria de Jotai para leer o escribir datos. |
| **`async / await`** | Significa "esperar". Cuando la app necesita hablar con internet (Supabase), le decimos "espera la respuesta antes de continuar". |
| **`try / catch`** | Es como decir "intenta hacer esto, y si algo sale mal, haz esto otro". Se usa para manejar errores sin que la app se rompa. |
| **`export default`** | Le dice a la app: "Esta es la función principal de este archivo, úsala". Sin esto, Expo Router no puede mostrar tu pantalla. |
| **`import`** | Es como "traer una herramienta de otro archivo". Si necesitas el botón de React Native, lo importas: `import { TouchableOpacity } from 'react-native'`. |
| **Props** | Son "datos que le pasas a un componente". Si tienes un componente Tarjeta, le puedes pasar el título como prop: `<Tarjeta titulo="Hola" />`. |

---

## 📂 Parte 2: Estructura del Proyecto (¿Dónde va cada cosa?)

Todo el código vive en la carpeta `src/`. Aquí tienes el mapa completo:

```
src/
├── app/                    👈 LAS PANTALLAS (lo que el usuario ve)
│   ├── _layout.tsx         👈 EL GUARDIÁN (controla quién puede entrar a dónde)
│   ├── index.tsx           👈 Pantalla inicial (solo muestra un "cargando...")
│   ├── welcome.tsx         👈 Pantalla de bienvenida
│   ├── (auth)/             👈 Pantallas públicas (login, registro, completar perfil)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── complete-profile.tsx
│   ├── (private)/          👈 Pantallas privadas (solo para usuarios normales logueados)
│   │   └── dashboard.tsx
│   └── (admin)/            👈 Pantallas de administrador (solo para admins)
│       ├── index.tsx
│       └── verify-documents.tsx
│
├── components/             👈 PIEZAS REUTILIZABLES (Legos)
│   ├── admin/
│   │   └── SolicitudCard.tsx   (tarjeta de solicitud KYC)
│   └── dashboard/
│       └── PaymentCard.tsx     (tarjeta de pagos)
│
├── services/               👈 COMUNICACIÓN CON INTERNET (Supabase)
│   ├── supabase.ts             (conexión base)
│   ├── authService.ts          (login, registro, perfil)
│   ├── profileService.ts       (actualizar datos KYC)
│   ├── storageService.ts       (subir fotos del DNI)
│   └── adminService.ts         (funciones del admin)
│
├── store/                  👈 LA MEMORIA (Jotai)
│   ├── authAtom.ts             (recuerda si hay sesión activa)
│   └── adminAtom.ts            (recuerda estadísticas del admin)
│
└── types/                  👈 DEFINICIONES DE DATOS
    └── payment.ts              (define cómo es un objeto de pago)
```

### ¿Qué son los paréntesis `(auth)`, `(private)`, `(admin)`?

Son **grupos organizadores**. Los paréntesis le dicen a Expo Router: "estas carpetas son solo para organizar, **no las incluyas en la dirección**". Así que la ruta del archivo `src/app/(auth)/login.tsx` no es `/(auth)/login`, sino simplemente `/login`.

---

## 🧩 Parte 3: Ejemplos Paso a Paso

### ✅ Ejemplo 1: Crear una pantalla nueva

**Paso 1:** Crea un archivo dentro de `src/app/(private)/`. Llámalo `configuracion.tsx`.

**Paso 2:** Escribe este código mínimo:

```tsx
import { View, Text } from 'react-native';

export default function Configuracion() {
  return (
    <View>
      <Text>Pantalla de Configuración</Text>
    </View>
  );
}
```

**¿Qué significa cada línea?**
- `import` → Traemos las herramientas que necesitamos (View para la caja, Text para el texto).
- `export default function` → Creamos la función principal de esta pantalla y la exportamos para que Expo Router la encuentre.
- `return (...)` → Lo que está dentro del `return` es lo que se muestra en la pantalla.
- `<View>` → Caja contenedora (como un `<div>`).
- `<Text>` → Texto visible. **Regla de oro: todo texto SIEMPRE debe ir dentro de `<Text>`**, si no, la app se rompe.

**Resultado:** Ahora existe la ruta `/configuracion` y puedes navegar a ella.

---

### ✅ Ejemplo 2: Crear un botón

En React Native, los botones se crean con `<TouchableOpacity>`:

```tsx
import { View, Text, TouchableOpacity } from 'react-native';

export default function MiPantalla() {

  const hacerAlgo = () => {
    console.log('¡El botón funciona!');
  };

  return (
    <View>
      <TouchableOpacity onPress={hacerAlgo}>
        <Text>Presióname</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**¿Qué significa cada parte?**
- `const hacerAlgo = () => { ... }` → Creamos una función. El `() => {}` es simplemente la forma moderna de escribir funciones en JavaScript.
- `onPress={hacerAlgo}` → Le decimos al botón: "cuando te presionen, ejecuta la función `hacerAlgo`".
- `console.log(...)` → Escribe un mensaje en la consola (terminal). Es útil para probar que las cosas funcionan.

---

### ✅ Ejemplo 3: Navegar a otra pantalla (Redireccionar)

Para mover al usuario de una pantalla a otra necesitas el "enrutador" (`useRouter`):

```tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MiPantalla() {
  const router = useRouter();

  return (
    <View>
      <TouchableOpacity onPress={() => router.push('/configuracion')}>
        <Text>Ir a Configuración</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Hay dos formas de navegar:**
- `router.push('/ruta')` → Va a la nueva pantalla y **permite volver atrás** (como abrir una nueva pestaña).
- `router.replace('/ruta')` → Va a la nueva pantalla y **no permite volver atrás** (reemplaza la pantalla actual). Útil después de hacer login.

---

### ✅ Ejemplo 4: Leer datos del usuario (Jotai)

Si quieres mostrar el nombre del usuario que inició sesión:

```tsx
import { View, Text } from 'react-native';
import { useAtom } from 'jotai';
import { authAtom } from '../../store/authAtom';

export default function Saludo() {
  const [auth] = useAtom(authAtom);

  return (
    <View>
      <Text>Hola, {auth.user?.nombre || 'Invitado'}</Text>
    </View>
  );
}
```

**¿Qué significa `auth.user?.nombre`?**
- El signo `?` se llama "optional chaining" (encadenamiento opcional). Significa: "si `auth.user` existe, dame su `nombre`. Si no existe, no explotes, simplemente da `undefined`".
- El `||` significa "o". Entonces `auth.user?.nombre || 'Invitado'` se lee: "dame el nombre del usuario, o si no hay, pon 'Invitado'".

---

### ✅ Ejemplo 5: Guardar datos en Supabase (Base de datos)

Si quisieras guardar algo en la base de datos, así se hace en un servicio:

```tsx
// Dentro de src/services/miServicio.ts
import { supabase } from './supabase';

export const guardarNota = async (texto: string) => {
  try {
    const { error } = await supabase
      .from('notas')          // 1. Elige la tabla
      .insert({ texto });     // 2. Inserta el dato

    if (error) throw new Error(error.message);
    return true;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};
```

Luego en tu pantalla, importas y usas esa función:

```tsx
import { guardarNota } from '../../services/miServicio';

// Dentro de un botón:
const guardar = async () => {
  await guardarNota('Mi primera nota');
};
```

---

## 🛡️ Parte 4: El Guardián de la App (`_layout.tsx`)

El archivo `src/app/_layout.tsx` es el **más importante de toda la app**. Funciona como el guardia de seguridad de un edificio:

1. **¿No iniciaste sesión?** → Te manda a `/welcome` (la puerta principal).
2. **¿Iniciaste sesión y eres usuario normal?** → Te manda a `/(private)/dashboard`.
3. **¿Iniciaste sesión y eres administrador?** → Te manda a `/(admin)`.
4. **¿Intentas entrar a una zona prohibida?** → Te redirige automáticamente.

Tú no necesitas proteger cada pantalla individualmente. El Guardián se encarga de todo automáticamente. Solo créa tus pantallas dentro de la carpeta correcta (`(private)` para usuarios o `(admin)` para admins) y el Guardián hará el resto.

---

## 🚀 Parte 5: ¿Cómo funciona la app? (El recorrido del usuario)

Cuando alguien abre la app por primera vez, esto es lo que pasa:

```
1. Abre la app
      ↓
2. Se muestra un "Cargando..." (index.tsx)
      ↓
3. El Guardián revisa: ¿hay sesión guardada?
      ↓
   NO → Va a /welcome (pantalla de bienvenida)
         ↓
       Elige "Iniciar Sesión" → /login
       Elige "Registrarse"   → /register
         ↓
       Inicia sesión exitosamente
         ↓
   SÍ → ¿Qué rol tiene?
         ↓
       Es "user"  → Va a /(private)/dashboard
       Es "admin" → Va a /(admin)
```

### ¿Y el proceso KYC?

Después del registro, el usuario necesita completar su perfil (subir DNI, dirección, celular). Eso se hace en la pantalla `complete-profile.tsx`. Cuando el usuario sube sus documentos:

1. La foto se sube a Supabase Storage (`storageService.ts`).
2. Los datos se guardan en la tabla `perfiles` (`profileService.ts`).
3. El admin recibe la solicitud en su panel y puede aprobarla o rechazarla (`adminService.ts`).

---

## 🎨 Parte 6: Estilos Rápidos (NativeWind)

En este proyecto usamos NativeWind (Tailwind para React Native). Aquí van los estilos más usados:

| Lo que quieres | Clase que usas | Ejemplo |
|---|---|---|
| Fondo negro | `bg-black` o `bg-[#0A0A0A]` | `<View className="bg-black">` |
| Texto blanco | `text-white` | `<Text className="text-white">` |
| Texto grande | `text-2xl` | `<Text className="text-2xl">` |
| Texto en negrita | `font-bold` | `<Text className="font-bold">` |
| Bordes redondeados | `rounded-xl` | `<View className="rounded-xl">` |
| Espacio interno | `p-4` (padding) | `<View className="p-4">` |
| Espacio externo | `m-4` (margin) | `<View className="m-4">` |
| Centrar todo | `items-center justify-center` | `<View className="items-center justify-center">` |
| Ocupar toda la pantalla | `flex-1` | `<View className="flex-1">` |
| Poner cosas en fila | `flex-row` | `<View className="flex-row">` |

**Tip:** Los colores con `[]` como `bg-[#5C8FFB]` son colores personalizados en formato hexadecimal. Los colores sin `[]` como `bg-red-500` son colores predefinidos de Tailwind.

---

## 📋 Parte 7: Resumen de Reglas Importantes

1. **Todo texto debe ir dentro de `<Text>`**. Si pones texto suelto dentro de un `<View>`, la app se rompe.
2. **Siempre usa `export default function`** en tus pantallas para que Expo Router las detecte.
3. **Usa `router.replace()` después del login** para que el usuario no pueda volver atrás a la pantalla de login con el botón "atrás".
4. **Siempre envuelve las llamadas a Supabase en `try/catch`** para que si algo falla, la app no se congele.
5. **Los archivos de pantalla van en `src/app/`**, los componentes reutilizables en `src/components/`, y la lógica de base de datos en `src/services/`.
6. **Nunca modifiques `_layout.tsx` si no sabes lo que haces**. Es el guardián y si se rompe, toda la navegación falla.
