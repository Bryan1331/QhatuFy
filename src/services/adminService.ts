import { UserProfile } from '../store/authAtom';
import { supabase } from './supabase';

/**
 * Obtiene todos los perfiles de usuario (inquilinos) que tienen su 
 * verificación KYC en estado "pendiente", excluyendo a los administradores.
 */
export const getPendingVerifications = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('verificacion_status', 'pendiente')
      .neq('role', 'admin'); // <-- BLINDAJE: Excluimos tu cuenta de Admin

    if (error) {
      throw new Error(error.message);
    }

    // Mapeo seguro a la interfaz UserProfile para mantener consistencia
    return (data || []).map((row) => ({
      id: row.id,
      nombre: row.nombre || 'Usuario sin nombre',
      email: row.email || '',
      role: row.role || 'user',
      verificacion_status: row.verificacion_status,
      hasCompletedProfile: row.has_completed_profile || false,
      dni: row.dni,
      direccion: row.direccion,
      celular: row.celular,
      foto_dni_url: row.foto_dni_url,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener verificaciones pendientes.');
  }
};

/**
 * Actualiza el estado de verificación de un usuario (aprobado o rechazado).
 */
export const updateVerification = async (userId: string, status: 'aprobado' | 'rechazado') => {
  try {
    console.log('Iniciando update para:', userId, 'Status:', status);

    const updatePayload = status === 'rechazado'
      ? { verificacion_status: 'rechazado', has_completed_profile: false, foto_dni_url: null }
      : { verificacion_status: 'aprobado' };

    console.log(`[AdminService] Ejecutando updateVerification para userId: ${userId} con payload:`, updatePayload);

    const { error } = await supabase
      .from('perfiles')
      .update(updatePayload as any)
      .eq('id', userId);

    if (error) {
      console.error('ERROR CRÍTICO SUPABASE:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error: any) {
    console.error('ERROR CRÍTICO SUPABASE:', error);
    throw new Error(error.message || 'Error al actualizar el estado de verificación.');
  }
};

/**
 * Obtiene las estadísticas generales del dashboard de administración.
 */
export const getDashboardStats = async () => {
  try {
    const { count, error } = await supabase
      .from('perfiles')
      .select('*', { count: 'exact', head: true })
      .eq('verificacion_status', 'pendiente')
      .neq('role', 'admin');

    if (error) throw new Error(error.message);

    return {
      pendingKYC: count || 0,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener las estadísticas del dashboard.');
  }
};