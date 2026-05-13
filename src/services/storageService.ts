import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

/**
 * Sube un archivo de imagen al bucket 'documentos' de Supabase Storage.
 * Garantiza blindaje en nombres de archivos únicos y manejo del contentType.
 */
export const uploadDocumentImage = async (userId: string, uri: string): Promise<string> => {
  try {
    const fileName = `dni_${userId}_${Date.now()}.jpg`;
    
    // Obtenemos el cuerpo del archivo leyendo localmente en Base64 para evitar el bug de 0 Bytes
    const base64File = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64' as any,
    });
    
    // Convertimos la cadena Base64 a ArrayBuffer para Supabase
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
