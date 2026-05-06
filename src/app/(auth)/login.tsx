import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAtom } from '../../store/authAtom';
import { signInUser } from '../../services/authService';

/**
 * LoginScreen
 * -----------
 * Pantalla de inicio de sesión corporativa con validaciones de seguridad
 * y conexión real a Supabase.
 */
export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useSetAtom(authAtom);
  
  // Estado de credenciales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados de retroalimentación visual (UX)
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Maneja el flujo de inicio de sesión.
   * Valida localmente antes de consultar a Supabase para ahorrar peticiones de red.
   */
  const onLogin = async () => {
    setErrorMsg('');

    // Validaciones de campos vacíos
    if (!email.trim() || !password) {
      setErrorMsg('Por favor, completa todos los campos.');
      return;
    }

    // Validación formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Email inválido');
      return;
    }

    try {
      setLoading(true); // Bloquea la UI para evitar doble envío
      const user = await signInUser(email, password);
      
      // Actualiza el estado global (Jotai) permitiendo que _layout.tsx decida el enrutamiento
      setAuth({
        isAuthenticated: true,
        user: {
          id: user.id,
          name: user.user_metadata?.full_name || 'Usuario',
          email: user.email || email,
          // Dependiendo del KYC, esto forzará o evitará pasar por /complete-profile
          hasCompletedProfile: user.user_metadata?.hasCompletedProfile || false,
        },
        token: null, // El token de sesión será manejado luego por Supabase Auth
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          
          {/* Header & Back */}
          <View className="px-5 py-5 mt-2 flex-row items-center">
            {router.canGoBack() && (
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-3 mr-2 rounded-full border border-white/10 bg-white/5 active:bg-white/10"
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <Text className="text-[#5C8FFB] text-2xl font-extrabold tracking-tight">QhatuFy</Text>
          </View>

          {/* Top Logo */}
          <View className="items-center mb-6 mt-4">
            <View className="bg-blue-600/20 p-3 rounded-full mb-4">
              <Ionicons name="lock-closed" size={24} color="#5C8FFB" />
            </View>
            <Text className="text-white text-3xl font-extrabold text-center tracking-tight mb-2">
              Bienvenido
            </Text>
            <Text className="text-gray-400 text-sm text-center px-6 leading-5">
              Ingrese sus credenciales para acceder a la gestión de su patrimonio
            </Text>
          </View>

          {/* Central Card */}
          <View className="p-8 mx-2 flex-1 mb-8">
            
            {/* Error Message */}
            {errorMsg ? (
              <Text className="text-red-400 mb-6 font-medium text-center">
                {errorMsg}
              </Text>
            ) : null}

            {/* Email Field */}
            <View className="mb-5">
              <Text className="text-white/60 text-[10px] font-bold mb-2 uppercase tracking-widest ml-1">
                Correo Electrónico
              </Text>
              <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl h-14 px-4 border border-white/10">
                <Ionicons name="mail" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="nombre@correo.com"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-white/60 text-[10px] font-bold mb-2 uppercase tracking-widest ml-1">
                Contraseña
              </Text>
              <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl h-14 px-4 border border-white/10">
                <Ionicons name="lock-closed" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2" disabled={loading}>
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember me & Forgot Password */}
            <View className="flex-row items-center justify-between mb-8 ml-1">
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} disabled={loading}>
                  <View className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-[#1C1C1E] border-white/30'}`}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                </TouchableOpacity>
                <Text className="text-gray-300 text-sm">Recordarme</Text>
              </View>

              <TouchableOpacity disabled={loading}>
                <Text className="text-blue-500 text-sm font-bold">¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              onPress={onLogin}
              disabled={loading}
              className={`bg-blue-600 rounded-full py-4 items-center justify-center flex-row shadow-lg shadow-blue-500/30 mb-8 ${loading ? 'opacity-70' : ''}`}
            >
              {loading && <ActivityIndicator color="#FFFFFF" className="mr-2" />}
              <Text className="text-white text-[16px] font-bold tracking-wide">
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Text>
            </TouchableOpacity>

            {/* Navegar a Registro con expo-router Link */}
            <View className="flex-row justify-center pb-2">
              <Text className="text-gray-400 text-sm">¿No tienes cuenta? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text className="text-blue-500 text-sm font-bold">Regístrate</Text>
                </TouchableOpacity>
              </Link>
            </View>

          </View>

          {/* Bottom Icons (Decorative) */}
          <View className="flex-row justify-center gap-12 mt-auto mb-10 opacity-30">
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            <Ionicons name="finger-print" size={20} color="#FFFFFF" />
            <Ionicons name="globe" size={20} color="#FFFFFF" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
