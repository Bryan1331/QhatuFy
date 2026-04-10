# 🏢 QhatuFy

> **Una app premium de gestión de alquileres comerciales potenciada por Inteligencia Artificial.**

QhatuFy es una plataforma vanguardista desarrollada para priorizar una experiencia de usuario de élite fusionada con herramientas automatizadas para la administración y gestión operativa del patrimonio en arrendamientos comerciales.

---

## 📈 Estado del Proyecto

Actualmente, el proyecto se encuentra en fases intensas de desarrollo. Hoy tenemos consolidada con éxito la primera capa estructural de la aplicación:

- ✅ **Arquitectura Base**: Arquitectura reactiva encapsulada y optimizada para producción móvil.
- ✅ **Sistema Autónomo de Autenticación**: El flujo completo de *Welcome*, *Login* y *Register* está operativo.
- ✅ **AuthGuard Riguroso**: Enrutador guardián (en `_layout.tsx`) diseñado inteligentemente que aísla de inmediato las áreas públicas de las zonas de gestión operativas (`Dashboard`), evitando parpadeos de transiciones (Double-routing Jump).

---

## 💻 Tech Stack

- **App Framework**: [Expo](https://expo.dev/) y [React Native](https://reactnative.dev/).
- **Lenguaje Transversal**: [TypeScript](https://www.typescriptlang.org/) (Tipado estricto para escalar seguro).
- **Estilos Dinámicos**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS empaquetado para render nativo).
- **Control de Estado Atómico**: [Jotai](https://jotai.org/) (Gestor de sesiones primitivo sumamente performante).
- **Módulos IA**: Arquitectura pre-construida para la próxima integración cerebral empleando **Google Gemini API**.

---

## 📂 Estructura del Código (\`src/\`)

Todo nuestro código vivo habita seguro dentro de `src/`, manteniendo organizada la escalabilidad del patrón jerárquico:

```text
QhatuFy/
└── src/
    ├── app/          # (Routing) Enrutamiento dinámico tipo Expo Router. Alberga los Layouts y pantallas protegidas vs. públicas.
    ├── components/   # (UI Shell) Componentes visuales agnósticos como botones estilizados, inputs o widgets abstractos.
    └── store/        # (Global State) Átomos de Jotai (ej. `authAtom.ts`) de control central síncrono.
```

---

## 🛠️ Paso a Paso (Guía Rápida)

Levantar a producción inicial el entorno es cuestión de instantes:

1. **Instalación de paquetes de nodo:**
   ```bash
   npm install
   ```

2. **Correr e Iniciar a empaquetar Metros:**
   ```bash
   npx expo start
   ```

*(Teclas útiles durante el servidor activo)*
- Preciona `a` para abrir simulador de Android.
- Presiona `i` para abrir simulador de iOS.
- Presiona `w` para abrir simulador en Web.
---

**© 2026 QhatuFy Enterprise.**
