import * as Notifications from 'expo-notifications';
import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { Provider, useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PanResponder, View } from 'react-native';
import '../global.css';
import { getExtendedProfile } from '../services/authService';
import { supabase } from '../services/supabase';
import { authAtom } from '../store/authAtom';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Inicializador del Layout de la app que gestiona la autenticación y redirecciones automáticas.
 */
function InitialLayout() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [authState, setAuthState] = useAtom(authAtom);
  const [isReady, setIsReady] = useState(false);

  // --- MOTOR DE INACTIVIDAD (10 MINUTOS) ---
  const timerRef = useRef<any>(null);
  const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutos en milisegundos

  const resetInactivityTimeout = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Solo iniciamos el temporizador si el usuario está autenticado
    if (authState.isAuthenticated) {
      timerRef.current = setTimeout(async () => {
        Alert.alert(
          '⏳ Sesión Expirada',
          'Por tu seguridad, hemos cerrado la sesión por inactividad.',
          [{ text: 'Entendido' }]
        );
        await supabase.auth.signOut();
      }, INACTIVITY_TIME);
    }
  }, [authState.isAuthenticated]);

  const panResponder = useRef(
    PanResponder.create({
      // Captura cualquier toque o gesto en la pantalla antes de que llegue a los botones
      onStartShouldSetPanResponderCapture: () => {
        resetInactivityTimeout();
        return false; // Permite que el toque siga su curso hacia los botones reales
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetInactivityTimeout();
        return false;
      },
    })
  ).current;

  useEffect(() => {
    resetInactivityTimeout();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetInactivityTimeout]);
  // ----------------------------------------

  useEffect(() => {
    setIsReady(true);

    // Solicitar permisos de notificación nativa
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permisos de notificación denegados por el usuario.');
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    // Escucha cambios de sesión y obtiene el perfil extendido del usuario
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await getExtendedProfile(session.user.id, session.user.email || '');
          if (!profile) throw new Error("Perfil no encontrado");

          setAuthState({
            user: profile as any,
            session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Fallo al hidratar el perfil extendido:", error);
          await supabase.auth.signOut();
          setAuthState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
          router.replace('/welcome' as Href);
        }
      } else {
        setAuthState({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuthState, router]);

  useEffect(() => {
    // Guardián de rutas y redirecciones automáticas
    if (!isReady || !navigationState?.key || authState.isLoading) return;

    if (authState.session && !authState.user) return;

    const rootSegment = String(segments[0]);
    const inAuthGroup = rootSegment === '(auth)';
    const isWelcome = rootSegment === 'welcome';

    if (!authState.isAuthenticated) {
      if (!inAuthGroup && !isWelcome) {
        setTimeout(() => {
          router.replace('/welcome' as Href);
        }, 0);
      }
      return;
    }

    const isCompleteProfile = rootSegment === '(auth)' && String(segments[1]) === 'complete-profile';
    const hasCompletedProfile = authState.user?.hasCompletedProfile;
    const role = authState.user?.role;

    if (isCompleteProfile && !hasCompletedProfile) {
      return;
    }

    if (role === 'admin') {
      if (rootSegment !== '(admin)') {
        setTimeout(() => {
          router.replace('/(admin)' as Href);
        }, 0);
      }
    } else {
      if (rootSegment !== '(private)') {
        setTimeout(() => {
          router.replace('/(private)' as Href);
        }, 0);
      }
    }
  }, [authState.isAuthenticated, authState.user, authState.session, authState.isLoading, segments, navigationState?.key, isReady]);

  // Envolvemos toda la app con el PanResponder para detectar cualquier toque
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} {...panResponder.panHandlers}>
      {authState.isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5C8FFB" />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </View>
  );
}

/**
 * Componente raíz de la aplicación que envuelve InitialLayout en el proveedor de Jotai.
 */
export default function RootLayout() {
  return (
    <Provider>
      <InitialLayout />
    </Provider>
  );
}
