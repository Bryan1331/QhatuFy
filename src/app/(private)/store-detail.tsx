import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocalById, LocalModel } from '../../services/catalogService';
import { supabase } from '../../services/supabase';
import { syncTenantData } from '../../services/syncService';
import { authAtom } from '../../store/authAtom';

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [local, setLocal] = useState<LocalModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auth] = useAtom(authAtom);

  useEffect(() => {
    const fetchLocal = async () => {
      if (id) {
        const data = await getLocalById(id as string);
        setLocal(data);
      }
      setIsLoading(false);
    };
    fetchLocal();
  }, [id]);

  const handleSolicitarCita = async () => {
    if (!auth.user?.id || !local?.id) return;

    setIsLoading(true);

    try {
      // Verificar si ya existe una cita pendiente o aprobada para este local
      const { data: existente, error: errCheck } = await supabase
        .from('citas')
        .select('id')
        .eq('inquilino_id', auth.user.id)
        .eq('local_id', local.id)
        .in('estado', ['PENDIENTE', 'APROBADO']);

      if (existente && existente.length > 0) {
        Alert.alert('Solicitud Duplicada', 'Ya tienes una cita programada o pendiente para este local. No es posible solicitar otra.');
        setIsLoading(false);
        return;
      }

      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);

      const { error } = await supabase.from('citas').insert([
        { inquilino_id: auth.user.id, local_id: local.id, fecha_hora: mañana.toISOString() }
      ]);

      if (!error) {
        // Sincronizar datos locales de forma inmediata
        await syncTenantData(auth.user.id);

        setIsLoading(false);
        Alert.alert('¡Cita Solicitada!', 'Tu solicitud está pendiente de aprobación por el administrador.', [
          { text: 'Ir a mis visitas', onPress: () => router.push('/(private)/appointments') }
        ]);
      } else {
        throw error;
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo procesar tu solicitud en este momento.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <SafeAreaView className="flex-1 bg-[#0A0A0A] justify-center items-center"><ActivityIndicator size="large" color="#3B82F6" /></SafeAreaView>;
  if (!local) return <SafeAreaView className="flex-1 bg-[#0A0A0A] justify-center items-center"><Text className="text-white">Local no encontrado</Text></SafeAreaView>;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A] p-0" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header Image */}
        <View className="relative w-full h-72">
          <Image source={{ uri: local.imagen_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' }} className="w-full h-full opacity-80" />
          <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md">
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <View className="absolute bottom-4 left-4 bg-[#F97316] px-4 py-1.5 rounded-full">
            <Text className="text-black text-xs font-bold tracking-widest uppercase">Disponible</Text>
          </View>
        </View>

        {/* Info Body */}
        <View className="px-6 pt-6">
          <Text className="text-white text-3xl font-extrabold tracking-tight mb-2">{local.nombre}</Text>

          <View className="flex-row items-center mb-6">
            <Ionicons name="location" size={16} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm ml-1.5">{local.ubicacion || 'Ubicación no especificada'}</Text>
          </View>

          {/* Price & Size Cards */}
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-[#1C1C1E] p-4 rounded-3xl border border-white/5">
              <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Inversión Mensual</Text>
              <Text className="text-blue-400 text-2xl font-bold">S/ {local.precio}</Text>
            </View>
            <View className="flex-1 bg-[#1C1C1E] p-4 rounded-3xl border border-white/5">
              <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Dimensiones</Text>
              <Text className="text-white text-2xl font-bold">{local.dimensiones || 'N/A'}</Text>
            </View>
          </View>

          {/* Conditional Description */}
          {local.descripcion && local.descripcion.trim().length > 0 && (
            <View className="mb-8">
              <Text className="text-white text-lg font-bold mb-3">Sobre este local</Text>
              <Text className="text-gray-400 leading-6 text-sm">{local.descripcion}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 w-full px-6 py-5 bg-[#0A0A0A]/90 border-t border-white/5 backdrop-blur-xl">
        <TouchableOpacity
          onPress={handleSolicitarCita}
          className="bg-[#3B82F6] w-full py-4 rounded-full flex-row items-center justify-center shadow-lg shadow-blue-500/20"
        >
          <Ionicons name="calendar" size={20} color="#FFF" />
          <Text className="text-white font-bold text-lg ml-2">Solicitar Cita</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
