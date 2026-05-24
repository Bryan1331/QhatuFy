import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { authAtom } from '../../store/authAtom';

export default function ProfileScreen() {
  const router = useRouter();
  const [auth, setAuth] = useAtom(authAtom);
  const user = auth.user;

  const handleLogout = () => {
    setAuth({ user: null, session: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.push('/(private)' as any)} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Mi Perfil</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        {/* Sección de Avatar */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-[#1A253A] border-4 border-white/5 items-center justify-center mb-4 relative">
            <Ionicons name="person" size={48} color="#5C8FFB" />
            {user?.verificacion_status === 'aprobado' && (
              <View className="absolute bottom-0 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0A0A0A] items-center justify-center">
                <Ionicons name="checkmark" size={12} color="#FFF" />
              </View>
            )}
          </View>
          <Text className="text-white text-2xl font-bold">{user?.nombre || 'Usuario'}</Text>
          <Text className="text-gray-400 text-sm mt-1">{user?.email}</Text>
        </View>

        {/* Tarjetas de Información */}
        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Información de Cuenta</Text>
        
        <View className="bg-[#151517] rounded-3xl p-5 mb-6 border border-white/5">
          <View className="flex-row justify-between items-center py-3 border-b border-white/5">
            <Text className="text-gray-400 font-medium">DNI</Text>
            <Text className="text-white font-medium">{user?.dni || 'No registrado'}</Text>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-white/5">
            <Text className="text-gray-400 font-medium">Celular</Text>
            <Text className="text-white font-medium">{user?.celular || 'No registrado'}</Text>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-white/5">
            <Text className="text-gray-400 font-medium">Estado KYC</Text>
            <Text className={`font-bold uppercase text-xs tracking-wider ${user?.verificacion_status === 'aprobado' ? 'text-green-500' : user?.verificacion_status === 'rechazado' ? 'text-red-500' : 'text-orange-500'}`}>
              {user?.verificacion_status || 'Pendiente'}
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-white/5">
            <Text className="text-gray-400 font-medium">Rol del Sistema</Text>
            <Text className="text-white font-medium capitalize">{user?.role || 'Inquilino'}</Text>
          </View>
          <View className="flex-row justify-between items-center py-3">
            <Text className="text-gray-400 font-medium">Perfil Completado</Text>
            <Ionicons name={user?.hasCompletedProfile ? "checkmark-circle" : "close-circle"} size={20} color={user?.hasCompletedProfile ? "#22C55E" : "#EF4444"} />
          </View>
        </View>

        <View className="bg-[#151517] rounded-3xl p-5 mb-8 border border-white/5">
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark-outline" size={24} color="#9CA3AF" />
            <View className="ml-3 flex-1">
              <Text className="text-white font-bold text-sm">Privacidad y Seguridad</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Tus datos están protegidos por QhatuFy</Text>
            </View>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500/10 rounded-2xl py-4 flex-row items-center justify-center border border-red-500/20 mb-10"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-bold text-sm ml-2">Cerrar Sesión Segura</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
