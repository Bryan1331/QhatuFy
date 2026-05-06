import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateUserProfile } from '../../services/authService';
import { authAtom } from '../../store/authAtom';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [auth, setAuth] = useAtom(authAtom);

  const [dni, setDni] = useState('');
  const [direccion, setDireccion] = useState('');
  const [celular, setCelular] = useState('');
  const [dniFront, setDniFront] = useState<string | null>(null);
  const [dniBack, setDniBack] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Gestiona el acceso y la carga de imágenes usando expo-image-picker.
   * Maneja permisos rigurosos antes de permitir seleccionar las fotos.
   */
  const pickImage = async (side: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para poder subir tu documento.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      if (side === 'front') {
        setDniFront(result.assets[0].uri);
      } else {
        setDniBack(result.assets[0].uri);
      }
    }
  };

  // Validar si el DNI tiene entre 8 y 11 dígitos, la dirección está, celular tiene al menos 9 caracteres y las imágenes subidas
  const isFormValid = dni.length >= 8 && direccion.trim().length > 0 && celular.trim().length >= 9 && dniFront !== null && dniBack !== null;

  /**
   * Finaliza el flujo KYC actualizando el perfil en Supabase
   * y delegando el acceso al dashboard a Jotai y _layout.tsx
   */
  const onFinish = async () => {
    if (!auth.user || !isFormValid) return;

    try {
      setLoading(true);
      await updateUserProfile(auth.user.id, dni, direccion, celular);

      setAuth((prev) => ({
        ...prev,
        user: {
          ...prev.user!,
          hasCompletedProfile: true,
          dni,
          direccion,
          celular,
        }
      }));

      router.replace('/(private)/dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la información');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131517' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 pt-2">

              {/* Header */}
              <View className="flex-row items-center justify-between mb-16 mt-4">
                <TouchableOpacity onPress={() => router.canGoBack() && router.back()} className="p-2 -ml-2">
                  <Ionicons name="arrow-back" size={24} color="#4A90E2" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-wide">QhatuFy</Text>
                <View className="w-10" />
              </View>

              {/* Titles */}
              <View className="items-center mb-10">
                <Text className="text-white text-[52px] font-extrabold text-center leading-[56px] mb-4 tracking-tight">
                  Ya casi{'\n'}terminamos
                </Text>
                <Text className="text-[#9CA3AF] text-[15px] text-center px-4 leading-6">
                  Necesitamos estos datos para validar tus futuros contratos.
                </Text>
              </View>

              {/* Form */}
              <View className="mt-6">

                {/* DNI / RUC Input */}
                <View className="flex-row items-center bg-[#1D1D1F] border-[0.5px] border-white/5 rounded-3xl px-5 h-[62px] mb-4">
                  <Ionicons name="document-text" size={20} color="#6B7280" />
                  <TextInput
                    style={{ color: 'white', fontSize: 16 }}
                    className="flex-1 ml-4"
                    placeholder="DNI / RUC"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                    maxLength={11}
                    value={dni}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setDni(numericText.slice(0, 11));
                    }}
                  />
                </View>

                {/* Dirección Input */}
                <View className="flex-row items-center bg-[#1D1D1F] border-[0.5px] border-white/5 rounded-3xl px-5 h-[62px] mb-4">
                  <Ionicons name="map" size={20} color="#6B7280" />
                  <TextInput
                    style={{ color: 'white', fontSize: 16 }}
                    className="flex-1 ml-4"
                    placeholder="Dirección Fiscal"
                    placeholderTextColor="#6B7280"
                    value={direccion}
                    onChangeText={setDireccion}
                  />
                </View>

                {/* Celular Input */}
                <View className="flex-row items-center bg-[#1D1D1F] border-[0.5px] border-white/5 rounded-3xl px-5 h-[62px]">
                  <Ionicons name="call" size={20} color="#6B7280" />
                  <TextInput
                    style={{ color: 'white', fontSize: 16 }}
                    className="flex-1 ml-4"
                    placeholder="Celular"
                    placeholderTextColor="#6B7280"
                    keyboardType="phone-pad"
                    value={celular}
                    onChangeText={setCelular}
                  />
                </View>

                {/* Documento de Identidad KYC */}
                <Text className="text-white/80 font-semibold mt-6 mb-3 px-1">Documento de Identidad</Text>

                <View className="flex-row justify-between">
                  {/* Cara Frontal */}
                  <Pressable
                    className="border-dashed border-2 border-white/20 bg-[#1C1C1E] rounded-2xl p-4 items-center justify-center h-32 flex-1 mx-1 active:bg-white/5"
                    onPress={() => pickImage('front')}
                  >
                    {dniFront ? (
                      <Image source={{ uri: dniFront }} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <>
                        <Camera color="#6B7280" size={24} />
                        <Text className="text-[#6B7280] text-xs mt-2 font-medium">Subir frente</Text>
                      </>
                    )}
                  </Pressable>

                  {/* Cara Posterior */}
                  <Pressable
                    className="border-dashed border-2 border-white/20 bg-[#1C1C1E] rounded-2xl p-4 items-center justify-center h-32 flex-1 mx-1 active:bg-white/5"
                    onPress={() => pickImage('back')}
                  >
                    {dniBack ? (
                      <Image source={{ uri: dniBack }} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <>
                        <Camera color="#6B7280" size={24} />
                        <Text className="text-[#6B7280] text-xs mt-2 font-medium">Subir reverso</Text>
                      </>
                    )}
                  </Pressable>
                </View>

              </View>

              {/* Bottom actions */}
              <View className="mt-[50px] items-center">
                <TouchableOpacity
                  onPress={onFinish}
                  className="py-4 px-8"
                  disabled={!isFormValid || loading}
                  style={{ opacity: isFormValid && !loading ? 1 : 0.4 }}
                >
                  <Text className="text-[#0957D0] text-[15px] font-bold">
                    {loading ? 'Procesando...' : 'Finalizar y empezar'}
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
