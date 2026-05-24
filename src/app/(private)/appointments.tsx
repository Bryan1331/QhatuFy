import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocalAppointments } from '../../services/syncService';
import { authAtom } from '../../store/authAtom';

export default function AppointmentsScreen() {
  const router = useRouter();
  const [auth] = useAtom(authAtom);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDIENTE' | 'APROBADO'>('PENDIENTE');

  // Recargar citas cuando la pantalla gana el foco
  useFocusEffect(
    useCallback(() => {
      const loadAppointments = async () => {
        setIsLoading(true);
        const data = await getLocalAppointments();
        setAppointments(data);
        setIsLoading(false);
      };
      loadAppointments();
    }, [])
  );

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      const diaSemana = dias[date.getDay()];
      const diaMes = date.getDate();
      const mes = meses[date.getMonth()];

      let horas = date.getHours();
      const minutos = date.getMinutes().toString().padStart(2, '0');
      const ampm = horas >= 12 ? 'PM' : 'AM';
      horas = horas % 12;
      horas = horas ? horas : 12;

      return `${diaSemana}, ${diaMes} ${mes} • ${horas}:${minutos} ${ampm}`;
    } catch (error) {
      return isoString;
    }
  };

  if (auth.user?.verificacion_status !== 'aprobado') {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-[#151517] items-center justify-center mb-6 border border-white/5 shadow-2xl">
          <Ionicons name="lock-closed" size={40} color="#6B7280" />
        </View>
        <Text className="text-white text-2xl font-bold text-center mb-3 tracking-tight">Acceso Restringido</Text>
        <Text className="text-gray-400 text-center mb-8 leading-6 text-sm">
          Por seguridad de nuestra comunidad y de los propietarios, necesitas verificar tu identidad (KYC) antes de agendar visitas a los locales.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/complete-profile')}
          className="bg-[#3B82F6] w-full py-4 rounded-full flex-row items-center justify-center shadow-lg shadow-blue-500/20"
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#FFF" />
          <Text className="text-white font-bold text-base ml-2">Verificar Identidad Ahora</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Separar por estados para el pipeline
  const pendientes = appointments.filter((a) => a.estado === 'PENDIENTE');
  const aprobadas = appointments.filter((a) => a.estado === 'APROBADO');
  const displayedAppointments = activeTab === 'PENDIENTE' ? pendientes : aprobadas;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0A0A] justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-8">
          <Text className="text-white text-3xl font-extrabold tracking-tight">Mis Visitas</Text>
        </View>

        {/* Selector de Pestañas (Segmented Tabs) */}
        <View className="flex-row bg-[#151517] rounded-full p-1.5 mb-8 border border-white/5">
          <TouchableOpacity
            onPress={() => setActiveTab('PENDIENTE')}
            className={`flex-1 py-3 rounded-full items-center ${activeTab === 'PENDIENTE' ? 'bg-[#2C2C2E]' : ''
              }`}
          >
            <Text
              className={`font-bold text-sm ${activeTab === 'PENDIENTE' ? 'text-white' : 'text-gray-400'
                }`}
            >
              Pendientes ({pendientes.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('APROBADO')}
            className={`flex-1 py-3 rounded-full items-center ${activeTab === 'APROBADO' ? 'bg-[#2C2C2E]' : ''
              }`}
          >
            <Text
              className={`font-bold text-sm ${activeTab === 'APROBADO' ? 'text-white' : 'text-gray-400'
                }`}
            >
              Aprobadas ({aprobadas.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Citas */}
        {displayedAppointments.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="map-outline" size={48} color="#374151" className="mb-4" />
            <Text className="text-white text-lg font-bold mb-2">No tienes citas programadas</Text>
            <Text className="text-gray-400 text-center text-sm px-4 leading-5">
              Cuando solicites visitar un local desde el catálogo, aparecerá aquí para su seguimiento.
            </Text>
          </View>
        ) : (
          displayedAppointments.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-[#151517] rounded-[32px] p-5 mb-4 border border-white/5 flex-row shadow-lg"
            >
              <Image
                source={{
                  uri:
                    item.local_imagen ||
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=300',
                }}
                className="w-20 h-20 rounded-2xl mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1.5 tracking-tight">
                  {item.local_nombre || 'Local'}
                </Text>
                <View className="flex-row items-center mb-4">
                  <Ionicons name="time-outline" size={14} color="#9CA3AF" className="mr-1.5" />
                  <Text className="text-gray-400 text-xs font-medium">
                    {formatDate(item.fecha_hora)}
                  </Text>
                </View>
                <View
                  className={`px-3.5 py-1 rounded-full self-start border ${item.estado === 'APROBADO'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-orange-500/10 border-orange-500/20'
                    }`}
                >
                  <Text
                    className={`text-[10px] font-bold uppercase tracking-widest ${item.estado === 'APROBADO' ? 'text-green-500' : 'text-orange-500'
                      }`}
                  >
                    {item.estado}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Botón Flotante (FAB) para crear cita */}
      <TouchableOpacity
        onPress={() => router.push('/(private)/catalog')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#3B82F6] rounded-full items-center justify-center shadow-lg shadow-blue-500/30 z-50"
      >
        <Ionicons name="add" size={30} color="#0D0D0D" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
