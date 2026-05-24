import { supabase } from './supabase';

export interface LocalModel {
  id: string;
  nombre: string;
  ubicacion: string;
  imagen_url: string;
  precio: number;
  dimensiones: string;
  descripcion?: string;
}

export const getAvailableLocales = async (): Promise<LocalModel[]> => {
  const { data, error } = await supabase.from('locales').select('*').eq('disponible', true);
  if (error) { console.error(error); return []; }
  return data || [];
};

export const getLocalById = async (id: string): Promise<LocalModel | null> => {
  const { data, error } = await supabase.from('locales').select('*').eq('id', id).single();
  if (error) { console.error(error); return null; }
  return data;
};
