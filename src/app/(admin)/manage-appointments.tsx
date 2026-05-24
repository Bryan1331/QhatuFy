import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';

export default function ManageAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Cargar citas PENDIENTES y APROBADAS
      const { data: citas, error: errCitas } = await supabase
        .from('citas')
        .select('*, locales(*)')
        .in('estado', ['PENDIENTE', 'APROBADO'])
        .order('created_at', { ascending: true });

      if (errCitas) throw errCitas;
      setAppointments(citas || []);

      // 2. CORRECCIÓN: Cargar inquilinos desde la tabla 'perfiles' (o 'usuarios' según tu esquema)
      // Ajusta el nombre de la tabla a 'perfiles' si 'usuarios' te da vacio
      const { data: users, error: errUsers } = await supabase
        .from('perfiles')
        .select('id, nombre, email, verificacion_status');

      if (!errUsers && users) setInquilinos(users);

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'APROBADO' | 'RECHAZADO' | 'ATENDIDA') => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: newStatus })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('¡Éxito!', `Solicitud actualizada a: ${newStatus.toLowerCase()}.`);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Control de Citas</Text>
        <TouchableOpacity onPress={loadData} className="p-2 -mr-2 rounded-full bg-white/5">
          <Ionicons name="refresh" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#F97316" className="mt-10" />
        ) : appointments.length === 0 ? (
          <View className="items-center justify-center mt-10 py-12 bg-[#1C1C1E] rounded-3xl border border-white/5">
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#6B7280" className="mb-4" />
            <Text className="text-gray-400 text-center font-medium">No hay citas activas por revisar.</Text>
          </View>
        ) : (
          appointments.map((cita) => (
            <View key={cita.id} className="bg-[#1C1C1E] rounded-[32px] p-5 mb-5 border border-white/5">
              <View className="flex-row items-center mb-4">
                <Image
                  source={{ uri: cita.locales?.imagen_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=300' }}
                  className="w-16 h-16 rounded-2xl mr-4"
                />
                <View className="flex-1">
                  <Text className="text-white font-bold text-base tracking-tight">{cita.locales?.nombre}</Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    <Ionicons name="time-outline" size={12} /> {formatDate(cita.fecha_hora)}
                  </Text>
                  <View className="mt-2 self-start">
                    <Text className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cita.estado === 'APROBADO' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {cita.estado}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Botones Dinámicos según el estado de la cita */}
              <View className="flex-row gap-3 mt-2 pt-4 border-t border-white/5">
                {cita.estado === 'PENDIENTE' ? (
                  <>
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(cita.id, 'RECHAZADO')}
                      className="flex-1 bg-red-500/10 py-3.5 rounded-2xl items-center border border-red-500/20"
                    >
                      <Text className="text-red-500 font-bold text-sm">Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(cita.id, 'APROBADO')}
                      className="flex-1 bg-green-500/20 py-3.5 rounded-2xl items-center border border-green-500/30"
                    >
                      <Text className="text-green-500 font-bold text-sm">Aprobar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Si ya está aprobada, el administrador puede dar el cierre
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(cita.id, 'ATENDIDA')}
                    className="w-full bg-blue-500/20 py-3.5 rounded-2xl items-center border border-blue-500/30 flex-row justify-center gap-2"
                  >
                    <Ionicons name="checkbox-outline" size={16} color="#3B82F6" />
                    <Text className="text-[#3B82F6] font-bold text-sm">Marcar como Atendida (Concluida)</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
