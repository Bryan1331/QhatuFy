import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocalModel } from '../../services/catalogService';

export const LocalCard = ({ local }: { local: LocalModel }) => (
  <TouchableOpacity className="bg-[#1C1C1E] rounded-[32px] overflow-hidden mb-6 border border-white/5">
    <View className="relative">
      <Image 
        source={{ uri: local.imagen_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' }} 
        className="w-full h-40 opacity-90" 
      />
      <View className="absolute top-3 left-3 bg-[#F97316] px-3 py-1 rounded-full">
        <Text className="text-black text-[10px] font-bold tracking-wide">Disponible</Text>
      </View>
    </View>
    <View className="p-5">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-white text-xl font-bold">{local.nombre}</Text>
        <Ionicons name="bookmark-outline" size={20} color="#9CA3AF" />
      </View>
      <Text className="text-gray-400 text-xs mb-4">{local.ubicacion || 'Ubicación pendiente'}</Text>
      <Text className="text-gray-500 text-[10px] mb-1">Precio sugerido</Text>
      <View className="flex-row justify-between items-end">
        <Text className="text-blue-400 text-lg font-bold">
          S/ {local.precio?.toLocaleString() || '0'} <Text className="text-gray-400 text-xs font-normal">/ mes</Text>
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="expand-outline" size={12} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1">{local.dimensiones || 'N/A'}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
