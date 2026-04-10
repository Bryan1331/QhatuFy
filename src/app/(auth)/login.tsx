import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAtom } from '../../store/authAtom';

/**
 * LoginScreen
 * -----------
 * Pantalla de inicio de sesión corporativa.
 * Maneja el estado local del formulario e inyecta la simulación de login hacia el authAtom.
 */
export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useSetAtom(authAtom);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onLogin = () => {
    setAuth((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Admin',
        email: email || 'admin@corporativo.com',
        hasCompletedProfile: true,
      }
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111111' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-center px-5">
          {/* Retroceder */}
          {router.canGoBack() && (
            <View className="absolute top-8 left-5 z-50">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="p-4 items-center justify-center rounded-full bg-white/5 border border-white/10"
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Top Logo */}
          <View className="items-center mb-8">
            <View className="flex-row items-center mb-6">
              <View className="bg-[#3B82F6]/20 p-2 rounded-full mr-3">
                <Ionicons name="lock-closed" size={20} color="#3B82F6" />
              </View>
              <Text className="text-white text-xl font-bold tracking-tight">QhatuFy</Text>
            </View>

            <Text className="text-white text-[42px] font-extrabold text-center tracking-tight mb-2">
              QhatuFy
            </Text>
            <Text className="text-gray-400 text-base text-center px-6">
              Gestión Inteligente
            </Text>
          </View>

          {/* Central Card */}
          <View className="bg-[#1C1C1E] rounded-[32px] p-7 shadow-2xl shadow-black/80">

            {/* Email Field */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest ml-1">
                Correo Electrónico
              </Text>
              <View className="flex-row items-center bg-[#2C2C2E] rounded-[20px] px-4 py-1 h-14">
                <Ionicons name="mail-outline" size={20} color="#8E8E93" />
                <View className="flex-1 ml-3 h-full justify-center">
                  <TextInput
                    style={{ color: 'white', fontSize: 16 }}
                    placeholder="nombre@corporativo.com"
                    placeholderTextColor="#8E8E93"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest ml-1">
                Contraseña
              </Text>
              <View className="flex-row items-center bg-[#2C2C2E] rounded-[20px] px-4 py-1 h-14">
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />
                <View className="flex-1 ml-3 h-full justify-center">
                  <TextInput
                    style={{ color: 'white', fontSize: 16 }}
                    placeholder="••••••••"
                    placeholderTextColor="#8E8E93"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <View className="p-1">
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#8E8E93" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember me */}
            <View className="flex-row items-center mb-8 ml-1">
              <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                <View className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${rememberMe ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-[#2C2C2E] border-gray-600'}`}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
              </TouchableOpacity>
              <Text className="text-gray-400 text-sm">Recordarme</Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity onPress={onLogin}>
              <View className="bg-[#3B82F6] rounded-full py-4 items-center justify-center">
                <Text className="text-white text-lg font-bold">Ingresar</Text>
              </View>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity>
              <View className="mt-8 items-center">
                <Text className="text-gray-400 text-sm font-medium">Olvidé mi contraseña</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-12 items-center">
            <Text className="text-gray-500 text-sm">
              ¿No tiene una cuenta corporativa?{' '}
              <Text className="text-[#3B82F6] font-semibold">Contacte a soporte</Text>
            </Text>
          </View>

          {/* Bottom Icons (Decorative) */}
          <View className="flex-row justify-center space-x-12 mt-10">
            <Ionicons name="shield-checkmark-outline" size={20} color="#333333" />
            <Ionicons name="checkmark-circle-outline" size={20} color="#333333" />
            <Ionicons name="globe-outline" size={20} color="#333333" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
