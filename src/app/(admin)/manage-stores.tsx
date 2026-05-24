import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAdminStores, deleteStore } from '../../services/adminService';

export default function ManageStoresScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStores = async () => {
    setIsLoading(true);
    const data = await getAdminStores();
    setStores(data);
    setIsLoading(false);
  };

  useFocusEffect(useCallback(() => { loadStores(); }, []));

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert('Eliminar Local', `¿Estás seguro que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          const success = await deleteStore(id);
          if (success) loadStores();
          else Alert.alert('Error', 'No se pudo eliminar el local.');
      }}
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Gestión de Locales</Text>
        <TouchableOpacity onPress={() => router.push('/(admin)/create-store')} className="p-2 -mr-2 rounded-full bg-[#3B82F6]/20">
          <Ionicons name="add" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
        ) : stores.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10">No hay locales registrados.</Text>
        ) : (
          stores.map(store => (
            <View key={store.id} className="bg-[#1C1C1E] rounded-2xl p-4 mb-4 flex-row items-center border border-white/5">
              <Image source={{ uri: store.imagen_url || 'https://via.placeholder.com/150' }} className="w-16 h-16 rounded-xl mr-4" />
              <View className="flex-1">
                <Text className="text-white font-bold text-base">{store.nombre}</Text>
                <Text className="text-gray-400 text-xs mt-1">S/ {store.precio}</Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => router.push(`/(admin)/create-store?id=${store.id}` as any)} className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center">
                  <Ionicons name="pencil" size={18} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(store.id, store.nombre)} className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
                  <Ionicons name="trash" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
