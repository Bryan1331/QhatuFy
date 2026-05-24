# Guía Técnica de QhatuFy 📘

Bienvenido(a). Esta guía explica **todo lo que necesitas saber** para entender, navegar y trabajar en el proyecto QhatuFy. Está escrita en un lenguaje sencillo, estructurado paso a paso, ideal tanto para desarrolladores principiantes como avanzados.

---

## 📖 Parte 1: Glosario (Conceptos Fundamentales)

Antes de tocar el código, necesitas familiarizarte con las tecnologías y términos clave de esta aplicación:

| Término | ¿Qué es? |
|---|---|
| **React Native** | El framework con el que está construida la app. Permite escribir código en JavaScript/TypeScript que compila nativamente para Android y iOS. |
| **Expo** | Un conjunto de herramientas y servicios alrededor de React Native que simplifica enormemente el desarrollo, el acceso a APIs nativas (cámara, archivos) y las pruebas rápidas en dispositivos. |
| **TypeScript (.tsx)** | Superconjunto de JavaScript que añade tipado estricto. Te ayuda a detectar errores en tiempo de compilación. En la app, las pantallas y componentes llevan extensión `.tsx`. |
| **Componente** | Bloques de construcción reutilizables de la interfaz de usuario (ej. un botón, una tarjeta o un input). Se declaran una vez y se instancian en múltiples pantallas. |
| **Expo Router** | El enrutador basado en archivos del proyecto. La jerarquía de archivos en la carpeta `src/app/` define automáticamente las rutas navegables del sistema. |
| **Jotai (Estado Global)** | Librería de gestión de estado ligero y reactivo basado en "átomos". Permite que datos compartidos (como la sesión del usuario o los roles) estén accesibles en cualquier componente de la app. |
| **Supabase** | Backend-as-a-Service (BaaS) en la nube. Ofrece la base de datos PostgreSQL principal, autenticación integrada de usuarios y almacenamiento de archivos (buckets de imágenes/PDFs). |
| **SQLite (Offline-First)** | Base de datos local empotrada. Permite almacenar contratos, locales, citas y pagos directamente en el dispositivo móvil para que la app funcione sin conexión a internet. |
| **NativeWind (Tailwind CSS)** | Sistema de diseño de estilos mediante clases utilitarias integradas en el código (ej. `bg-black`, `text-white`, `rounded-2xl`). Facilita la creación de interfaces responsivas y consistentes. |
| **KYC (Know Your Customer)** | "Conoce a tu Cliente". Proceso de registro legal y seguro donde el inquilino envía su DNI, dirección física y celular para que el administrador verifique su identidad antes de permitirle agendar visitas o alquilar. |
| **`View`** | Contenedor básico de interfaz de usuario de React Native (equivalente a un `<div>` en web). Agrupa y estructura elementos. |
| **`Text`** | Componente exclusivo para mostrar cadenas de texto. **Regla de oro: todo texto plano debe estar envuelto en `<Text>`**, de lo contrario la aplicación fallará. |
| **`TouchableOpacity`** | Botón interactivo que responde de forma visual reduciendo su opacidad al ser presionado. Ejecuta funciones a través de su propiedad `onPress`. |
| **`useRouter()`** | Gancho (hook) de Expo Router que sirve como control remoto de navegación en la app (ej. `router.push` o `router.replace`). |
| **`useAtom()`** | Gancho de Jotai utilizado para enlazar una pantalla o componente a un átomo de estado global para leer y modificar su información. |
| **`async / await`** | Palabras clave para el manejo de operaciones asíncronas (como peticiones a Supabase o consultas SQLite). Le indica a la app que debe esperar la respuesta del servicio antes de ejecutar la siguiente línea. |
| **`try / catch`** | Bloque de control de flujo utilizado para capturar y manejar posibles excepciones o errores sin provocar que la aplicación se detenga o se rompa. |

---

## 📂 Parte 2: Estructura del Proyecto (Estructura de Directorios)

Todo el código fuente vive dentro del directorio `src/`. Aquí tienes el mapa actual e interactivo:

```
src/
├── app/                    👈 LAS PANTALLAS (Expo Router)
│   ├── _layout.tsx         👈 EL GUARDIÁN PRINCIPAL (Autenticación y rutas protegidas)
│   ├── index.tsx           👈 Pantalla inicial (pantalla de carga de sesión)
│   ├── welcome.tsx         👈 Pantalla de bienvenida pública
│   ├── (auth)/             👈 PANTALLAS DE AUTENTICACIÓN (Públicas)
│   │   ├── login.tsx             (Inicio de sesión)
│   │   ├── register.tsx          (Formulario de registro)
│   │   ├── complete-profile.tsx  (Formulario KYC - Verificación de identidad)
│   │   └── terms.tsx             (Términos y condiciones legales)
│   ├── (private)/          👈 PANTALLAS DEL INQUILINO (Privadas/Protegidas)
│   │   ├── _layout.tsx           (Esconde pestañas secundarias del menú inferior)
│   │   ├── index.tsx             (Dashboard con Contratos Activos y Próximos Pagos)
│   │   ├── catalog.tsx           (Catálogo de locales comerciales disponibles)
│   │   ├── store-detail.tsx      (Detalles del local y solicitud de visitas)
│   │   ├── appointments.tsx      (Pipeline visual de mis visitas programadas)
│   │   ├── my-contracts.tsx      (Lista de mis contratos vigentes y descarga de PDFs)
│   │   ├── rules.tsx             (Reglamento y normas de convivencia de la galería)
│   │   └── profile.tsx           (Perfil del inquilino y visualización de DNI)
│   └── (admin)/            👈 PANTALLAS DEL ADMINISTRADOR (Privadas/Protegidas)
│       ├── index.tsx             (Dashboard del Admin y accesos directos)
│       ├── verify-documents.tsx  (Revisión y Aprobación/Rechazo de solicitudes KYC)
│       ├── manage-contracts.tsx  (Creación de contratos y carga directa de PDFs)
│       ├── manage-stores.tsx     (Gestión de locales: editar, eliminar, registrar)
│       ├── manage-appointments.tsx (Aprobación/Rechazo y control de visitas)
│       └── create-store.tsx      (Formulario de creación y edición de locales comerciales)
│
├── components/             👈 PIEZAS REUTILIZABLES (Componentes modulares)
│   ├── admin/
│   │   └── SolicitudCard.tsx     (Tarjeta visual para la revisión de expedientes KYC)
│   ├── catalog/
│   │   └── LocalCard.tsx         (Tarjeta de local en el catálogo con imagen de fondo)
│   └── dashboard/
│       └── PaymentCard.tsx       (Tarjeta de pagos con desglose de monto y fecha de vencimiento)
│
├── services/               👈 CAPA DE COMUNICACIÓN (Servicios y lógica externa)
│   ├── supabase.ts             (Instancia e inicialización del cliente de Supabase)
│   ├── authService.ts          (Registro, inicio de sesión y guardado KYC consolidado)
│   ├── catalogService.ts       (Obtención de locales para el catálogo de clientes)
│   ├── storageService.ts       (Subida segura de imágenes a Supabase Storage usando Base64)
│   ├── adminService.ts         (Estadísticas, gestión de locales, visitas y KYC del admin)
│   ├── syncService.ts          (Sincronización Offline-First entre SQLite local y Supabase en la nube)
│   └── localDb.ts              (Esquema e inicialización de la base de datos local SQLite)
│
├── store/                  👈 MEMORIA GLOBAL (Estados compartidos con Jotai)
│   ├── authAtom.ts             (Mantiene la sesión de Supabase y datos del perfil del usuario)
│   └── adminAtom.ts            (Almacena estadísticas de administración activa)
│
└── types/                  👈 TIPADO DE DATOS (TypeScript interfaces)
    └── payment.ts              (Define las interfaces de Pagos y Requerimientos)
```

### 💡 ¿Por qué los directorios llevan paréntesis `(auth)`, `(private)`, `(admin)`?
En Expo Router, los directorios entre paréntesis se conocen como **"Grupos de Rutas"**. Sirven para organizar pantallas en subconjuntos lógicos y aplicar layouts específicos **sin alterar la estructura del URL**. 
- `src/app/(auth)/login.tsx` se navega como `/login`
- `src/app/(private)/index.tsx` se navega como `/` (Dashboard del inquilino)
- `src/app/(admin)/index.tsx` se navega como `/(admin)` (Dashboard del administrador)

---

## 🧩 Parte 3: Ejemplos Prácticos de Programación

### ✅ Ejemplo 1: Crear una Pantalla Nueva Protegida
Para añadir una pantalla dentro del espacio protegido del inquilino, crea un archivo en `src/app/(private)/soporte.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SoporteScreen() {
  return (
    <View style={styles.container}>
      <Text className="text-white text-2xl font-bold">Mesa de Soporte</Text>
      <Text className="text-gray-400 text-sm mt-2">¿Tienes dudas con tu local comercial? Contáctanos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
```

*Nota:* Asegúrate de exportar por defecto (`export default`) la función principal de tu pantalla para que Expo Router pueda mapearla automáticamente.

---

### ✅ Ejemplo 2: Implementar un Botón Interactivo con NativeWind
Para construir un botón interactivo y premium, utiliza `TouchableOpacity` junto con clases utilitarias de Tailwind:

```tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function BotonPremium() {
  const handlePress = () => {
    console.log('Botón presionado de forma segura.');
  };

  return (
    <View className="p-4 items-center">
      <TouchableOpacity 
        onPress={handlePress}
        className="bg-blue-600 active:bg-blue-700 px-6 py-4 rounded-full shadow-lg items-center justify-center flex-row"
      >
        <Text className="text-white font-bold text-base">Confirmar Alquiler</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### ✅ Ejemplo 3: Transición de Pantallas (Navegación)
Utiliza el gancho `useRouter` para transiciones dinámicas de forma limpia y tipada:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NavegacionDemo() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {/* push: agrega la pantalla al historial permitiendo volver atrás */}
      <TouchableOpacity 
        onPress={() => router.push('/catalog' as any)}
        className="bg-white/5 py-4 px-6 rounded-2xl border border-white/10 mb-4"
      >
        <Text className="text-white font-semibold">Ir al Catálogo</Text>
      </TouchableOpacity>

      {/* replace: reemplaza la pantalla actual (sin historial para regresar) */}
      <TouchableOpacity 
        onPress={() => router.replace('/welcome' as any)}
        className="bg-red-500/10 py-4 px-6 rounded-2xl border border-red-500/20"
      >
        <Text className="text-red-500 font-semibold">Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### ✅ Ejemplo 4: Leer Información del Estado Global (Jotai)
Para acceder a la información de la sesión activa del usuario y mostrarla de forma reactiva:

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useAtom } from 'jotai';
import { authAtom } from '../../store/authAtom';

export default function TarjetaPerfil() {
  const [auth] = useAtom(authAtom);

  return (
    <View className="bg-[#1C1C1E] p-6 rounded-3xl border border-white/5">
      <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Inquilino</Text>
      <Text className="text-white text-xl font-bold">{auth.user?.nombre || 'Cargando usuario...'}</Text>
      <Text className="text-blue-400 text-xs mt-1">{auth.user?.email}</Text>
    </View>
  );
}
```

---

### ✅ Ejemplo 5: Consultar la Base de Datos Local (Offline-First)
En QhatuFy, los datos sensibles del inquilino (contratos, citas, pagos) se almacenan localmente. Aquí tienes cómo realizar consultas SQL a la base de datos SQLite interna:

```tsx
import { getLocalDb } from './localDb';

/**
 * Consulta y retorna todas las citas almacenadas en el almacenamiento del dispositivo.
 */
export const getLocalAppointments = async (): Promise<any[]> => {
  const db = await getLocalDb();
  
  // getAllAsync retorna todas las filas que cumplan con la consulta SQL
  const rows = await db.getAllAsync(`
    SELECT c.*, l.nombre as local_nombre, l.imagen_url as local_imagen
    FROM citas c
    LEFT JOIN locales l ON c.local_id = l.id
    ORDER BY c.fecha_hora ASC;
  `);
  
  return rows;
};
```

---

## 🛡️ Parte 4: Flujo de Seguridad y Protección de Rutas (`_layout.tsx`)

La seguridad de rutas se gestiona de forma centralizada en el archivo raíz **`src/app/_layout.tsx`**. Funciona como un guardián automático (AuthGuard) que intercepta cualquier transición de pantalla y toma decisiones reactivas:

```mermaid
graph TD
    A[Usuario abre la App] --> B{¿Está cargando el estado?}
    B -- Sí -- > C[Mostrar Indicador de Carga]
    B -- No --> D{¿Hay sesión activa?}
    D -- No --> E[Redirigir a /welcome]
    D -- Sí --> F{¿Completó KYC?}
    F -- No --> G[Permitir /complete-profile]
    F -- Sí --> H{¿Qué rol tiene?}
    H -- admin --> I[Redirigir a /admin]
    H -- user --> J[Redirigir a /private]
```

Este diseño te deslinda de proteger manualmente cada pantalla. Simplemente aloja tus archivos en la carpeta de grupo correspondiente (`(admin)` o `(private)`) y el guardián asegurará que solo las identidades permitidas tengan acceso.

---

## 🔄 Parte 5: Sincronización y Ciclo KYC de Identidad

El proceso KYC (Verificación de Identidad) es fundamental para mantener la integridad en los alquileres de la galería. Su ciclo de vida es el siguiente:

1. **Registro**: El usuario se registra en `(auth)/register.tsx`. Su perfil se inicializa en Supabase con `hasCompletedProfile: false` y `verificacion_status: 'pendiente'`.
2. **Carga de Documentos**: El sistema lo bloquea y lo redirige automáticamente a `complete-profile.tsx`. Aquí rellena su **DNI**, **Celular**, **Dirección** y sube una fotografía legible de su documento de identidad.
3. **Conversión y Almacenamiento**:
   - `storageService.ts` lee la imagen local del dispositivo en formato Base64.
   - Decodifica la cadena a un `ArrayBuffer` seguro y la sube al bucket `documentos` de Supabase Storage para evitar problemas de carga o timeouts de red.
   - Retorna la URL pública de la imagen.
4. **Registro KYC**: Se invoca a `updateKYCProfile` (dentro de `authService.ts`) que actualiza las columnas de verificación y establece `has_completed_profile: true` en la tabla `perfiles`.
5. **Revisión del Administrador**: El administrador visualiza las solicitudes en su panel (`verify-documents.tsx`).
   - Si **Aprueba**: El estado cambia a `aprobado` y el inquilino puede navegar al catálogo y agendar visitas.
   - Si **Rechaza**: El estado vuelve a `rechazado`, `has_completed_profile: false` y borra la URL del documento para obligar al usuario a enviar una nueva captura legible.

---

## 🎨 Parte 6: Guía de Estilos y Clases Clave (NativeWind)

En este proyecto se utiliza una estética minimalista, elegante y con toques de Glassmorphism en modo oscuro (`dark mode` nativo). A continuación se listan las clases de diseño más recurrentes:

- **Fondos de pantalla**: `bg-[#0A0A0A]` (Negro profundo), `bg-[#151517]` (Gris de tarjeta), `bg-[#1C1C1E]` (Gris claro).
- **Textos**: `text-white` (Blanco primario), `text-gray-400` (Secundario), `text-blue-400` (Destacados/Precios).
- **Espaciados y Bordes**: `rounded-3xl` (Bordes premium redondeados de 24px), `p-5` (Padding general), `mb-4` (Margen inferior).
- **Flexbox y Layouts**: 
  - Fila horizontal centrada: `flex-row items-center justify-between`
  - Centrar contenido absoluto: `items-center justify-center`
  - Caja flexible: `flex-1`

---

## 📋 Parte 7: Reglas de Oro para Desarrolladores

Para preservar la calidad y el perfecto funcionamiento del software QhatuFy, sigue rigurosamente estas pautas:

1. **Protección de Textos**: Todo texto plano debe estar dentro de un componente `<Text>`. Las cadenas sin contenedor provocan excepciones fatales en la aplicación.
2. **Navegaciones Limpias**: Siempre utiliza `router.replace()` para transiciones de flujos irreversibles (ej. tras iniciar sesión, registrarse o cerrar sesión) de modo que el botón nativo del teléfono no regrese al usuario a pantallas de autenticación obsoletas.
3. **Manejo de Errores Robustos**: Envuelve todas las transacciones asíncronas de base de datos (Supabase y SQLite) en bloques `try/catch`. Registra los fallos con `console.error` para que puedan depurarse a través de Metro Bundler.
4. **Arquitectura Limpia**:
   - Lógica de backend en `src/services/`.
   - Vistas y navegación en `src/app/`.
   - Piezas modulares reutilizables en `src/components/`.
   - Tipos de TypeScript estrictos en `src/types/`.
5. **No alteres el Guardián**: No modifiques la lógica central de `src/app/_layout.tsx` sin haber planificado previamente el comportamiento de los estados de sesión. Es el pilar de seguridad y estabilidad del enrutamiento del sistema.
