# 🏢 QhatuFy

> Aplicación móvil nativa para la gestión inteligente de alquileres y locales comerciales.

**QhatuFy** es una plataforma móvil premium diseñada de forma modular para agilizar la gestión de complejos comerciales y galerías. Permite a los inquilinos buscar locales, coordinar visitas virtuales o físicas, firmar contratos digitales y gestionar sus pagos offline de forma segura. Paralelamente, brinda a los administradores un completo centro de control administrativo para supervisar el proceso legal y logístico de la galería.

---

## 📋 Funcionalidades Principales

### 👤 Para el Inquilino (Espacio Privado)
- **Autenticación e Identidad**: Registro seguro integrado con Supabase Auth.
- **Proceso KYC (Verificación de Identidad)**: Formulario robusto para enviar DNI, Teléfono Celular, Dirección Física y fotografía digital legible del documento para la aprobación administrativa.
- **Dashboard Premium**: Interfaz en modo oscuro con visualización reactiva de locales alquilados vigentes, calendario de pagos estructurado y métricas clave.
- **Catálogo de Locales**: Filtro de locales comerciales disponibles con información detallada de inversión mensual, dimensiones y descripciones del stand.
- **Agendamiento de Visitas**: Solicitud de citas presenciales integradas con control automático para evitar registros duplicados.
- **Pipeline de Citas**: Visualización del estado en tiempo real (Pendiente / Aprobada) de las citas programadas.
- **Mis Contratos**: Acceso y visualización a los contratos PDF oficiales cargados por la administración en cualquier momento.
- **Reglamento**: Consulta interactiva de las Normas de Convivencia y penalidades de la galería comercial.
- **Almacenamiento Offline-First**: Acceso instantáneo a contratos, visitas y pagos locales sin consumo de datos gracias al soporte integrado de base de datos local (SQLite).

### 👮 Para el Administrador (Espacio de Control)
- **Centro de Control**: Dashboard interactivo que muestra alertas críticas como solicitudes KYC pendientes de revisión.
- **Verificación KYC**: Panel visual de aprobación o rechazo de expedientes KYC, con liberación inmediata del perfil o borrado selectivo de fotos erróneas.
- **Gestión de Citas comerciales**: Visualización de citas de inquilinos para aprobarlas, rechazarlas o concluirlas marcándolas como "Atendidas".
- **Gestión de Locales Comerciales**: CRUD completo de locales (crear stands nuevos, subir imágenes del local, editar dimensiones, ajustar precios y eliminar stands).
- **Gestión de Contratos y PDFs**: Creación de la vinculación legal de locales activos con inquilinos mediante la carga directa de contratos PDFs y la generación automatizada del cronograma del primer pago mensual.

---

## 🛠️ Stack Tecnológico de Vanguardia

| Tecnología | Rol en la Aplicación |
|---|---|
| **[React Native](https://reactnative.dev/)** | Framework base para el compilado nativo en Android y iOS. |
| **[Expo](https://expo.dev/)** | Ecosistema y SDK para acceso rápido a componentes de hardware nativos (Cámara, Image Picker, FileSystem). |
| **[TypeScript](https://www.typescriptlang.org/)** | Tipado estricto para asegurar la escalabilidad del codebase. |
| **[Expo Router](https://docs.expo.dev/router/introduction/)** | Enrutador dinámico basado en archivos y subgrupos lógicos de pantallas. |
| **[Jotai](https://jotai.org/)** | Gestor de estado global súper ligero basado en átomos de memoria compartida. |
| **[Supabase](https://supabase.com/)** | Infraestructura de Base de Datos PostgreSQL, Autenticación de usuarios y Almacenamiento seguro en la nube. |
| **[SQLite (expo-sqlite)](https://docs.expo.dev/versions/latest/sdk/sqlite/)** | Base de datos interna en el teléfono para persistencia de datos local (Offline-First). |
| **[NativeWind v4](https://www.nativewind.dev/)** | Motor de estilos de Tailwind CSS en React Native para interfaces minimalistas y elegantes. |

---

## 📂 Estructura del Proyecto

El código está estructurado con una arquitectura limpia de capas lógicas:

```
src/
├── app/                        ← Pantallas organizadas por grupos de navegación
│   ├── _layout.tsx             ← Inicializador central y AuthGuard principal
│   ├── index.tsx               ← Pantalla de carga y validación de tokens
│   ├── welcome.tsx             ← Bienvenida y onboarding
│   ├── (auth)/                 ← Pantallas públicas (Login, Register, KYC, Términos)
│   ├── (private)/              ← Pantallas del inquilino (Dashboard, Catálogo, Citas, Reglamento)
│   └── (admin)/                ← Pantallas del administrador (Gestión de stands, Citas, KYC, Contratos)
│
├── components/                 ← Piezas modulares reutilizables de UI
│   ├── admin/                  (Componentes para administración)
│   ├── catalog/                (Componentes de catálogo comercial)
│   └── dashboard/              (Componentes de dashboard del inquilino)
│
├── services/                   ← Capa lógica y comunicación de datos
│   ├── supabase.ts             (Cliente inicializador)
│   ├── authService.ts          (Registro, Login y KYC consolidado)
│   ├── catalogService.ts       (Peticiones del catálogo)
│   ├── storageService.ts       (Gestión de almacenamiento base64)
│   ├── adminService.ts         (Lógica operativa de administración)
│   ├── syncService.ts          (Servicio de sincronización Offline-First)
│   └── localDb.ts              (Controlador de SQLite local)
│
├── store/                      ← Estados de memoria reactivos compartidos (Jotai Atoms)
└── types/                      ← Definiciones estrictas de TypeScript
```

---

## 🚀 Instalación y Despliegue Local

### Requisitos previos:
- Tener instalado **[Node.js](https://nodejs.org/)** (versión 18 o superior recomendada).
- Tener instalada la aplicación móvil de pruebas **Expo Go** en tu dispositivo móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) o [iOS](https://apps.apple.com/app/expo-go/id982107779)) o un emulador previamente configurado.

### Paso 1: Instalar dependencias del proyecto
Abre la terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### Paso 2: Configurar las variables de entorno
Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales seguras de Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_anon_aqui
```

### Paso 3: Iniciar Metro Bundler
Inicia el servidor de empaquetado de Expo:
```bash
npx expo start
```
*Tip:* Utiliza la bandera `-c` para limpiar el caché de compilación en caso de que sea necesario: `npx expo start -c`.

### Paso 4: Cargar la App
Escanea el código QR que se muestra en tu terminal:
- **Android:** Escanéalo directamente desde la aplicación de Expo Go.
- **iOS:** Escanéalo utilizando la aplicación de la Cámara del iPhone.
- **Emuladores:** Presiona `a` en la terminal para emulador Android, o `i` para el simulador de iOS.

---

## 🔄 Flujo de Rutas y Redirecciones

QhatuFy integra un guardián de rutas automático y robusto dentro del enrutador. La redirección de navegación del usuario final se realiza reactivamente siguiendo este flujo lógico:

```
                  Usuario abre la Aplicación
                              │
                              ▼
                ¿Tiene una sesión activa?
                 ├── NO ──> /welcome (Público) ──> /login o /register
                 │
                 └── SÍ ──> ¿Completó su expediente KYC?
                              ├── NO ──> /complete-profile (Formulario de identidad)
                              │
                              └── SÍ ──> ¿Qué rol tiene asignado?
                                           ├── admin ──> /(admin) (Dashboard Admin)
                                           └── user  ──> /(private) (Dashboard Inquilino)
```



## 👥 Equipo y Soporte

Desarrollado con altos estándares de calidad por el equipo técnico de QhatuFy.

**© 2026 QhatuFy. Todos los derechos reservados.**
