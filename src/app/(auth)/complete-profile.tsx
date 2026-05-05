import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, Image, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { authAtom } from '../../store/authAtom';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [auth, setAuth] = useAtom(authAtom);

  const [dni, setDni] = useState('');
  const [direccion, setDireccion] = useState('');
  const [dniFront, setDniFront] = useState<string | null>(null);
  const [dniBack, setDniBack] = useState<string | null>(null);

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

  // Validar si el DNI tiene entre 8 y 11 dígitos, la dirección está y las imágenes subidas
  const isFormValid = dni.length >= 8 && direccion.trim().length > 0 && dniFront !== null && dniBack !== null;

  const onFinish = () => {
    // Validar si es necesario, o simplemente pasar si hay datos
    if (!auth.user) return;

    // 1. Actualizar el átomo de Jotai
    // 2. Guardar el DNI y la Dirección
    setAuth((prev) => ({
      ...prev,
      user: {
        ...prev.user!,
        hasCompletedProfile: true,
        dni: dni,
        direccion: direccion,
      }
    }));

    // 3. Redirigir al dashboard
    router.replace('/(private)/dashboard');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131517' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
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
            <View className="flex-row items-center bg-[#1D1D1F] border-[0.5px] border-white/5 rounded-3xl px-5 h-[62px]">
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
              disabled={!isFormValid}
              style={{ opacity: isFormValid ? 1 : 0.4 }}
            >
              <Text className="text-[#0957D0] text-[15px] font-bold">Finalizar y empezar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
