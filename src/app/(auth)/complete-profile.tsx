import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAtom } from '../../store/authAtom';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [auth, setAuth] = useAtom(authAtom);

  const [dni, setDni] = useState('');
  const [direccion, setDireccion] = useState('');

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

          </View>

          {/* Bottom actions */}
          <View className="mt-[50px] items-center">
            <TouchableOpacity onPress={onFinish} className="py-4 px-8">
              <Text className="text-[#0957D0] text-[15px] font-bold">Finalizar y empezar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
