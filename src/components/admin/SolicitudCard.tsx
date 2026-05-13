import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../store/authAtom';

interface SolicitudCardProps {
  item: UserProfile;
  processingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onImagePress: (url: string) => void;
}

export function SolicitudCard({ item, processingId, onApprove, onReject, onImagePress }: SolicitudCardProps) {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View className="bg-[#1C1C1E] p-6 rounded-[32px] mb-5">
      {/* Header Usuario */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-[#2A2A2E] items-center justify-center mr-4">
            <Text className="text-gray-300 font-bold text-sm tracking-widest">{getInitials(item.nombre)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-[17px] font-bold tracking-tight mb-1">{item.nombre || 'Usuario sin nombre'}</Text>
            <View className="flex-row items-center">
              <Ionicons name="mail-outline" size={12} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs ml-1.5">{item.email}</Text>
            </View>
          </View>
        </View>
        <View className="bg-white/10 px-3 py-1.5 rounded-full ml-2">
          <Text className="text-gray-300 text-[9px] font-bold tracking-widest">NUEVO</Text>
        </View>
      </View>

      {/* Sección Datos */}
      <View className="mb-6 space-y-4">
        <View>
          <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">DNI / RUC</Text>
          <Text className="text-white text-sm font-medium">{item.dni || 'No proporcionado'}</Text>
        </View>
        <View>
          <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">CELULAR</Text>
          <Text className="text-white text-sm font-medium">{item.celular || 'No proporcionado'}</Text>
        </View>
        <View>
          <Text className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">DIRECCIÓN</Text>
          <Text className="text-white text-sm font-medium pr-4 leading-5">{item.direccion || 'No proporcionada'}</Text>
        </View>
      </View>

      {/* Visualizador DNI */}
      <View className="w-full rounded-[20px] overflow-hidden mb-6 bg-[#0A0A0A] border border-white/5 relative">
        {item.foto_dni_url ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(item.foto_dni_url!)}>
            <Image 
              source={{ uri: item.foto_dni_url }} 
              style={{ width: '100%', height: 200 }}
              contentFit="cover"
              transition={300}
            />
            {/* Badge flotante DNI Frontal */}
            <View className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 rounded-full flex-row items-center backdrop-blur-md">
              <Ionicons name="image-outline" size={12} color="#D1D5DB" />
              <Text className="text-gray-300 text-[10px] font-bold ml-1.5">DNI Frontal</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View className="w-full h-[200px] items-center justify-center">
            <Ionicons name="image-outline" size={32} color="#333" />
            <Text className="text-gray-600 text-xs mt-2">Sin imagen provista</Text>
          </View>
        )}
      </View>

      {/* Acciones */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 bg-[#222224] border border-white/10 py-4 rounded-full flex-row justify-center items-center active:bg-white/5"
          disabled={processingId === item.id}
          onPress={() => onReject(item.id)}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="close" size={16} color="#FFF" />
              <Text className="text-white font-medium text-sm ml-2">Rechazar</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 bg-[#5C8FFB] py-4 rounded-full flex-row justify-center items-center active:bg-blue-600"
          disabled={processingId === item.id}
          onPress={() => onApprove(item.id)}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Ionicons name="checkmark" size={16} color="#000" />
              <Text className="text-[#0A0A0A] font-bold text-sm ml-2">Aprobar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
