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
      .neq('role', 'admin'); // Excluir cuenta de Administrador

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
    const updatePayload = status === 'rechazado'
      ? { verificacion_status: 'rechazado', has_completed_profile: false, foto_dni_url: null }
      : { verificacion_status: 'aprobado' };

    const { error } = await supabase
      .from('perfiles')
      .update(updatePayload as any)
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error: any) {
    console.error('Error al actualizar verificación:', error);
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

export interface NewStoreData {
  nombre: string;
  ubicacion: string;
  precio: number;
  dimensiones: string;
  imagen_url: string;
  descripcion?: string; // Opcional
}

export const createNewStore = async (storeData: NewStoreData): Promise<boolean> => {
  try {
    const { error } = await supabase.from('locales').insert([{ ...storeData, disponible: true }]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creando tienda:', error);
    return false;
  }
};

export const updateStore = async (id: string, storeData: Partial<NewStoreData>): Promise<boolean> => {
  try {
    const { error } = await supabase.from('locales').update(storeData).eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error actualizando tienda:', error);
    return false;
  }
};

export const deleteStore = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('locales').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error eliminando tienda:', error);
    return false;
  }
};

export const getAdminStores = async () => {
  try {
    const { data, error } = await supabase.from('locales').select('*').order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo tiendas:', error);
    return [];
  }
};