import { atom } from 'jotai';

/** Estadísticas del panel de administración. */
export interface AdminStats {
  pendingKYC: number;
  pendingPayments: number;
}

/** Átomo global de Jotai para almacenar las estadísticas del administrador. */
export const adminStatsAtom = atom<AdminStats>({
  pendingKYC: 0,
  pendingPayments: 0,
});
