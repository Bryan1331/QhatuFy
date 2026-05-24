import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Image, Linking, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentCard } from '../../components/dashboard/PaymentCard';
import { initLocalDb } from '../../services/localDb';
import { getLocalActiveContract, getLocalPayments, getLocalAppointments, syncTenantData } from '../../services/syncService';
import { authAtom } from '../../store/authAtom';
import { PaymentRequirement } from '../../types/payment';

/**
 * Pantalla principal del inquilino (Dashboard).
 */
export default function DashboardScreen() {
  const router = useRouter();
  const [auth, setAuth] = useAtom(authAtom);
  const userName = auth.user?.nombre || 'Alejandro';

  const handleLogout = () => {
    setAuth({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const [payments, setPayments] = useState<PaymentRequirement[]>([]);
  const [contractInfo, setContractInfo] = useState<{ activeCount: number, contractData: any }>({ activeCount: 0, contractData: null });
  const [tieneCitaAprobada, setTieneCitaAprobada] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!auth.user?.id) return;
      await initLocalDb();

      const cachedPayments = await getLocalPayments();
      const cachedContract = await getLocalActiveContract();
      const cachedCitas = await getLocalAppointments();
      setPayments(cachedPayments);
      setContractInfo(cachedContract);
      setTieneCitaAprobada(cachedCitas.some((c: any) => c.estado === 'APROBADO' || c.estado === 'ATENDIDA'));

      const syncSuccess = await syncTenantData(auth.user.id);
      if (syncSuccess) {
        const updatedPayments = await getLocalPayments();
        const updatedContract = await getLocalActiveContract();
        const updatedCitas = await getLocalAppointments();
        setPayments(updatedPayments);
        setContractInfo(updatedContract);
        setTieneCitaAprobada(updatedCitas.some((c: any) => c.estado === 'APROBADO' || c.estado === 'ATENDIDA'));
      }
    };
    loadDashboardData();
  }, [auth.user?.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D0D', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* ScrollView principal */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header Premium */}
        <View className="flex-row items-center justify-between mt-4 mb-10">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={() => router.push('/(private)/profile' as any)} 
              className="relative mr-3"
            >
              <View className="w-12 h-12 rounded-full bg-[#1A253A] border-2 border-white/10 items-center justify-center">
                <Ionicons name="person" size={24} color="#5C8FFB" />
              </View>
              {auth.user?.verificacion_status === 'aprobado' && (
                <View className="absolute bottom-0 right-0 bg-[#22C55E] w-3.5 h-3.5 rounded-full border-2 border-[#0D0D0D]" />
              )}
            </TouchableOpacity>
            <View>
              <Text className="text-gray-400 text-[11px] font-bold tracking-widest uppercase mb-0.5">
                {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches'},
              </Text>
              <Text className="text-white text-base font-extrabold tracking-tight">{userName}</Text>
            </View>
          </View>

          {/* Logo y Acciones */}
          <View className="flex-row items-center justify-end">
            <Text className="text-[#5C8FFB] text-lg font-black tracking-tighter mr-4 opacity-90">
              Qhatu<Text className="text-white">Fy</Text>
            </Text>

            <View className="flex-row gap-2">
              <TouchableOpacity className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center border border-red-500/10" onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Warning: Completa tu Perfil */}
        {!auth.user?.hasCompletedProfile && auth.user?.verificacion_status !== 'rechazado' && (
          <View className="bg-[#1C130D] rounded-[20px] mb-8 border-l-4 border-[#F97316] py-4 px-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-[#F97316] w-5 h-5 rounded-full items-center justify-center mr-3">
                  <Text className="text-black text-[10px] font-extrabold pb-0.5">!</Text>
                </View>
                <Text className="text-white text-[11px] font-medium leading-4 flex-1 pr-2">
                  Completa tu perfil para agendar citas
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(auth)/complete-profile')}>
                <Text className="text-[#F97316] text-[10px] font-bold tracking-widest">COMPLETAR</Text>
              </TouchableOpacity>
            </View>
            {/* Barra de Progreso */}
            <View className="flex-row items-center h-1 mt-3 ml-8">
              <View className="w-24 h-1 bg-[#F97316] rounded-full" />
              <View className="w-12 h-1 bg-[#3A2415] rounded-full ml-1" />
            </View>
          </View>
        )}

        {/* Warning: Documentos Rechazados */}
        {auth.user?.verificacion_status === 'rechazado' && (
          <View className="bg-[#2A1111] rounded-[20px] mb-8 border-l-4 border-[#EF4444] py-5 px-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <View className="bg-[#EF4444] w-5 h-5 rounded-full items-center justify-center mr-3">
                  <Ionicons name="close" size={14} color="#FFF" />
                </View>
                <Text className="text-white text-[13px] font-bold flex-1 pr-2">
                  Tus documentos fueron rechazados.
                </Text>
              </View>
            </View>
            <Text className="text-gray-300 text-xs mb-4 ml-8 leading-5">
              La verificación de identidad ha fallado. Por favor, sube un documento válido y legible para habilitar tu cuenta.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/complete-profile')}
              className="bg-[#EF4444] rounded-full py-3 items-center justify-center shadow-lg shadow-red-500/30 ml-8"
            >
              <Text className="text-white font-bold text-xs tracking-wide">SUBIR DOCUMENTO DE NUEVO</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Estado Condicional: Pagos vs Onboarding */}
        {contractInfo.activeCount > 0 ? (
          <View className="mb-8">
            <PaymentCard payments={payments} />
          </View>
        ) : (
          <View className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5 mb-8 shadow-lg">
            <Text className="text-white text-lg font-bold mb-1">Tu camino en QhatuFy</Text>
            <Text className="text-gray-400 text-xs mb-5">Completa estos pasos para alquilar tu primer local.</Text>

            <View className="space-y-4">
              {/* Paso 1: Perfil (Check si ya lo completó) */}
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${auth.user?.hasCompletedProfile ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                  <Ionicons name={auth.user?.hasCompletedProfile ? "checkmark" : "person"} size={16} color={auth.user?.hasCompletedProfile ? "#22C55E" : "#3B82F6"} />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${auth.user?.hasCompletedProfile ? 'text-gray-500 line-through' : 'text-white'}`}>Completa tu perfil</Text>
                </View>
              </View>

              {/* Línea conectora */}
              <View className="w-0.5 h-4 bg-white/10 ml-4 my-1" />

              {/* Paso 2: Verificación KYC */}
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${auth.user?.verificacion_status === 'aprobado' ? 'bg-green-500/20' : 'bg-white/5'}`}>
                  <Ionicons name={auth.user?.verificacion_status === 'aprobado' ? "checkmark" : "shield-checkmark"} size={16} color={auth.user?.verificacion_status === 'aprobado' ? "#22C55E" : "#9CA3AF"} />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${auth.user?.verificacion_status === 'aprobado' ? 'text-gray-500 line-through' : 'text-gray-300'}`}>Verifica tu identidad</Text>
                </View>
              </View>

              {/* Línea conectora */}
              <View className="w-0.5 h-4 bg-white/10 ml-4 my-1" />

              {/* Paso 3: Agendar Cita (Dinamizado) */}
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${tieneCitaAprobada ? 'bg-green-500/20' : 'bg-white/5'}`}>
                  <Ionicons name={tieneCitaAprobada ? "checkmark" : "calendar"} size={16} color={tieneCitaAprobada ? "#22C55E" : "#9CA3AF"} />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${tieneCitaAprobada ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                    Solicita una cita
                  </Text>
                </View>
              </View>
            </View>

            {!auth.user?.hasCompletedProfile && (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/complete-profile')}
                className="mt-6 bg-[#3B82F6] rounded-full py-3 items-center justify-center"
              >
                <Text className="text-white font-bold text-sm">Continuar Paso 1</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sección: Gestión Rápida */}
        <Text className="text-gray-400 text-[10px] font-bold tracking-widest mb-4">GESTIÓN RÁPIDA</Text>
        <View className="flex-row flex-wrap justify-between pr-0">

          {/* Card 1: Mis Contratos */}
          <TouchableOpacity
            onPress={() => router.push('/(private)/my-contracts')}
            className="w-[48%] bg-[#151517] p-5 rounded-[28px] mb-4 border border-white/5"
          >
            <View className="w-10 h-10 rounded-full bg-[#1A253A] items-center justify-center mb-4">
              <Ionicons name="document-text" size={18} color="#5C8FFB" />
            </View>
            <Text className="text-white font-bold text-sm mb-1 leading-tight">Mis{'\n'}Contratos</Text>
            <Text className="text-gray-500 text-[10px] mt-1 pr-2">{contractInfo.activeCount} Activos</Text>
          </TouchableOpacity>

          {/* Card 2: Reporte WhatsApp */}
          <TouchableOpacity
            className="w-[48%] bg-[#151517] p-5 rounded-[28px] mb-4 border border-white/5"
            onPress={() => Linking.openURL('https://wa.me/51999999999?text=Hola%20Administracion%20de%20QhatuFy')}
          >
            <View className="w-10 h-10 rounded-full bg-[#1A2E22] items-center justify-center mb-4">
              <Ionicons name="chatbubble-ellipses" size={18} color="#22C55E" />
            </View>
            <Text className="text-white font-bold text-sm mb-1 leading-tight">Reporte{'\n'}WhatsApp</Text>
            <Text className="text-gray-500 text-[10px] mt-1 pr-2">Atención inmediata</Text>
          </TouchableOpacity>

          {/* Card 3: Reglamento */}
          <TouchableOpacity
            onPress={() => router.push('/(private)/rules')}
            className="w-[48%] bg-[#151517] p-5 rounded-[28px] mb-4 border border-white/5"
          >
            <View className="w-10 h-10 rounded-full bg-[#3B281B] items-center justify-center mb-4">
              <Ionicons name="document-lock" size={18} color="#F97316" />
            </View>
            <Text className="text-white font-bold text-sm mb-1 leading-tight">Reglamento</Text>
            <Text className="text-gray-500 text-[10px] mt-1 pr-2">Normas de{'\n'}convivencia</Text>
          </TouchableOpacity>

          {/* Card 4: Soporte */}
          <TouchableOpacity
            className="w-[48%] bg-[#151517] p-5 rounded-[28px] mb-4 border border-white/5"
            onPress={() => Linking.openURL('mailto:soporte@qhatufy.com?subject=Soporte%20Inquilino')}
          >
            <View className="w-10 h-10 rounded-full bg-[#20223A] items-center justify-center mb-4">
              <Ionicons name="headset" size={18} color="#818CF8" />
            </View>
            <Text className="text-white font-bold text-sm mb-1 leading-tight">Soporte</Text>
            <Text className="text-gray-500 text-[10px] mt-1">Centro de ayuda</Text>
          </TouchableOpacity>

        </View>

        {/* Sección: Portafolio de Tiendas Vigentes */}
        <Text className="text-gray-400 text-[10px] font-bold tracking-widest mb-4 mt-4 uppercase">Tus Tiendas Activas</Text>
        {contractInfo.contractData && contractInfo.contractData.length > 0 ? (
          contractInfo.contractData.map((tienda: any, index: number) => (
            <View key={tienda.id || index} className="bg-[#121212] rounded-[32px] overflow-hidden mb-5 border border-white/5">
              <Image
                source={{ uri: tienda.imagen_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' }}
                className="w-full h-40 opacity-90"
              />
              <View className="p-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-sm shadow-green-500" />
                  <Text className="text-white/70 text-[9px] font-bold tracking-widest uppercase mt-0.5">CONTRATO VIGENTE</Text>
                </View>

                <Text className="text-white text-xl font-bold mb-3 tracking-tight">{tienda.nombre || 'Local Comercial'}</Text>
                <Text className="text-gray-400 text-xs mb-6 leading-5">
                  Disfruta de tu estancia. Recuerda mantener tus pagos al día para evitar penalidades.
                </Text>

                <View className="flex-row space-x-3">
                  <View className="bg-white/5 px-4 py-2 rounded-full flex-row items-center">
                    <Ionicons name="location-outline" size={12} color="#9CA3AF" className="mr-1" />
                    <Text className="text-gray-300 text-[10px] font-medium ml-1">{tienda.ubicacion || 'Ubicación Pendiente'}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-[#121212] rounded-[32px] p-6 mb-4 border border-white/5 items-center relative overflow-hidden">
            {/* Fondo sutil */}
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

            <View className="w-16 h-16 rounded-full bg-blue-500/20 items-center justify-center mb-4 mt-2 border border-blue-500/30">
              <Ionicons name="storefront" size={28} color="#3B82F6" />
            </View>
            <Text className="text-white text-xl font-bold mb-2 text-center tracking-tight">Tu negocio merece{'\n'}el mejor espacio</Text>
            <Text className="text-gray-400 text-xs text-center mb-6 leading-5 px-4">
              Explora nuestro catálogo de locales comerciales y da el primer paso hacia el éxito de tu empresa.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(private)/catalog')}
              className="bg-white/10 w-full py-4 rounded-full flex-row items-center justify-center border border-white/10"
            >
              <Text className="text-white font-bold text-sm mr-2">Explorar Catálogo</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
