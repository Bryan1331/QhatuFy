import { Stack, useRootNavigationState, useRouter, useSegments, Href } from 'expo-router';
import { Provider, useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import '../global.css';
import { authAtom } from '../store/authAtom';
import { supabase } from '../services/supabase';
import { getExtendedProfile } from '../services/authService';

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
  const [authState, setAuthState] = useAtom(authAtom);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    /**
     * Escucha los cambios de estado de autenticación directamente desde Supabase.
     * Si hay sesión, obtiene el perfil completo del usuario (KYC) y actualiza el estado global.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          // Llama a authService.getExtendedProfile
          const profile = await getExtendedProfile(session.user.id, session.user.email || '');
          if (!profile) throw new Error("Perfil no encontrado");

          setAuthState({
            user: profile as any,
            session,
            isAuthenticated: true,
            isLoading: false, // Crítico: poner en false solo después de cargar
          });
        } catch (error) {
          // Blindaje: si falla, forzar signOut y redirigir a welcome
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
    /**
     * Lógica principal de enrutamiento protegido (Auth Guard).
     * Decide a qué pantalla enviar al usuario basándose en su estado de autenticación, rol y perfil.
     */
     
    // 1. Evitar redirección si la app o el estado aún está cargando
    if (!isReady || !navigationState?.key || authState.isLoading) return;
    
    // 2. Si hay sesión de Supabase pero el perfil de BD aún no llega, esperar.
    if (authState.session && !authState.user) return;

    console.log('Navegación detectada - Rol:', authState.user?.role, 'Segmentos:', segments);

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
    
    // --- LÓGICA DE USUARIO AUTENTICADO ---
    const isCompleteProfile = rootSegment === '(auth)' && String(segments[1]) === 'complete-profile';
    const hasCompletedProfile = authState.user?.hasCompletedProfile;
    const role = authState.user?.role;

    if (isCompleteProfile && !hasCompletedProfile) {
      return; // Permitimos que se quede en la pantalla de completar perfil
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
          router.replace('/(private)/dashboard' as Href);
        }, 0);
      }
    }
  }, [authState.isAuthenticated, authState.user, authState.session, authState.isLoading, segments, navigationState?.key, isReady]);

  if (authState.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5C8FFB" />
      </View>
    );
  }

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
