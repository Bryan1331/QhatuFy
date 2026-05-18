import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LocalCard } from '../../components/catalog/LocalCard';
import { getAvailableLocales, LocalModel } from '../../services/catalogService';

export default function CatalogScreen() {
  const [locales, setLocales] = useState<LocalModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocales = async () => {
      setIsLoading(true);
      const data = await getAvailableLocales();
      setLocales(data);
      setIsLoading(false);
    };
    loadLocales();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Superior Pequeño */}
        <View className="flex-row justify-between items-center mb-6">
          <Ionicons name="search" size={24} color="#FFF" />
          <Text className="text-blue-400 font-bold text-lg tracking-widest">QhatuFy</Text>
          <Ionicons name="options-outline" size={24} color="#FFF" />
        </View>

        <Text className="text-white text-4xl font-extrabold mb-6 tracking-tight">Explorar Locales</Text>

        {/* Buscador */}
        <View className="flex-row mb-6 gap-3">
          <View className="flex-1 bg-[#1C1C1E] rounded-full flex-row items-center px-4 h-14 border border-white/5">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput 
              placeholder="Buscar por nombre o sector..." 
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-white ml-2 h-full"
            />
          </View>
          <TouchableOpacity className="bg-[#1C1C1E] h-14 w-14 rounded-full items-center justify-center border border-white/5">
            <Ionicons name="filter" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Filtros (Chips) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8" contentContainerStyle={{ gap: 10 }}>
          {['Todos', 'Tecnología', 'Ropa', 'Comida'].map((item, index) => (
            <TouchableOpacity key={item} className={`px-6 py-2.5 rounded-full border border-white/5 ${index === 0 ? 'bg-white/10' : 'bg-[#1C1C1E]'}`}>
              <Text className={`text-sm font-medium ${index === 0 ? 'text-white' : 'text-gray-400'}`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grilla de Resultados */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
        ) : locales.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10">No hay locales disponibles en este momento.</Text>
        ) : (
          locales.map(local => <LocalCard key={local.id} local={local} />)
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
