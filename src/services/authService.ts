import { supabase } from './supabase';

/**
 * Registra un nuevo usuario en Supabase Auth y guarda su nombre completo en los metadatos.
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

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('No se pudo crear el usuario.');

    return data.user;
  } catch (err: any) {
    throw new Error(err.message || 'Error en el registro');
  }
};

/**
 * Inicia sesión de un usuario y obtiene su perfil extendido de la base de datos.
 */
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Error al iniciar sesión.');

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
 * Actualiza la información KYC (verificación de identidad) en la tabla 'perfiles'.
 * Marca que el usuario completó su perfil y lo deja en estado 'pendiente' para revisión.
 */
export const updateKYCProfile = async (
  userId: string,
  dni: string,
  celular: string,
  direccion: string,
  fotoUrl: string
) => {
  try {
    const { error } = await supabase
      .from('perfiles')
      .update({
        dni,
        celular,
        direccion,
        foto_dni_url: fotoUrl,
        has_completed_profile: true,
        verificacion_status: 'pendiente',
      })
      .eq('id', userId);

    if (error) throw new Error(error.message);

    return true;
  } catch (err: any) {
    throw new Error(err.message || 'Error al registrar la información KYC.');
  }
};

/**
 * Obtiene el perfil del usuario desde la tabla 'perfiles' mapeando los nombres de
 * columna de la base de datos a las propiedades en formato camelCase usadas en la aplicación.
 */
export const getExtendedProfile = async (userId: string, email: string) => {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
      id: data.id,
      nombre: data.nombre || null,
      email: email,
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
    throw err;
  }
};

