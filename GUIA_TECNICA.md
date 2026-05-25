# GUIA_TECNICA.md — QhatuFy

Guía práctica para entender, navegar y trabajar en el proyecto. Está basada en el código real del proyecto, no en suposiciones.

---

## 1. ¿Qué es QhatuFy?

QhatuFy es una app móvil para la **gestión de alquileres de locales comerciales en una galería**. Tiene dos tipos de usuario:

- **Inquilino** — Puede ver el catálogo de locales, agendar visitas, firmar contratos y revisar sus pagos.
- **Administrador** — Puede aprobar/rechazar identidades (KYC), gestionar locales, contratos y citas.

La app funciona con conexión a internet para sincronizar datos con Supabase, pero también **guarda información localmente en SQLite** para que el inquilino pueda ver sus contratos y pagos sin conexión.

---

## 2. Stack de tecnologías

| Tecnología | Para qué sirve en este proyecto |
|---|---|
| **React Native** | Framework base de la app. Todo el UI está construido con él. |
| **Expo** | Simplifica el acceso a APIs nativas (galería de fotos, sistema de archivos). Metro Bundler corre en terminal con `npx expo start`. |
| **TypeScript** | Todos los archivos son `.tsx` o `.ts`. Añade tipado estricto para detectar errores antes de ejecutar. |
| **Expo Router** | El enrutador del proyecto. La estructura de carpetas en `src/app/` define automáticamente las rutas. |
| **Jotai** | Manejo de estado global. Se usa para la sesión del usuario (`authAtom`) y estadísticas del admin (`adminStatsAtom`). |
| **Supabase** | Backend completo: base de datos PostgreSQL en la nube, autenticación de usuarios y almacenamiento de archivos (bucket `documentos`). |
| **SQLite (expo-sqlite)** | Base de datos local en el dispositivo. Almacena contratos, pagos, citas y locales para funcionar offline. |
| **NativeWind** | Clases de Tailwind CSS aplicadas en React Native. Se usan directamente como `className="..."` en los componentes. |
| **expo-image** | Componente de imagen optimizado (lazy loading, caché, transiciones). Se usa en lugar del `<Image>` estándar. |
| **expo-image-picker** | Permite al usuario seleccionar fotos de su galería (usado en el flujo KYC). |
| **base64-arraybuffer** | Convierte imágenes de Base64 a ArrayBuffer para subirlas a Supabase Storage sin errores de red. |

---

## 3. Estructura del proyecto

```
QhatuFy/
├── src/
│   ├── app/                  ← PANTALLAS (Expo Router las mapea como rutas)
│   │   ├── _layout.tsx       ← GUARDIÁN CENTRAL. Controla autenticación y redirecciones.
│   │   ├── index.tsx         ← Pantalla de splash/carga inicial
│   │   ├── welcome.tsx       ← Pantalla pública de bienvenida (Login / Registro)
│   │   ├── (auth)/           ← Grupo de rutas públicas
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── complete-profile.tsx  ← Formulario KYC (DNI, celular, foto del documento)
│   │   │   └── terms.tsx
│   │   ├── (private)/        ← Grupo de rutas del INQUILINO (protegidas)
│   │   │   ├── _layout.tsx   ← Define la barra de pestañas inferior (Catálogo / Home / Cita)
│   │   │   ├── index.tsx     ← Dashboard principal del inquilino
│   │   │   ├── catalog.tsx   ← Catálogo de locales disponibles
│   │   │   ├── store-detail.tsx
│   │   │   ├── appointments.tsx
│   │   │   ├── my-contracts.tsx
│   │   │   ├── rules.tsx
│   │   │   └── profile.tsx
│   │   └── (admin)/          ← Grupo de rutas del ADMINISTRADOR (protegidas)
│   │       ├── index.tsx     ← Dashboard del admin
│   │       ├── verify-documents.tsx
│   │       ├── manage-contracts.tsx
│   │       ├── manage-stores.tsx
│   │       ├── manage-appointments.tsx
│   │       └── create-store.tsx
│   │
│   ├── components/           ← Componentes reutilizables (no son pantallas completas)
│   │   ├── admin/
│   │   │   └── SolicitudCard.tsx    ← Tarjeta KYC para el admin (muestra foto anverso/reverso)
│   │   ├── catalog/
│   │   │   └── LocalCard.tsx        ← Tarjeta de un local en el catálogo
│   │   └── dashboard/
│   │       └── PaymentCard.tsx      ← Tarjeta de pagos próximos
│   │
│   ├── services/             ← Toda la lógica de comunicación externa (Supabase, SQLite, Storage)
│   │   ├── supabase.ts       ← Instancia del cliente Supabase (usa variables de entorno)
│   │   ├── authService.ts    ← signUp, signIn, updateKYCProfile, getExtendedProfile
│   │   ├── adminService.ts   ← Verificaciones KYC, CRUD de locales, estadísticas del admin
│   │   ├── catalogService.ts ← Obtener locales disponibles (getAvailableLocales, getLocalById)
│   │   ├── storageService.ts ← Subir imágenes al bucket 'documentos' de Supabase
│   │   ├── syncService.ts    ← Sincronizar datos de Supabase → SQLite local
│   │   └── localDb.ts        ← Esquema SQLite e inicialización de la base de datos local
│   │
│   ├── store/                ← Estado global (Jotai)
│   │   ├── authAtom.ts       ← Sesión activa y perfil del usuario
│   │   └── adminAtom.ts      ← Estadísticas del admin (pendingKYC)
│   │
│   └── types/                ← Interfaces TypeScript puras (sin lógica)
│       └── payment.ts        ← Interface PaymentRequirement
│
├── app.json                  ← Configuración de Expo (nombre de la app, íconos, etc.)
├── tailwind.config.js        ← Configuración de NativeWind/Tailwind
└── .env                      ← Variables de entorno (Supabase URL y clave anónima)
```

### ¿Por qué los grupos de rutas usan paréntesis?

En Expo Router, `(auth)`, `(private)` y `(admin)` son **grupos de rutas**. El paréntesis le dice al router que **no incluya el nombre del grupo en la URL**. Sirven para organizar pantallas y aplicar un layout específico a cada grupo sin afectar la navegación.

- `(auth)/login.tsx` → se navega como `/login`
- `(private)/index.tsx` → se navega como `/` dentro del área privada
- `(admin)/index.tsx` → se navega como `/(admin)`

---

## 4. Cómo fluye la aplicación

### Al abrir la app

```
App abre → _layout.tsx se ejecuta
         → supabase.auth.onAuthStateChange() escucha si hay sesión guardada
         → Si hay sesión: carga el perfil completo desde tabla 'perfiles'
         → Guardián de rutas decide a dónde enviar al usuario:

┌─ Sin sesión ──────────────────────────┐
│  → /welcome                           │
└───────────────────────────────────────┘

┌─ Con sesión, KYC incompleto ──────────┐
│  → /complete-profile                  │
└───────────────────────────────────────┘

┌─ Con sesión, rol = 'admin' ───────────┐
│  → /(admin)                           │
└───────────────────────────────────────┘

┌─ Con sesión, rol = 'user' ────────────┐
│  → /(private)  (Dashboard inquilino)  │
└───────────────────────────────────────┘
```

### En el Dashboard del inquilino (`(private)/index.tsx`)

Al cargar la pantalla, el flujo es:
1. Lee datos de SQLite local (inmediato, sin internet)
2. Sincroniza con Supabase en segundo plano (`syncTenantData`)
3. Actualiza la UI con los datos frescos

Este patrón se llama **"Offline-First"**: el usuario siempre ve datos aunque no tenga internet.

---

## 5. El guardián: `_layout.tsx`

Este es el archivo más crítico del proyecto. **No lo modifiques sin entender bien cómo funciona.**

Hace tres cosas:
1. **Escucha cambios de sesión** — `supabase.auth.onAuthStateChange()` reacciona cuando el usuario inicia o cierra sesión.
2. **Hidrata el perfil** — Llama a `getExtendedProfile()` para cargar los datos del usuario desde la tabla `perfiles` de Supabase.
3. **Redirige automáticamente** — Basándose en `isAuthenticated`, `hasCompletedProfile` y `role`, envía al usuario a la pantalla correcta.

```tsx
// Simplificado de _layout.tsx
if (!authState.isAuthenticated) → router.replace('/welcome')
if (role === 'admin')           → router.replace('/(admin)')
else                            → router.replace('/(private)')
```

Toda pantalla dentro de `(private)` y `(admin)` está automáticamente protegida por este guardián.

---

## 6. Estado global con Jotai

**Jotai** almacena datos que necesitan ser accesibles desde múltiples pantallas sin tener que pasarlos por props.

### `authAtom` — el más importante

```ts
// src/store/authAtom.ts
export interface UserProfile {
  id: string;
  nombre: string | null;
  email: string;
  role: 'user' | 'admin';
  verificacion_status: 'pendiente' | 'aprobado' | 'rechazado';
  hasCompletedProfile: boolean;
  dni?: string;
  direccion?: string;
  celular?: string;
  foto_dni_url?: string;    // Contiene URLs de anverso y reverso separadas por coma
}
```

**Cómo leerlo en cualquier pantalla:**
```tsx
import { useAtom } from 'jotai';
import { authAtom } from '../../store/authAtom';

const [auth] = useAtom(authAtom);
// auth.user?.nombre, auth.user?.role, auth.isAuthenticated, etc.
```

**Cómo modificarlo:**
```tsx
const [auth, setAuth] = useAtom(authAtom);

setAuth((prev) => ({
  ...prev,
  user: { ...prev.user!, nombre: 'Nuevo nombre' }
}));
```

---

## 7. Capa de servicios (`src/services/`)

Toda la comunicación con Supabase o SQLite va aquí. Las pantallas **nunca deben hacer queries directas** — siempre deben llamar a una función de un servicio.

| Archivo | Funciones principales |
|---|---|
| `authService.ts` | `signUpUser`, `signInUser`, `updateKYCProfile`, `getExtendedProfile` |
| `adminService.ts` | `getPendingVerifications`, `updateVerification`, `getDashboardStats`, `createNewStore`, `updateStore`, `deleteStore`, `getAdminStores` |
| `catalogService.ts` | `getAvailableLocales`, `getLocalById` |
| `storageService.ts` | `uploadDocumentImage` (sube imagen en Base64 al bucket `documentos`) |
| `syncService.ts` | `syncTenantData`, `getLocalPayments`, `getLocalActiveContract`, `getLocalAppointments` |
| `localDb.ts` | `getLocalDb` (abre conexión), `initLocalDb` (crea tablas) |

### Cómo llamar a un servicio desde una pantalla

```tsx
import { getAvailableLocales } from '../../services/catalogService';

const [locales, setLocales] = useState([]);

useEffect(() => {
  const load = async () => {
    const data = await getAvailableLocales();
    setLocales(data);
  };
  load();
}, []);
```

---

## 8. Base de datos local (SQLite)

El archivo físico se llama **`qhatufy_v2.db`** y se crea automáticamente en el dispositivo la primera vez que corre `initLocalDb()`.

### Tablas locales

```sql
locales    (id, nombre, ubicacion, imagen_url, precio)
contratos  (id, inquilino_id, local_id, estado, documento_url)
pagos      (id, contrato_id, monto, moneda, fecha_vencimiento, estado)
citas      (id, local_id, fecha_hora, estado)
```

### Cuándo se inicializa

En `(private)/index.tsx` al cargar el Dashboard:
```ts
await initLocalDb();   // Crea las tablas si no existen
await syncTenantData(auth.user.id);  // Descarga datos de Supabase → SQLite
```

> **Truco de depuración**: Si hay errores de tipo `no such table`, cambia el nombre del archivo en `localDb.ts` (ej: de `qhatufy_v2.db` a `qhatufy_v3.db`). Esto fuerza una recreación limpia de todas las tablas.

---

## 9. Flujo KYC (Verificación de Identidad)

Este es el proceso más complejo del proyecto:

```
1. Usuario se registra (register.tsx)
   └─ supabase.auth.signUp() + perfil creado con has_completed_profile = false

2. App lo redirige a complete-profile.tsx
   └─ Ingresa DNI, celular, dirección
   └─ Selecciona foto del ANVERSO del DNI (pickImage('front'))
   └─ Selecciona foto del REVERSO del DNI (pickImage('back'))

3. Al presionar "Finalizar Verificación":
   └─ storageService.uploadDocumentImage(userId + '_front', uriFront)
   └─ storageService.uploadDocumentImage(userId + '_back', uriBack)
   └─ Se concatenan las dos URLs: "url_front,url_back"
   └─ authService.updateKYCProfile() guarda la URL combinada en foto_dni_url

4. Admin revisa en verify-documents.tsx
   └─ SolicitudCard.tsx separa foto_dni_url.split(',') → [frontImage, backImage]
   └─ Admin presiona "Aprobar" → verificacion_status = 'aprobado'
   └─ Admin presiona "Rechazar" → verificacion_status = 'rechazado',
                                   has_completed_profile = false,
                                   foto_dni_url = null

5. Inquilino aprobado puede agendar visitas y ver contratos
```

> **Nota sobre `foto_dni_url`**: Este campo almacena **dos URLs separadas por coma**. Para mostrarlas correctamente: `const [frontUrl, backUrl] = item.foto_dni_url.split(',')`.

---

## 10. Cómo hacer tareas comunes

### Crear una pantalla nueva para el inquilino

1. Crea el archivo en `src/app/(private)/soporte.tsx`:

```tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SoporteScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <View className="flex-1 px-5 pt-6">
        <Text className="text-white text-2xl font-bold">Soporte</Text>
      </View>
    </SafeAreaView>
  );
}
```

2. Si quieres agregarla a la barra de pestañas, edita `src/app/(private)/_layout.tsx`:

```tsx
<Tabs.Screen
  name="soporte"
  options={{
    title: 'Soporte',
    tabBarIcon: ({ color }) => <Ionicons name="headset-outline" size={22} color={color} />,
  }}
/>
```

3. Si **no** quieres que aparezca en la barra (solo que sea accesible por código):

```tsx
<Tabs.Screen name="soporte" options={{ href: null, headerShown: false }} />
```

---

### Navegar entre pantallas

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Agrega al historial (el usuario puede volver atrás)
router.push('/(private)/soporte');

// Reemplaza la pantalla actual (sin historial — úsalo tras login/logout)
router.replace('/welcome');
```

---

### Leer datos del usuario logueado

```tsx
import { useAtom } from 'jotai';
import { authAtom } from '../../store/authAtom';

const [auth] = useAtom(authAtom);

// Acceder a datos:
auth.user?.nombre         // string | null
auth.user?.role           // 'user' | 'admin'
auth.user?.verificacion_status   // 'pendiente' | 'aprobado' | 'rechazado'
auth.isAuthenticated      // boolean
```

---

### Llamar a Supabase desde un servicio nuevo

Crea el archivo en `src/services/miServicio.ts`:

```ts
import { supabase } from './supabase';

export const getMisDatos = async (userId: string) => {
  const { data, error } = await supabase
    .from('mi_tabla')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data || [];
};
```

Luego llámalo desde la pantalla:

```tsx
import { getMisDatos } from '../../services/miServicio';

useEffect(() => {
  getMisDatos(auth.user!.id).then(setData).catch(console.error);
}, []);
```

---

### Crear un componente reutilizable

Crea en `src/components/MiBoton.tsx`:

```tsx
import { Text, TouchableOpacity } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function MiBoton({ label, onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`bg-blue-600 rounded-full py-4 items-center ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className="text-white font-bold">{label}</Text>
    </TouchableOpacity>
  );
}
```

Úsalo en cualquier pantalla:

```tsx
import { MiBoton } from '../../components/MiBoton';

<MiBoton label="Confirmar" onPress={handleConfirm} />
```

---

### Agregar un tipo TypeScript

En `src/types/miTipo.ts`:

```ts
export interface Visita {
  id: string;
  localId: string;
  fecha: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}
```

---

### Manejar un formulario con estado

```tsx
const [nombre, setNombre] = useState('');
const [email, setEmail] = useState('');

const isValid = nombre.trim().length > 0 && email.includes('@');

// En el JSX:
<TextInput
  value={nombre}
  onChangeText={setNombre}
  placeholder="Tu nombre"
  placeholderTextColor="#6B7280"
  style={{ color: 'white' }}
  className="bg-[#1C1C1E] rounded-2xl px-4 h-14"
/>

<TouchableOpacity
  onPress={handleSubmit}
  disabled={!isValid}
  className={`bg-blue-600 rounded-full py-4 items-center ${!isValid ? 'opacity-50' : ''}`}
>
  <Text className="text-white font-bold">Enviar</Text>
</TouchableOpacity>
```

---

## 11. Flujo normal de desarrollo

Cuando vas a agregar una funcionalidad nueva, el orden típico es:

1. **Definir el tipo** en `src/types/` si vas a trabajar con datos nuevos.
2. **Crear o modificar el servicio** en `src/services/` con las funciones que tocan Supabase o SQLite.
3. **Crear la pantalla o componente** en `src/app/` o `src/components/`.
4. **Si es una pantalla nueva**, registrarla en el `_layout.tsx` del grupo correspondiente.
5. **Si necesita datos globales**, usar `useAtom(authAtom)` para leer el usuario.

**Archivos que se tocan con más frecuencia:**
- Pantallas en `src/app/(private)/` o `src/app/(admin)/`
- Servicios en `src/services/`
- Componentes en `src/components/`

**Archivos que casi no deberían tocarse:**
- `src/app/_layout.tsx` — solo si cambias la lógica de autenticación
- `src/store/authAtom.ts` — solo si agregas campos al perfil de usuario
- `src/services/supabase.ts` — no se toca, es solo la instancia

---

## 12. Dependencias importantes

| Paquete | Por qué es importante |
|---|---|
| `expo-router` | Toda la navegación depende de él. Cambiarlo rompería todas las rutas. |
| `jotai` | El estado global (`authAtom`) lo usan casi todas las pantallas. |
| `@supabase/supabase-js` | Toda la comunicación con el backend. Crítico. |
| `expo-sqlite` | La base de datos offline. Si se elimina, el dashboard no funciona sin internet. |
| `expo-image-picker` | Usado en el flujo KYC para seleccionar fotos. |
| `expo-file-system` | Necesario para leer imágenes en Base64 antes de subirlas. |
| `base64-arraybuffer` | Convierte el Base64 a ArrayBuffer para Supabase Storage. Sin esto, la subida de imágenes falla. |
| `nativewind` | Sistema de estilos. Si se elimina, toda la UI pierde sus estilos. |
| `react-native-safe-area-context` | Evita que el contenido quede detrás de la notch o barra de estado. |

---

## 13. Errores comunes y cómo resolverlos

### `no such table: pagos` (o cualquier tabla SQLite)
**Causa**: El archivo `.db` local tiene un esquema viejo o está corrupto.  
**Solución**: Cambia el nombre en `localDb.ts` de `qhatufy_v2.db` a `qhatufy_v3.db`. Esto crea un archivo nuevo y ejecuta `initLocalDb` desde cero.

---

### Error al subir imagen: `TypeError: Network request failed`
**Causa**: Se está intentando subir la imagen directamente como URI local, en lugar de convertirla a Base64 primero.  
**Solución**: Usar `storageService.uploadDocumentImage()` que ya maneja la conversión correctamente.

---

### La app redirige en bucle o no navega bien
**Causa**: Se modificó la lógica de `_layout.tsx` sin considerar todos los estados posibles (`isLoading`, `hasCompletedProfile`, etc.).  
**Solución**: Revisar el orden de las condiciones en el `useEffect` del guardián. Asegúrate de que ninguna redirección ocurra antes de que `isReady` y `navigationState?.key` sean verdaderos.

---

### `Text strings must be rendered within a <Text> component`
**Causa**: Hay un string de texto suelto en el JSX sin estar envuelto en `<Text>`.  
**Solución**: Revisar el JSX del componente que falló y envolver cualquier texto en `<Text>`.

---

### El perfil del usuario no se actualiza en la UI después de un cambio
**Causa**: El cambio se guardó en Supabase pero no se actualizó el `authAtom`.  
**Solución**: Después de cada operación que modifique el perfil, actualiza manualmente el átomo:

```tsx
setAuth((prev) => ({
  ...prev,
  user: { ...prev.user!, campoModificado: nuevoValor }
}));
```

---

### `router.push` con rutas de grupos da error de tipos
**Causa**: TypeScript no reconoce el string de ruta como un `Href` válido.  
**Solución**: Castear el string:

```tsx
router.push('/(private)/soporte' as any);
// O importar el tipo:
router.push('/(private)/soporte' as Href);
```

---

## 14. Checklist para agregar una funcionalidad nueva

```
[ ] ¿Necesito datos nuevos? → Crear interface en src/types/
[ ] ¿Necesito tocar Supabase/SQLite? → Crear función en src/services/
[ ] ¿Es una pantalla? → Crear archivo en src/app/(grupo)/
[ ] ¿Necesito registrarla en el router? → Editar _layout.tsx del grupo
[ ] ¿Necesita datos del usuario? → Usar useAtom(authAtom)
[ ] ¿El componente muestra texto? → Asegurarme de usar <Text>
[ ] ¿El flujo es irreversible? → Usar router.replace() en vez de push()
[ ] ¿Hay operaciones async? → Envolver en try/catch
[ ] ¿Modifiqué el perfil? → Actualizar authAtom manualmente
```

---

## 15. Variables de entorno

El archivo `.env` en la raíz del proyecto contiene las credenciales de Supabase:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

> **Importante**: El prefijo `EXPO_PUBLIC_` es obligatorio para que Expo las exponga al código del cliente. Sin él, las variables son `undefined`.

---

## 16. Cómo correr el proyecto

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npx expo start

# Verificar tipos TypeScript (sin compilar)
npx tsc --noEmit
```

Usa la app **Expo Go** en tu teléfono para escanear el QR, o presiona `a` en la terminal para abrir en un emulador Android.
