# 🏢 QhatuFy

> Aplicación móvil para la gestión de alquileres comerciales.

QhatuFy es una app que permite a los inquilinos gestionar sus contratos, pagos y documentos de identidad (KYC), y a los administradores verificar y aprobar solicitudes desde un panel dedicado.

---

## 📋 ¿Qué puede hacer la app?

### Para el Inquilino (usuario normal):
- Registrarse e iniciar sesión.
- Completar su perfil subiendo DNI, dirección y celular (proceso KYC).
- Ver su dashboard con contratos, pagos pendientes y accesos rápidos.
- Cerrar sesión de forma segura.

### Para el Administrador:
- Ver cuántas solicitudes de verificación hay pendientes.
- Revisar los documentos de cada usuario (foto del DNI).
- Aprobar o rechazar solicitudes.
- Cerrar sesión.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | ¿Para qué se usa? |
|---|---|
| [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/) | Construir la app para Android e iOS con un solo código. |
| [TypeScript](https://www.typescriptlang.org/) | Escribir código con menos errores gracias al tipado. |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Navegación entre pantallas basada en carpetas. |
| [Jotai](https://jotai.org/) | Estado global (memoria compartida entre pantallas). |
| [Supabase](https://supabase.com/) | Base de datos, autenticación y almacenamiento de archivos en la nube. |
| [NativeWind v4](https://www.nativewind.dev/) | Estilos con clases de Tailwind CSS en React Native. |

---

## 📂 Estructura del Proyecto

```
src/
├── app/                        ← Pantallas de la aplicación
│   ├── _layout.tsx             ← Guardián de rutas (AuthGuard)
│   ├── index.tsx               ← Pantalla de carga inicial
│   ├── welcome.tsx             ← Pantalla de bienvenida
│   ├── (auth)/                 ← Pantallas públicas
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── complete-profile.tsx
│   ├── (private)/              ← Pantallas del inquilino
│   │   └── dashboard.tsx
│   └── (admin)/                ← Pantallas del administrador
│       ├── index.tsx
│       └── verify-documents.tsx
│
├── components/                 ← Componentes reutilizables
│   ├── admin/
│   │   └── SolicitudCard.tsx
│   └── dashboard/
│       └── PaymentCard.tsx
│
├── services/                   ← Comunicación con Supabase
│   ├── supabase.ts
│   ├── authService.ts
│   ├── profileService.ts
│   ├── storageService.ts
│   └── adminService.ts
│
├── store/                      ← Estado global (Jotai)
│   ├── authAtom.ts
│   └── adminAtom.ts
│
└── types/                      ← Definiciones de tipos
    └── payment.ts
```

---

## 🚀 ¿Cómo levantar el proyecto?

### Requisitos previos:
- Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
- Tener la app **Expo Go** en tu celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)).

### Paso 1: Instalar dependencias
```bash
npm install
```

### Paso 2: Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:
```
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Paso 3: Iniciar la app
```bash
npx expo start
```

### Paso 4: Abrir en tu dispositivo
Una vez que aparezca el código QR en la terminal:
- **Android:** Abre Expo Go y escanea el QR.
- **iPhone:** Escanea el QR con la cámara del celular.
- **Emulador:** Presiona `a` (Android) o `i` (iOS) en la terminal.

---

## 🔄 Flujo de la Aplicación

```
Usuario abre la app
      │
      ▼
  ¿Tiene sesión?
      │
  NO ─┤
      ▼
  /welcome → /login o /register
      │
      ▼
  Inicia sesión
      │
  SÍ ─┤
      ▼
  ¿Qué rol tiene?
      │
  usuario ──→ /(private)/dashboard
  admin   ──→ /(admin)
```

---

## 📖 Documentación Adicional

Para entender el código a profundidad, consulta la **[Guía Técnica](./GUIA_TECNICA.md)**, donde encontrarás:
- Glosario de todos los términos técnicos.
- Ejemplos de cómo crear pantallas, botones y navegación.
- Explicación detallada de cada carpeta y archivo.
- Reglas importantes del proyecto.

---

## 👥 Equipo

Desarrollado por el equipo de QhatuFy.

**© 2026 QhatuFy**
