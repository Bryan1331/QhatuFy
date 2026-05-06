import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAtom } from '../../store/authAtom';
import { signUpUser } from '../../services/authService';

/**
 * RegisterScreen
 * --------------
 * Pantalla de creación de cuenta. Implementa validaciones condicionales,
 * conexión con Supabase (signUpUser) y redirige el flujo estableciendo hasCompletedProfile en falso.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useSetAtom(authAtom);

  // Estados Locales
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados visuales y de UX
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Valida rigurosamente la entrada de usuario antes de proceder a la creación
   * de la cuenta mediante Supabase para asegurar integridad de datos.
   */
  const handleRegister = async () => {
    setError('');

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifícalas y vuelve a intentar.');
      return;
    }

    if (!agreed) {
      setError('Debes aceptar los términos y condiciones antes de continuar.');
      return;
    }

    try {
      setLoading(true); // Bloquear formulario durante transacción
      const user = await signUpUser(email, password, name);
      
      // La actualización a Auth Atom causa que _layout.tsx redirija automáticamente.
      setAuth({
        isAuthenticated: true,
        user: { 
          id: user.id, 
          name: name, 
          email: email, 
          hasCompletedProfile: false // Obliga al usuario a pasar por el flujo KYC
        },
        token: null, // El token real lo manejaríamos con onAuthStateChange en una etapa posterior
      });
    } catch (err: any) {
      setError(err.message);
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

          {/* Logo QhatuFy & Back Button */}
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

          {/* Tarjeta Principal */}
          <View className="p-8 mx-2 mt-2 flex-1 mb-8">
            <Text className="text-white text-3xl font-bold tracking-tight mb-2">Crear cuenta</Text>
            <Text className="text-gray-400 text-sm mb-4 leading-5 pr-4">
              Únase a la plataforma de gestión de patrimonio más exclusiva
            </Text>

            {/* Manejo de Error Simplificado */}
            {error ? (
              <Text className="text-red-400 mt-2 mb-4 font-medium">
                {error}
              </Text>
            ) : null}

            {/* Input Nombre Completo */}
            <View className="mb-5">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest mb-2 ml-1 uppercase">
                Nombre Completo
              </Text>
              <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl h-14 px-4 border border-white/10">
                <Ionicons name="person" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="Su nombre"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Input Correo Electrónico */}
            <View className="mb-5">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest mb-2 ml-1 uppercase">
                Correo Electrónico
              </Text>
              <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl h-14 px-4 border border-white/10">
                <Ionicons name="mail" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="email@ejemplo.com"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Input Contraseña */}
            <View className="mb-5">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest mb-2 ml-1 uppercase">
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

            {/* Input Confirmar Contraseña */}
            <View className="mb-6">
              <Text className="text-white/60 text-[10px] font-bold tracking-widest mb-2 ml-1 uppercase">
                Confirmar Contraseña
              </Text>
              <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl h-14 px-4 border border-white/10">
                <Ionicons name="lock-closed" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-white text-[15px]"
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2" disabled={loading}>
                  <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Checkbox Términos y Condiciones */}
            <View className="flex-row items-center mb-10 ml-1">
              <TouchableOpacity
                onPress={() => setAgreed(!agreed)}
                disabled={loading}
                className={`w-[22px] h-[22px] rounded-full border items-center justify-center mr-3 ${agreed ? 'bg-blue-600 border-blue-600' : 'bg-[#1C1C1E] border-white/30'
                  }`}
              >
                {agreed && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </TouchableOpacity>
              <Text className="text-gray-300 text-sm">
                Acepto <Text className="text-blue-500">términos y condiciones</Text>
              </Text>
            </View>

            {/* Botón Registrarse */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className={`bg-blue-600 rounded-full py-4 items-center mb-8 flex-row justify-center ${loading ? 'opacity-70' : ''}`}
            >
              {loading && <ActivityIndicator color="#FFFFFF" className="mr-2" />}
              <Text className="text-white font-bold text-[16px] tracking-wide">
                {loading ? 'Procesando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            {/* Navegar a Login con expo-router Link */}
            <View className="flex-row justify-center pb-2">
              <Text className="text-gray-400 text-sm">¿Ya tienes cuenta? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text className="text-blue-500 text-sm font-bold">Inicia sesión</Text>
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
