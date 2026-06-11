import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { getPendingPayments, reviewPayment } from '../../services/adminService';

export default function VerifyPaymentsScreen() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    const data = await getPendingPayments();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAction = async (id: string, action: 'pagado' | 'rechazado') => {
    try {
      setProcessingId(id);
      await reviewPayment(id, action);
      setPayments(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center px-5 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">Auditoría de Pagos</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#10B981" size="large" className="mt-20" />
        ) : payments.length === 0 ? (
          <View className="items-center mt-20">
            <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
            <Text className="text-white text-lg font-bold mt-4">Todo al día</Text>
            <Text className="text-gray-500 text-sm mt-1">No hay vouchers pendientes por auditar.</Text>
          </View>
        ) : (
          payments.map(payment => (
            <View key={payment.id} className="bg-[#1C1C1E] rounded-[24px] p-5 mb-6 border border-white/5">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-white font-bold text-lg">{payment.localNombre}</Text>
                  <Text className="text-gray-400 text-xs mt-1">Inquilino: {payment.inquilinoNombre}</Text>
                </View>
                <View className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                  <Text className="text-emerald-400 text-xs font-black tracking-widest">
                    {payment.moneda === 'PEN' ? 'S/' : '$'} {payment.monto.toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => setSelectedImage(payment.voucherUrl)}
                className="w-full h-40 bg-black rounded-xl overflow-hidden mb-5 border border-white/10"
              >
                <Image source={{ uri: payment.voucherUrl }} style={{ flex: 1 }} contentFit="cover" />
                <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded flex-row items-center">
                  <Ionicons name="expand" size={12} color="#FFF" />
                  <Text className="text-white text-[10px] font-bold ml-1">Ver completo</Text>
                </View>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => handleAction(payment.id, 'rechazado')}
                  disabled={processingId === payment.id}
                  className="flex-1 bg-[#2A2A2A] py-3.5 rounded-full items-center flex-row justify-center"
                >
                  <Ionicons name="close" size={18} color="#EF4444" />
                  <Text className="text-white font-bold text-sm ml-2">Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleAction(payment.id, 'pagado')}
                  disabled={processingId === payment.id}
                  className="flex-1 bg-emerald-500 py-3.5 rounded-full items-center flex-row justify-center shadow-lg shadow-emerald-500/20"
                >
                  {processingId === payment.id ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="#000" />
                      <Text className="text-[#0A0A0A] font-bold text-sm ml-2">Aprobar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Inspección */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <Pressable className="flex-1 bg-black/95 items-center justify-center" onPress={() => setSelectedImage(null)}>
          {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: '90%', height: '80%' }} contentFit="contain" />}
          <TouchableOpacity className="absolute top-16 right-6 bg-white/10 p-3 rounded-full border border-white/20" onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
