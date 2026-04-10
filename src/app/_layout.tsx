import { Stack, useRootNavigationState, useRouter, useSegments, Href } from 'expo-router';
import { Provider, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import '../global.css';
import { authAtom } from '../store/authAtom';

/**
 * InitialLayout
 * -------------
 * Componente principal interno que funciona como Guardián de Autenticación (AuthGuard).
 * Observa el estado global (authAtom) de Jotai y maneja la redirección del enrutador
 * basándose en si el usuario tiene una sesión activa (isAuthenticated).
 */
function InitialLayout() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const authState = useAtomValue(authAtom);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    // No redirigir hasta que el estado de navegación de Expo Router esté montado y el componente listo
    if (!isReady || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isWelcome = segments[0] === 'welcome';

    if (!authState.isAuthenticated && !inAuthGroup && !isWelcome) {
      // Usar setTimeout asegura que la cola de navegación termine de transicionar antes del salto abrupto.
      setTimeout(() => {
        router.replace('/welcome' as Href);
      }, 0);
    } else if (authState.isAuthenticated && String(segments[0]) !== '(private)') {
      setTimeout(() => {
        router.replace('/(private)/dashboard' as Href);
      }, 0);
    }
  }, [authState.isAuthenticated, segments, navigationState?.key, isReady]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

/**
 * RootLayout
 * ----------
 * Layout exterior requerido por Expo Router. Envuelve la aplicación entera
 * en el Provider de Jotai para proveer visibilidad del store a todas las jerarquías.
 */
export default function RootLayout() {
  return (
    <Provider>
      <InitialLayout />
    </Provider>
  );
}
