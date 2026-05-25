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

  // 1. Extraer las URLs dividiendo el string por comas
  const documentImages = item.foto_dni_url ? item.foto_dni_url.split(',') : [];
  const frontImage = documentImages.length > 0 ? documentImages[0] : null;
  const backImage = documentImages.length > 1 ? documentImages[1] : null;

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

      {/* Visualizador DNI Dual (Anverso y Reverso) */}
      <View className="flex-row gap-3 mb-6">
        {/* Anverso */}
        <View className="flex-1 rounded-[20px] overflow-hidden bg-[#0A0A0A] border border-white/5 relative h-32">
          {frontImage ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(frontImage)} className="w-full h-full">
              <Image 
                source={{ uri: frontImage }} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={300}
              />
              <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="scan-outline" size={10} color="#D1D5DB" />
                <Text className="text-gray-300 text-[8px] font-bold ml-1">Anverso</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="image-outline" size={24} color="#333" />
              <Text className="text-gray-600 text-[10px] mt-1">Sin Anverso</Text>
            </View>
          )}
        </View>

        {/* Reverso */}
        <View className="flex-1 rounded-[20px] overflow-hidden bg-[#0A0A0A] border border-white/5 relative h-32">
          {backImage ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(backImage)} className="w-full h-full">
              <Image 
                source={{ uri: backImage }} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={300}
              />
              <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="barcode-outline" size={10} color="#D1D5DB" />
                <Text className="text-gray-300 text-[8px] font-bold ml-1">Reverso</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="image-outline" size={24} color="#333" />
              <Text className="text-gray-600 text-[10px] mt-1">Sin Reverso</Text>
            </View>
          )}
        </View>
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
