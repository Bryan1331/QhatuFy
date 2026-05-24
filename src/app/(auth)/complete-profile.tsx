import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateKYCProfile } from '../../services/authService';
import { uploadDocumentImage } from '../../services/storageService';
import { authAtom } from '../../store/authAtom';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [auth, setAuth] = useAtom(authAtom);

  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [direccion, setDireccion] = useState('');
  const [dniFront, setDniFront] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  /**
   * Abre la galería para que el usuario seleccione una foto de su documento.
   */
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para poder subir tu documento.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled) {
      setDniFront(result.assets[0].uri);
    }
  };

  const isFormValid = dni.length >= 8 && celular.trim().length >= 9 && direccion.trim().length > 0 && dniFront !== null;

  /**
   * Sube la imagen del documento y registra la información de perfil (KYC) en la base de datos.
   */
  const onFinish = async () => {
    if (!auth.user || !isFormValid) return;

    try {
      setLoading(true);
      
      setLoadingText('Subiendo documento de forma segura...');
      const fotoUrl = await uploadDocumentImage(auth.user.id, dniFront!);

      setLoadingText('Verificando perfil...');
      await updateKYCProfile(auth.user.id, dni, celular, direccion, fotoUrl);

      // Actualizar el estado local con la nueva información de verificación
      setAuth((prev) => {
        if (!prev.user) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            hasCompletedProfile: true,
            verificacion_status: 'pendiente',
            dni,
            celular,
            direccion,
            foto_dni_url: fotoUrl,
          }
        };
      });

      router.replace('/(private)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la información');
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 pt-2">

              {/* Header */}
              <View className="flex-row items-center justify-between mb-10 mt-4">
                <TouchableOpacity onPress={() => router.canGoBack() && router.back()} className="p-2 -ml-2" disabled={loading}>
                  <Ionicons name="arrow-back" size={24} color={loading ? '#333' : '#4A90E2'} />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-wide">KYC</Text>
                <View className="w-10" />
              </View>

              {/* Titles */}
              <View className="items-center mb-8">
                <Text className="text-white text-3xl font-extrabold text-center mb-3 tracking-tight">
                  Verificación de Identidad
                </Text>
                <Text className="text-gray-400 text-sm text-center px-4 leading-5">
                  Por seguridad, requerimos validar tu identidad antes de operar.
                </Text>
              </View>

              {/* Form - Shadcn/NativeWind Aesthetics */}
              <View className="mt-4">

                <View className="mb-4">
                  <Text className="text-white/60 text-[11px] font-bold mb-2 uppercase tracking-widest ml-1">
                    DNI / RUC
                  </Text>
                  <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl h-14 px-4 border border-white/10">
                    <Ionicons name="card" size={18} color="#6B7280" />
                    <TextInput
                      style={{ color: 'white', fontSize: 15 }}
                      className="flex-1 ml-3"
                      placeholder="Escribe tu número de documento"
                      placeholderTextColor="#6B7280"
                      keyboardType="numeric"
                      maxLength={11}
                      value={dni}
                      editable={!loading}
                      onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        setDni(numericText.slice(0, 11));
                      }}
                    />
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-white/60 text-[11px] font-bold mb-2 uppercase tracking-widest ml-1">
                    Teléfono Celular
                  </Text>
                  <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl h-14 px-4 border border-white/10">
                    <Ionicons name="call" size={18} color="#6B7280" />
                    <TextInput
                      style={{ color: 'white', fontSize: 15 }}
                      className="flex-1 ml-3"
                      placeholder="Ej. 987654321"
                      placeholderTextColor="#6B7280"
                      keyboardType="phone-pad"
                      value={celular}
                      editable={!loading}
                      onChangeText={setCelular}
                    />
                  </View>
                </View>

                {/* Input Dirección Física */}
                <View className="mb-6">
                  <Text className="text-white/60 text-[11px] font-bold mb-2 uppercase tracking-widest ml-1">
                    Dirección Física
                  </Text>
                  <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl h-14 px-4 border border-white/10">
                    <Ionicons name="location" size={18} color="#6B7280" />
                    <TextInput
                      style={{ color: 'white', fontSize: 15 }}
                      className="flex-1 ml-3"
                      placeholder="Ej. Av. Principal 123, Stand 45"
                      placeholderTextColor="#6B7280"
                      value={direccion}
                      editable={!loading}
                      onChangeText={setDireccion}
                    />
                  </View>
                </View>

                {/* Documento de Identidad KYC */}
                <Text className="text-white/60 text-[11px] font-bold mb-2 uppercase tracking-widest ml-1">
                  Fotografía del Documento
                </Text>

                <Pressable
                  className="border-dashed border-2 border-white/20 bg-[#1C1C1E] rounded-2xl p-4 items-center justify-center h-48 active:bg-white/5"
                  onPress={pickImage}
                  disabled={loading}
                >
                  {dniFront ? (
                    <Image source={{ uri: dniFront }} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <View className="items-center">
                      <View className="bg-blue-500/20 p-4 rounded-full mb-3">
                        <Camera color="#5C8FFB" size={32} />
                      </View>
                      <Text className="text-white font-bold mb-1">Presiona para capturar</Text>
                      <Text className="text-gray-500 text-xs font-medium text-center px-4">
                        Asegúrate de que la imagen sea legible y sin reflejos.
                      </Text>
                    </View>
                  )}
                </Pressable>

              </View>

              {/* Bottom actions */}
              <View className="mt-10 mb-8 items-center">
                <TouchableOpacity
                  onPress={onFinish}
                  disabled={!isFormValid || loading}
                  className={`w-full bg-blue-600 rounded-full py-4 items-center justify-center shadow-lg shadow-blue-500/30 flex-row ${(isFormValid && !loading) ? '' : 'opacity-50'}`}
                >
                  {loading && <ActivityIndicator color="#ffffff" className="mr-3" />}
                  <Text className="text-white text-[15px] font-bold tracking-wide">
                    {loading ? loadingText : 'Finalizar Verificación'}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
