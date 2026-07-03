import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getLocalPayments, submitPayment } from '../../services/syncService';
import { uploadVoucherImage } from '../../services/storageService';
import { useAtom } from 'jotai';
import { authAtom } from '../../store/authAtom';

export default function PayRentScreen() {
  const router = useRouter();
  const { paymentId } = useLocalSearchParams();
  const [auth] = useAtom(authAtom);

  const [paymentData, setPaymentData] = useState<any>(null);
  const [voucherUri, setVoucherUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPayment = async () => {
      const payments = await getLocalPayments();
      const current = payments.find(p => p.id === paymentId) || payments[0]; // Fallback al primero
      setPaymentData(current);
    };
    loadPayment();
  }, [paymentId]);

  const pickImage = async () => {
    if (paymentData?.status === 'en_revision') return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso denegado', 'Necesitamos acceso a galería.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setVoucherUri(result.assets[0].uri);
  };

  const handlePaymentSubmit = async () => {
    if (!voucherUri || !paymentData || !auth.user?.id) return;
    try {
      setLoading(true);
      const url = await uploadVoucherImage(auth.user.id, voucherUri);
      await submitPayment(paymentData.id, url, paymentData.totalAmount);
      
      Alert.alert('¡Pago en Revisión!', 'El administrador validará tu voucher pronto.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!paymentData) return <ActivityIndicator color="#5C8FFB" className="mt-20" />;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center px-5 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.push('/(private)' as any)} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">Realizar Pago</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Resumen */}
        <View className="items-center mb-8">
          <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">Total a Cancelar</Text>
          <Text className="text-white text-5xl font-black tracking-tighter">
            {paymentData.currency === 'PEN' ? 'S/' : '$'} {paymentData.totalAmount.toFixed(2)}
          </Text>
          <Text className="text-gray-500 text-xs mt-2">{paymentData.contractName}</Text>
          {paymentData.penalty > 0 && (
            <View className="mt-3 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
              <Text className="text-red-400 text-[10px] font-bold">Incluye mora diaria (+{paymentData.penalty})</Text>
            </View>
          )}
        </View>

        {/* Cuentas Bancarias */}
        <Text className="text-white text-sm font-bold mb-4">Medios de Pago Disponibles</Text>
        <View className="bg-[#1C1C1E] rounded-[24px] p-5 mb-6 border border-white/5 space-y-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                <Ionicons name="phone-portrait" size={14} color="#A855F7" />
              </View>
              <Text className="text-white font-medium">Yape / Plin</Text>
            </View>
            <Text className="text-white font-bold tracking-widest">999 888 777</Text>
          </View>
          <View className="h-[1px] bg-white/5" />
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                <Ionicons name="business" size={14} color="#3B82F6" />
              </View>
              <Text className="text-white font-medium">BCP (Soles)</Text>
            </View>
            <Text className="text-white font-bold tracking-widest">191-00000000-0-00</Text>
          </View>
        </View>

        {/* Subir Voucher */}
        {paymentData.status === 'en_revision' ? (
          <View className="w-full bg-[#1C1C1E] border border-amber-500/20 rounded-[24px] p-6 items-center justify-center mb-12">
            <View className="bg-amber-500/10 w-14 h-14 rounded-full items-center justify-center mb-3">
              <Ionicons name="time" size={28} color="#F59E0B" />
            </View>
            <Text className="text-white font-bold text-sm text-center leading-relaxed">
              Comprobante en revisión. Te notificaremos cuando el administrador lo valide.
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-white text-sm font-bold mb-4">Sube tu Comprobante</Text>
            <TouchableOpacity 
              onPress={pickImage}
              disabled={loading}
              className="w-full h-48 rounded-[24px] border-2 border-dashed border-white/20 bg-[#1C1C1E] items-center justify-center overflow-hidden mb-8"
            >
              {voucherUri ? (
                <Image source={{ uri: voucherUri }} className="w-full h-full object-cover" />
              ) : (
                <View className="items-center">
                  <View className="bg-blue-500/20 w-12 h-12 rounded-full items-center justify-center mb-3">
                    <Ionicons name="cloud-upload" size={24} color="#5C8FFB" />
                  </View>
                  <Text className="text-white font-bold text-sm">Toca para subir captura</Text>
                  <Text className="text-gray-500 text-xs mt-1">Formatos: JPG, PNG</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handlePaymentSubmit}
              disabled={!voucherUri || loading}
              className={`w-full bg-blue-600 rounded-full py-4 items-center justify-center flex-row mb-12 ${!voucherUri || loading ? 'opacity-50' : ''}`}
            >
              {loading && <ActivityIndicator color="#FFF" size="small" className="mr-2" />}
              <Text className="text-white font-bold tracking-wide">ENVIAR A REVISIÓN</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
