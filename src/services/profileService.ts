import { supabase } from './supabase';

/**
 * Actualiza el perfil KYC en la base de datos marcando que el usuario
 * completó su perfil y dejando su estado en revisión (pendiente).
 */
export const updateKYCProfile = async (userId: string, dni: string, celular: string, direccion: string, fotoUrl: string) => {
  try {
    const { error } = await supabase
      .from('perfiles')
      .update({ 
        dni, 
        celular, 
        direccion,
        foto_dni_url: fotoUrl, 
        has_completed_profile: true,
        verificacion_status: 'pendiente'
      })
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (err: any) {
    throw new Error(err.message || 'Error al registrar la información KYC.');
  }
};
