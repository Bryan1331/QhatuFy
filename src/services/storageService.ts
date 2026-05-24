import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

/**
 * Sube una imagen al bucket de Supabase Storage leyendo el archivo en base64 para evitar errores de red.
 */
export const uploadDocumentImage = async (userId: string, uri: string): Promise<string> => {
  try {
    const fileName = `dni_${userId}_${Date.now()}.jpg`;
    
    // Leer el archivo local en formato Base64
    const base64File = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64' as any,
    });
    
    // Convertir Base64 a ArrayBuffer para Supabase
    const fileBuffer = decode(base64File);

    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('documentos')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    throw new Error(error.message || 'Error al subir el documento de forma segura.');
  }
};
