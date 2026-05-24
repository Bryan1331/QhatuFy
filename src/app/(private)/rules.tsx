import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RulesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A] z-10">
        {/* FORZAR NAVEGACIÓN AL DASHBOARD */}
        <TouchableOpacity onPress={() => router.push('/(private)' as any)} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Reglamento</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-8">
          <Text className="text-3xl font-extrabold text-white tracking-tight mb-2">Normas de Convivencia</Text>
          <Text className="text-gray-400 text-sm leading-6">
            Para garantizar un ambiente comercial seguro, próspero y ordenado en las instalaciones de QhatuFy, todos los inquilinos deben adherirse a las siguientes normativas:
          </Text>
        </View>

        {/* Regla 1 */}
        <View className="bg-[#151517] p-5 rounded-3xl mb-4 border border-white/5">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
              <Ionicons name="time" size={16} color="#3B82F6" />
            </View>
            <Text className="text-white font-bold text-base flex-1">1. Horarios de Operación</Text>
          </View>
          <Text className="text-gray-400 text-sm leading-6 pl-11">
            La galería estará abierta al público de Lunes a Domingo de 09:00 AM a 09:00 PM.
          </Text>
        </View>

        {/* Regla 2 */}
        <View className="bg-[#151517] p-5 rounded-3xl mb-4 border border-white/5">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center mr-3">
              <Ionicons name="cash" size={16} color="#22C55E" />
            </View>
            <Text className="text-white font-bold text-base flex-1">2. Pagos y Morosidad</Text>
          </View>
          <Text className="text-gray-400 text-sm leading-6 pl-11">
            El pago de alquiler debe realizarse en la fecha pactada al momento de firmar el contrato, en caso de que no se cumpla con dicha condición, se sumará el 15% de la mensualidad pactada por día al total de la deuda.
          </Text>
        </View>

        {/* Regla 3 */}
        <View className="bg-[#151517] p-5 rounded-3xl mb-4 border border-white/5">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center mr-3">
              <Ionicons name="construct" size={16} color="#F97316" />
            </View>
            <Text className="text-white font-bold text-base flex-1">3. Modificaciones al Local</Text>
          </View>
          <Text className="text-gray-400 text-sm leading-6 pl-11">
            Queda estrictamente prohibido realizar modificaciones estructurales (perforación de columnas, cambio de cableado principal) sin autorización previa por escrito de la administración.
          </Text>
        </View>

        {/* Regla 4 */}
        <View className="bg-[#151517] p-5 rounded-3xl mb-4 border border-white/5">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center mr-3">
              <Ionicons name="trash" size={16} color="#A855F7" />
            </View>
            <Text className="text-white font-bold text-base flex-1">4. Limpieza y Áreas Comunes</Text>
          </View>
          <Text className="text-gray-400 text-sm leading-6 pl-11">
            Cada inquilino es responsable de mantener la limpieza interna de su local. Está prohibido obstruir los pasillos con mercadería, letreros o mobiliario que impida el libre tránsito.
          </Text>
        </View>

        <View className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
          <Text className="text-gray-400 text-xs text-center">
            La administración se reserva el derecho de modificar este reglamento notificando con 15 días de anticipación. Última actualización: Mayo 2026.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
