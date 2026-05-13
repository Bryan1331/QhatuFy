import { supabase } from './supabase';

/**
 * Registra un nuevo usuario en Supabase Auth.
 * @param email Correo electrónico del usuario.
 * @param password Contraseña del usuario.
 * @param name Nombre completo a guardar en los metadatos.
 * @returns El objeto de usuario creado.
 */
export const signUpUser = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo crear el usuario.');
    }

    return data.user;
  } catch (err: any) {
    throw new Error(err.message || 'Error en el registro');
  }
};

/**
 * Inicia sesión de un usuario existente en Supabase.
 * @param email Correo electrónico del usuario.
 * @param password Contraseña del usuario.
 * @returns El objeto de usuario autenticado.
 */
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Error al iniciar sesión.');
    }

    // ESPERAR HIDRATACIÓN
    const profile = await getExtendedProfile(data.user.id, email);
    if (!profile) {
      throw new Error('No se pudo obtener el perfil del usuario.');
    }

    return { session: data.session, user: profile };
  } catch (err: any) {
    throw new Error(err.message || 'Error en el inicio de sesión');
  }
};

/**
 * Actualiza el perfil del usuario en la tabla 'perfiles' (KYC).
 * Establece has_completed_profile a true al finalizar.
 * @param userId ID del usuario (procedente de authAtom / Supabase).
 * @param dni Documento de identidad.
 * @param direccion Dirección fiscal.
 * @param celular Número de contacto.
 */
export const updateUserProfile = async (userId: string, dni: string, direccion: string, celular: string) => {
  try {
    const { error } = await supabase
      .from('perfiles')
      .update({ dni, direccion, celular, has_completed_profile: true })
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (err: any) {
    throw new Error(err.message || 'Error al actualizar el perfil');
  }
};

/**
 * Obtiene el perfil de un usuario desde la tabla 'perfiles' y mapea
 * los datos de Supabase hacia el átomo (ej. has_completed_profile -> hasCompletedProfile).
 */
export const getExtendedProfile = async (userId: string, email: string) => {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return null;

    // Transformación clave: mapear has_completed_profile (DB) a hasCompletedProfile (Átomo)
    return {
      id: data.id,
      nombre: data.nombre || null,
      email: email, // Usar el email de auth
      role: data.role || 'user',
      verificacion_status: data.verificacion_status || 'pendiente',
      hasCompletedProfile: data.has_completed_profile || false,
      dni: data.dni,
      direccion: data.direccion,
      celular: data.celular,
      foto_dni_url: data.foto_dni_url,
    };
  } catch (err: any) {
    console.error('Error al obtener perfil extendido:', err);
    throw err; // Propagar error para forzar signOut en el layout
  }
};
