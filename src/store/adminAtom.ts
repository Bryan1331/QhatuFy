import { atom } from 'jotai';

/**
 * Interfaz que define las estadísticas del panel de administración.
 */
export interface AdminStats {
  pendingKYC: number;
}

/**
 * Átomo global para almacenar las estadísticas del administrador.
 */
export const adminStatsAtom = atom<AdminStats>({
  pendingKYC: 0,
});
