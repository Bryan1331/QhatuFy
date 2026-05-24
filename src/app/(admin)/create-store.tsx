import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNewStore, updateStore } from '../../services/adminService';
import { supabase } from '../../services/supabase';

export default function CreateStoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Si existe ID, estamos en modo Edición
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    precio: '',
    dimensiones: '',
    descripcion: '',
    imagen_url: '' // Para guardar la imagen actual si editamos
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchStore = async () => {
        const { data, error } = await supabase.from('locales').select('*').eq('id', id).single();
        if (data) {
          setFormData({
            nombre: data.nombre,
            ubicacion: data.ubicacion || '',
            precio: data.precio?.toString() || '',
            dimensiones: data.dimensiones || '',
            descripcion: data.descripcion || '',
            imagen_url: data.imagen_url || ''
          });
          setImageUri(data.imagen_url);
        }
        setIsFetching(false);
      };
      fetchStore();
    }
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const uploadImageToSupabase = async (uri: string) => {
    try {
      // SOLUCIÓN A LOS 0 BYTES: Usamos FileSystem y decodificamos a ArrayBuffer
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const arrayBuffer = decode(base64);
      const fileName = `local_${Date.now()}.jpg`;

      const { error } = await supabase.storage.from('locales').upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from('locales').getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.precio) {
      Alert.alert('Requeridos', 'El nombre y el precio son obligatorios.');
      return;
    }

    setIsLoading(true);
    let finalImageUrl = formData.imagen_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';

    // Si el imageUri no empieza con http (es decir, es una foto nueva del teléfono), la subimos
    if (imageUri && !imageUri.startsWith('http')) {
      const uploadedUrl = await uploadImageToSupabase(imageUri);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    const dataToSave = {
      nombre: formData.nombre,
      ubicacion: formData.ubicacion,
      precio: parseFloat(formData.precio) || 0,
      dimensiones: formData.dimensiones,
      descripcion: formData.descripcion,
      imagen_url: finalImageUrl,
    };

    const success = isEditMode
      ? await updateStore(id as string, dataToSave)
      : await createNewStore(dataToSave as any);

    setIsLoading(false);

    if (success) {
      Alert.alert('¡Éxito!', isEditMode ? 'Local actualizado.' : 'Local creado.', [{ text: 'OK', onPress: () => router.back() }]);
    } else {
      Alert.alert('Error', 'Hubo un problema al guardar la tienda.');
    }
  };

  if (isFetching) return <SafeAreaView className="flex-1 bg-[#0A0A0A] justify-center items-center"><ActivityIndicator color="#3B82F6" size="large" /></SafeAreaView>;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      {/* Header Fijo */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">{isEditMode ? 'Editar Tienda' : 'Nueva Tienda'}</Text>
        <View className="w-10" />
      </View>

      {/* Protector del Teclado Calibrado */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
      >
        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 120 : 150 }}
        >

          <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-[#1C1C1E] rounded-3xl border border-dashed border-white/20 items-center justify-center mb-8 overflow-hidden">
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-full h-full" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={40} color="#6B7280" className="mb-2" />
                <Text className="text-gray-400 font-medium">Subir foto del local</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="space-y-4 mb-8">
            <View className="mb-4">
              <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Nombre del Local *</Text>
              <TextInput className="bg-[#1C1C1E] text-white px-5 py-4 rounded-2xl border border-white/5" placeholder="Ej: Stand 105" placeholderTextColor="#6B7280" value={formData.nombre} onChangeText={(t) => setFormData({ ...formData, nombre: t })} />
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Descripción (Opcional)</Text>
              <TextInput className="bg-[#1C1C1E] text-white px-5 py-4 rounded-2xl border border-white/5 h-24" placeholder="Detalles de la tienda..." placeholderTextColor="#6B7280" multiline textAlignVertical="top" value={formData.descripcion} onChangeText={(t) => setFormData({ ...formData, descripcion: t })} />
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Ubicación</Text>
              <TextInput className="bg-[#1C1C1E] text-white px-5 py-4 rounded-2xl border border-white/5" placeholder="Ej: Piso 2" placeholderTextColor="#6B7280" value={formData.ubicacion} onChangeText={(t) => setFormData({ ...formData, ubicacion: t })} />
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Precio (S/) *</Text>
                <TextInput className="bg-[#1C1C1E] text-white px-5 py-4 rounded-2xl border border-white/5" placeholder="0.00" placeholderTextColor="#6B7280" keyboardType="numeric" value={formData.precio} onChangeText={(t) => setFormData({ ...formData, precio: t })} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Dimensiones</Text>
                <TextInput className="bg-[#1C1C1E] text-white px-5 py-4 rounded-2xl border border-white/5" placeholder="Ej: 15 m2" placeholderTextColor="#6B7280" value={formData.dimensiones} onChangeText={(t) => setFormData({ ...formData, dimensiones: t })} />
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleSave} disabled={isLoading} className={`bg-[#3B82F6] rounded-full py-4 items-center justify-center flex-row shadow-lg shadow-blue-500/20 mb-10 ${isLoading ? 'opacity-70' : ''}`}>
            {isLoading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Ionicons name={isEditMode ? "save-outline" : "cloud-upload-outline"} size={20} color="#FFF" className="mr-2" />
                <Text className="text-white font-bold text-lg ml-2">{isEditMode ? 'Guardar Cambios' : 'Publicar Local'}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
