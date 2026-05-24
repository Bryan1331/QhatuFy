import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LocalCard } from '../../components/catalog/LocalCard';
import { getAvailableLocales, LocalModel } from '../../services/catalogService';
import { supabase } from '../../services/supabase';

type FilterType = 'Todos' | 'Menor Precio' | 'Mayor Precio' | 'Dimensiones' | 'Piso';

export default function CatalogScreen() {
  const [locales, setLocales] = useState<LocalModel[]>([]);
  const [filteredLocales, setFilteredLocales] = useState<LocalModel[]>([]);
  const [rentedIds, setRentedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadLocales = async () => {
      setIsLoading(true);
      const data = await getAvailableLocales();
      
      // Obtener locales ocupados
      const { data: activeContracts } = await supabase.from('contratos').select('local_id').eq('estado', 'activo');
      if (activeContracts) setRentedIds(activeContracts.map(c => c.local_id));

      setLocales(data);
      setFilteredLocales(data);
      setIsLoading(false);
    };
    loadLocales();
  }, []);

  useEffect(() => {
    let result = [...locales];
    
    if (searchQuery) {
      result = result.filter(l => l.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || l.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (activeFilter === 'Menor Precio') result.sort((a, b) => (a.precio || 0) - (b.precio || 0));
    if (activeFilter === 'Mayor Precio') result.sort((a, b) => (b.precio || 0) - (a.precio || 0));
    if (activeFilter === 'Dimensiones') result.sort((a, b) => (b.dimensiones || '').localeCompare(a.dimensiones || ''));
    if (activeFilter === 'Piso') result.sort((a, b) => (a.ubicacion || '').localeCompare(b.ubicacion || ''));

    setFilteredLocales(result);
  }, [searchQuery, activeFilter, locales]);

  const filterOptions: FilterType[] = ['Todos', 'Menor Precio', 'Mayor Precio', 'Dimensiones', 'Piso'];

  const selectFilter = (item: FilterType) => {
    setActiveFilter(item);
    setIsFilterOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mb-8 mt-2">
          <Text className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-1">Catálogo</Text>
          <Text className="text-white text-4xl font-extrabold tracking-tight">Explorar Locales</Text>
        </View>

        {/* Buscador y Botón de Filtro */}
        <View className="flex-row mb-4 gap-3 z-20">
          <View className="flex-1 bg-[#151517] rounded-2xl flex-row items-center px-4 h-14 border border-white/5">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput 
              placeholder="Buscar local or piso..." 
              placeholderTextColor="#6B7280"
              className="flex-1 text-white ml-3 h-full text-base"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            onPress={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-14 px-5 rounded-2xl items-center justify-center border flex-row gap-2 ${isFilterOpen ? 'bg-[#3B82F6]/20 border-[#3B82F6]/30' : 'bg-[#151517] border-white/5'}`}
          >
            <Ionicons name="filter" size={20} color={isFilterOpen ? "#3B82F6" : "#FFF"} />
            <Ionicons name={isFilterOpen ? "chevron-up" : "chevron-down"} size={16} color={isFilterOpen ? "#3B82F6" : "#6B7280"} />
          </TouchableOpacity>
        </View>

        {/* Menú Desplegable de Filtros */}
        {isFilterOpen && (
          <View className="bg-[#151517] rounded-2xl p-2 mb-6 border border-white/5">
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider ml-3 mb-2 mt-2">Ordenar por</Text>
            {filterOptions.map((item) => (
              <TouchableOpacity 
                key={item} 
                onPress={() => selectFilter(item)}
                className={`px-4 py-3 rounded-xl flex-row justify-between items-center ${activeFilter === item ? 'bg-white/5' : ''}`}
              >
                <Text className={`text-sm ${activeFilter === item ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>{item}</Text>
                {activeFilter === item && <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Etiqueta de resultados */}
        <View className="flex-row justify-between items-end mb-6 mt-2">
          <Text className="text-white text-lg font-bold">Disponibles</Text>
          <Text className="text-gray-500 text-sm">{filteredLocales.length} locales</Text>
        </View>

        {/* Grilla de Resultados */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
        ) : filteredLocales.length === 0 ? (
          <View className="items-center justify-center mt-10 py-10 bg-[#151517] rounded-3xl border border-white/5">
            <Ionicons name="search-outline" size={48} color="#374151" className="mb-4" />
            <Text className="text-gray-400 text-center font-medium">No se encontraron locales.</Text>
          </View>
        ) : (
          filteredLocales.map(local => {
            const isRented = rentedIds.includes(local.id);
            return (
              <View key={local.id} className="relative mb-4">
                <View style={{ opacity: isRented ? 0.4 : 1 }} pointerEvents={isRented ? 'none' : 'auto'}>
                  <LocalCard local={local} />
                </View>
                {isRented && (
                  <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/90 px-5 py-2 rounded-full z-10 shadow-xl shadow-red-500/20">
                    <Text className="text-white font-bold tracking-widest text-xs uppercase">No Disponible</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
