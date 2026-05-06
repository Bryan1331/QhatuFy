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

    return data.user;
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
