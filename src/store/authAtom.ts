import { atom } from 'jotai';

/**
 * Interfaz fundamental que describe los atributos de un Usuario del ecosistema QhatuFy.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  hasCompletedProfile: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

/**
 * authAtom
 * --------
 * Átomo en formato Singleton inyectado mediante Jotai para manejar el estado
 * de la sesión actual de manera síncrona.
 */
export const authAtom = atom<AuthState>({
  user: null,
  isAuthenticated: false,
  token: null,
});
