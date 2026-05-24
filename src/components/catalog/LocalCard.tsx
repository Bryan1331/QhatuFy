import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LocalModel } from '../../services/catalogService';

export const LocalCard = ({ local }: { local: LocalModel }) => {
  const router = useRouter();
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/(private)/store-detail?id=${local.id}` as any)}
      className="bg-[#151517] rounded-[32px] overflow-hidden mb-6 border border-white/5 shadow-lg"
      activeOpacity={0.8}
    >
      <View className="relative">
        <Image source={{ uri: local.imagen_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' }} className="w-full h-44 opacity-80" />
        <View className="absolute top-4 left-4 bg-[#3B82F6] px-3 py-1.5 rounded-full shadow-sm">
          <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Disponible</Text>
        </View>
      </View>
      <View className="p-6">
        <Text className="text-white text-2xl font-bold mb-1 tracking-tight">{local.nombre}</Text>
        <Text className="text-gray-400 text-sm mb-5">{local.ubicacion || 'Ubicación pendiente'}</Text>
        
        <View className="flex-row justify-between items-end bg-[#0A0A0A] p-4 rounded-2xl border border-white/5">
          <View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Precio sugerido</Text>
            <Text className="text-white text-lg font-bold">
              S/ {local.precio?.toLocaleString() || '0'} <Text className="text-gray-500 text-xs font-normal">/ mes</Text>
            </Text>
          </View>
          <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-full">
            <Ionicons name="expand-outline" size={14} color="#9CA3AF" />
            <Text className="text-gray-300 text-xs ml-1.5 font-medium">{local.dimensiones || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
