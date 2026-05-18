import { supabase } from './supabase';

export interface LocalModel {
  id: string;
  nombre: string;
  ubicacion: string;
  imagen_url: string;
  precio: number;
  dimensiones: string;
}

export const getAvailableLocales = async (): Promise<LocalModel[]> => {
  try {
    const { data, error } = await supabase
      .from('locales')
      .select('id, nombre, ubicacion, imagen_url, precio, dimensiones')
      .eq('disponible', true);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo locales:', error);
    return [];
  }
};
