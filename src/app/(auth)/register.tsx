import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAtom } from '../../store/authAtom';

/**
 * RegisterScreen
 * --------------
 * Pantalla de creación de cuenta. Implementa validaciones condicionales,
 * manejo de contraseñas sincronizadas y redirige el flujo autenticado estableciendo hasCompletedProfile en falso.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useSetAtom(authAtom);

  // Estados Locales
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState('');

  const handleRegister = () => {
    setError('');

    // Validación de campos vacíos
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // Validación de contraseña
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifícalas y vuelve a intentar.');
      return;
    }

    // Validación de términos y condiciones
    if (!agreed) {
      setError('Debes aceptar los términos y condiciones antes de continuar.');
      return;
    }

    // Actualizamos Jotai
    setAuth({
      user: {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        hasCompletedProfile: false, // Fundamental para obligar al usuario a completar el perfil
      },
      isAuthenticated: true,
      token: 'mock-registro-token-12345',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

          {/* Logo QhatuFy & Back Button */}
          <View className="px-5 py-5 mt-2 flex-row items-center">
            {router.canGoBack() && (
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="p-3 mr-2 rounded-full border border-white/5 bg-white/5 active:bg-white/10"
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <Text className="text-[#5C8FFB] text-2xl font-extrabold tracking-tight">QhatuFy</Text>
          </View>

          {/* Tarjeta Principal */}
          <View className="bg-[#18181A] rounded-[40px] p-8 mx-5 mt-2 shadow-2xl flex-1 mb-8">
            <Text className="text-white text-3xl font-bold tracking-tight mb-2">Crear cuenta</Text>
            <Text className="text-gray-400 text-sm mb-8 leading-5 pr-4">
              Únase a la plataforma de gestión de patrimonio más exclusiva
            </Text>

            {/* Manejo de Error Gráfico */}
            {error ? (
              <View className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-6 flex-row items-center">
                <Ionicons name="alert-circle" size={18} color="#EF4444" className="mr-2" />
                <Text className="text-red-400 text-xs font-medium flex-1 ml-2 leading-tight">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Input Nombre Completo */}
            <View className="mb-5">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest mb-2 ml-1 uppercase">
                Nombre Completo
              </Text>
              <View className="flex-row items-center bg-[#121212] rounded-2xl h-14 px-4 border border-white/5">
                <Ionicons name="person" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="Su nombre"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Input Correo Electrónico */}
            <View className="mb-5">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest mb-2 ml-1 uppercase">
                Correo Electrónico
              </Text>
              <View className="flex-row items-center bg-[#121212] rounded-2xl h-14 px-4 border border-white/5">
                <Ionicons name="mail" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="email@ejemplo.com"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Input Contraseña */}
            <View className="mb-5">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest mb-2 ml-1 uppercase">
                Contraseña
              </Text>
              <View className="flex-row items-center bg-[#121212] rounded-2xl h-14 px-4 border border-white/5">
                <Ionicons name="lock-closed" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Confirmar Contraseña */}
            <View className="mb-6">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest mb-2 ml-1 uppercase">
                Confirmar Contraseña
              </Text>
              <View className="flex-row items-center bg-[#121212] rounded-2xl h-14 px-4 border border-white/5">
                <Ionicons name="lock-closed" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2">
                  <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Checkbox Términos y Condiciones */}
            <View className="flex-row items-center mb-10 ml-1">
              <TouchableOpacity
                onPress={() => setAgreed(!agreed)}
                className={`w-[22px] h-[22px] rounded-full border items-center justify-center mr-3 ${agreed ? 'bg-[#5C8FFB] border-[#5C8FFB]' : 'bg-[#121212] border-gray-600'
                  }`}
              >
                {agreed && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </TouchableOpacity>
              <Text className="text-gray-300 text-sm">
                Acepto <Text className="text-[#5C8FFB]">términos y condiciones</Text>
              </Text>
            </View>

            {/* Botón Registrarse */}
            <TouchableOpacity
              onPress={handleRegister}
              className="bg-[#5C8FFB] rounded-full py-4 items-center shadow-lg shadow-blue-500/30 mb-8"
            >
              <Text className="text-white font-bold text-[16px] tracking-wide">Registrarse</Text>
            </TouchableOpacity>

            {/* Navegar a Login con expo-router Link */}
            <View className="flex-row justify-center pb-2">
              <Text className="text-gray-400 text-sm">¿Ya tienes cuenta? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-[#5C8FFB] text-sm font-bold">Inicia sesión</Text>
                </TouchableOpacity>
              </Link>
            </View>

          </View>

          {/* Indicadores de Seguridad (Bottom Footer) */}
          <View className="flex-row justify-center pb-8 pt-2">
            <View className="flex-row items-center mx-3 opacity-30">
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              <Text className="text-[#FFFFFF] text-[10px] font-bold tracking-widest ml-1.5 uppercase">Secure</Text>
            </View>
            <View className="flex-row items-center mx-3 opacity-30">
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
              <Text className="text-[#FFFFFF] text-[10px] font-bold tracking-widest ml-1.5 uppercase">Encrypted</Text>
            </View>
            <View className="flex-row items-center mx-3 opacity-30">
              <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              <Text className="text-[#FFFFFF] text-[10px] font-bold tracking-widest ml-1.5 uppercase">Certified</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
