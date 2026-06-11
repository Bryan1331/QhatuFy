import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDashboardStats } from '../../services/adminService';
import { supabase } from '../../services/supabase';
import { adminStatsAtom } from '../../store/adminAtom';

/**
 * Pantalla principal del panel de administración de QhatuFy.
 */
export default function AdminDashboard() {
  const router = useRouter();
  
  const [stats, setStats] = useAtom(adminStatsAtom);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Cierra la sesión del administrador y redirige a login.
   */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/login' as Href);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error cargando stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [setStats]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* --- CABECERA (Title Area) --- */}
        {/* Muestra el título principal, el botón de cierre de sesión y el estado del servidor/rol */}
        <View className="px-6 mt-6 mb-8">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-white text-3xl font-bold tracking-tight">ADMIN QHATUFY</Text>
            
            {/* Botón para cerrar sesión */}
            <TouchableOpacity className="p-2 rounded-full bg-red-500/10" onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 text-sm mb-6">Panel de Control Principal</Text>

          {/* Indicadores de estado (Servidor y Rol) */}
          <View className="flex-row gap-3">
            <View className="bg-[#1C1C1E] flex-row items-center px-4 py-2 rounded-full border border-white/5">
              <View className="w-1.5 h-1.5 bg-[#5C8FFB] rounded-full mr-2" />
              <Text className="text-white text-xs font-medium">Servidor: En Línea</Text>
            </View>
            <View className="bg-[#1C1C1E] flex-row items-center px-4 py-2 rounded-full border border-white/5">
              <Ionicons name="shield-checkmark-outline" size={12} color="#5C8FFB" className="mr-2" />
              <Text className="text-white text-xs font-medium ml-1.5">Rol: Administrador</Text>
            </View>
          </View>
        </View>

        {/* --- TARJETA HERO: KYC HUB (Verificación de Documentos) --- */}
        {/* Tarjeta principal que destaca la sección de verificación de solicitudes pendientes */}
        <View className="px-6">
          <View className="bg-[#151517] rounded-[32px] p-7 border border-white/5">
            {/* Etiqueta superior */}
            <View className="bg-[#B45309]/20 self-start flex-row items-center px-3 py-1.5 rounded-full border border-[#B45309]/30 mb-6">
              <Ionicons name="shield-checkmark" size={10} color="#F97316" />
              <Text className="text-[#F97316] text-[10px] font-bold tracking-widest ml-1.5">KYC HUB</Text>
            </View>

            {/* Título de la tarjeta */}
            <Text className="text-white text-3xl font-bold leading-tight mb-5 tracking-tight">Verificación de Documentos</Text>

            {/* Contador de solicitudes pendientes */}
            <View className="flex-row items-center mb-8">
              <Ionicons name="document-text-outline" size={20} color="#F97316" />
              {isLoading ? (
                <ActivityIndicator size="small" color="#F97316" className="ml-3" />
              ) : (
                <Text className="text-[#F97316] text-[15px] font-bold ml-2.5">{stats.pendingKYC} Solicitudes Pendientes</Text>
              )}
            </View>

            {/* Botón de acción principal para ir a la pantalla de verificación */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/verify-documents' as Href)}
              className="bg-[#5C8FFB] rounded-full py-3.5 px-6 self-start flex-row items-center"
            >
              <Text className="text-[#0A0A0A] font-bold text-[15px] mr-2">
                Verificar
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#0A0A0A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- TARJETA: AUDITORÍA DE PAGOS --- */}
        <View className="px-6 mt-6">
          <View className="bg-[#1C1C1E] rounded-[32px] p-7 border border-emerald-500/20">
            <View className="bg-emerald-500/20 self-start flex-row items-center px-3 py-1.5 rounded-full border border-emerald-500/30 mb-5">
              <Ionicons name="cash" size={12} color="#10B981" />
              <Text className="text-emerald-400 text-[10px] font-bold tracking-widest ml-1.5 uppercase">Tesorería</Text>
            </View>
            <Text className="text-white text-2xl font-bold leading-tight mb-4 tracking-tight">Revisión de Pagos</Text>
            <View className="flex-row items-center mb-6">
              <Ionicons name="wallet-outline" size={18} color="#10B981" />
              {isLoading ? (
                <ActivityIndicator size="small" color="#10B981" className="ml-3" />
              ) : (
                <Text className="text-emerald-400 text-sm font-bold ml-2.5">
                  {stats.pendingPayments || 0} Vouchers en Cola
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/verify-payments' as Href)}
              className="bg-emerald-500 rounded-full py-3.5 px-6 self-start flex-row items-center shadow-lg shadow-emerald-500/20"
            >
              <Text className="text-[#0A0A0A] font-bold text-[14px] mr-2">Auditar Vouchers</Text>
              <Ionicons name="arrow-forward" size={18} color="#0A0A0A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- TARJETA: GESTIÓN DE LOCALES --- */}
        <View className="px-6 mt-6">
          <TouchableOpacity 
            onPress={() => router.push('/(admin)/manage-stores' as any)}
            className="bg-[#1C1C1E] rounded-[28px] p-6 border border-white/5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-[#3B82F6]/20 w-12 h-12 rounded-full items-center justify-center mr-4 border border-[#3B82F6]/30">
                <Ionicons name="storefront" size={22} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Gestión de Locales</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Editar, borrar y añadir tiendas</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* --- TARJETA: GESTIÓN DE CITAS --- */}
        <View className="px-6 mt-4">
          <TouchableOpacity 
            onPress={() => router.push('/(admin)/manage-appointments' as any)}
            className="bg-[#1C1C1E] rounded-[28px] p-6 border border-white/5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-[#F97316]/20 w-12 h-12 rounded-full items-center justify-center mr-4 border border-[#F97316]/30">
                <Ionicons name="calendar" size={22} color="#F97316" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Aprobación de Citas</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Revisar solicitudes de visitas</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#F97316" />
          </TouchableOpacity>
        </View>

        {/* --- TARJETA: GESTIÓN DE CONTRATOS --- */}
        <View className="px-6 mt-4">
          <TouchableOpacity 
            onPress={() => router.push('/(admin)/manage-contracts' as any)}
            className="bg-[#1C1C1E] rounded-[28px] p-6 border border-white/5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-[#10B981]/20 w-12 h-12 rounded-full items-center justify-center mr-4 border border-[#10B981]/30">
                <Ionicons name="document-attach" size={22} color="#10B981" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">Subir Contratos PDF</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Vincular documentos legales a locales</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
