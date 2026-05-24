import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocalActiveContract } from '../../services/syncService';

export default function MyContractsScreen() {
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getLocalActiveContract();
      setContract(data.contractData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.push('/(private)' as any)} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Mis Contratos</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
        ) : contract && contract.length > 0 ? (
          contract.map((item: any) => (
            <View key={item.id} className="bg-[#151517] rounded-3xl p-6 mb-6 border border-white/5">
              <View className="flex-row items-center justify-between mb-4">
                <View className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  <Text className="text-green-500 text-[10px] font-bold uppercase tracking-widest">Activo</Text>
                </View>
                <Ionicons name="document-text" size={24} color="#3B82F6" />
              </View>
              <Text className="text-white text-2xl font-bold mb-1">{item.nombre}</Text>
              <Text className="text-gray-400 text-sm mb-6">{item.ubicacion}</Text>

              {item.documento_url && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(item.documento_url).catch(() => Alert.alert('Error', 'No se pudo abrir.'))}
                  className="mt-6 bg-[#3B82F6] rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-blue-500/10"
                >
                  <Ionicons name="document-attach-outline" size={20} color="#FFF" />
                  <Text className="text-white font-bold text-sm ml-2">Ver Contrato Oficial (PDF)</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View className="items-center justify-center mt-10 py-10 bg-[#151517] rounded-3xl border border-white/5">
            <Ionicons name="folder-open-outline" size={48} color="#374151" className="mb-4" />
            <Text className="text-white text-lg font-bold mb-2">No tienes contratos</Text>
            <Text className="text-gray-400 text-center font-medium px-6">Actualmente no cuentas con ningún contrato activo.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
