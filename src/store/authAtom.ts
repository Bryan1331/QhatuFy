import { atom } from 'jotai';

/**
 * Representa el perfil del usuario (ya sea inquilino o administrador).
 * Se sincroniza con la base de datos (tabla 'perfiles').
 */
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

/**
 * Estado global de autenticación de la aplicación.
 */
export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Átomo global que mantiene el estado de la sesión activa y el perfil del usuario.
 */
export const authAtom = atom<AuthState>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
});