import { atom } from 'jotai';

/** Perfil de usuario sincronizado con la base de datos. */
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
  foto_dni_url?: string;
}

/** Estado de autenticación global de la aplicación. */
export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/** Átomo global de Jotai para gestionar la sesión y el perfil del usuario. */
export const authAtom = atom<AuthState>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
});