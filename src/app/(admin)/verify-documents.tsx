import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, Alert, Modal, Pressable, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPendingVerifications, updateVerification } from '../../services/adminService';
import { UserProfile } from '../../store/authAtom';
import { SolicitudCard } from '../../components/admin/SolicitudCard';

export default function VerifyDocuments() {
  const router = useRouter();
  
  const [pendingDocuments, setPendingDocuments] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingVerifications();
      setPendingDocuments(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron cargar los documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId: string, status: 'aprobado' | 'rechazado') => {
    try {
      setProcessingId(userId);
      await updateVerification(userId, status);
      setPendingDocuments(prev => prev.filter(user => user.id !== userId));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo procesar la verificación.');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const renderSkeleton = () => (
    <View className="bg-[#1C1C1E] p-6 rounded-[32px] mb-5">
      <View className="flex-row items-center mb-6">
        <View className="w-12 h-12 rounded-full bg-[#2A2A2E] animate-pulse mr-4" />
        <View className="flex-1 space-y-2">
          <View className="h-4 w-32 bg-[#2A2A2E] rounded animate-pulse" />
          <View className="h-3 w-48 bg-[#2A2A2E] rounded animate-pulse" />
        </View>
      </View>
      <View className="space-y-4 mb-6">
        <View className="h-3 w-16 bg-[#2A2A2E] rounded animate-pulse" />
        <View className="h-4 w-32 bg-[#2A2A2E] rounded animate-pulse" />
        <View className="h-3 w-16 bg-[#2A2A2E] rounded animate-pulse mt-4" />
        <View className="h-4 w-32 bg-[#2A2A2E] rounded animate-pulse" />
        <View className="h-3 w-20 bg-[#2A2A2E] rounded animate-pulse mt-4" />
        <View className="h-4 w-full bg-[#2A2A2E] rounded animate-pulse" />
      </View>
      <View className="w-full h-[200px] bg-[#2A2A2E] rounded-[20px] animate-pulse mb-6" />
      <View className="flex-row gap-3">
        <View className="flex-1 h-12 bg-[#2A2A2E] rounded-full animate-pulse" />
        <View className="flex-1 h-12 bg-[#2A2A2E] rounded-full animate-pulse" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-[15px] font-bold leading-tight">Verificación de</Text>
            <Text className="text-white text-[15px] font-bold leading-tight">Documentos</Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-2">
          {/* Badge Naranja */}
          <View className="flex-row items-center bg-[#B45309]/20 px-3 py-1.5 rounded-full border border-[#B45309]/30">
            <Ionicons name="document-text" size={10} color="#F59E0B" />
            <View className="ml-1.5">
              <Text className="text-[#F59E0B] text-[8px] font-bold leading-none">En</Text>
              <Text className="text-[#F59E0B] text-[8px] font-bold leading-none">Revisión</Text>
            </View>
          </View>
          
          {/* Badge Gris */}
          <View className="flex-row items-center bg-[#1C1C1E] px-3 py-1.5 rounded-full border border-white/5">
            <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
            <View>
              <Text className="text-white text-[10px] font-bold leading-none">{pendingDocuments.length}</Text>
              <Text className="text-gray-400 text-[8px] font-bold leading-none">Pendientes</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList<any>
        data={loading ? [1, 2] : pendingDocuments}
        keyExtractor={(item, index) => loading ? `skel-${index}` : (item as UserProfile).id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-white text-2xl font-extrabold tracking-tight mb-2">Solicitudes</Text>
            <Text className="text-gray-400 text-[13px] leading-5 pr-4">
              Revisa y aprueba las solicitudes de nuevos inquilinos pendientes en tu plataforma.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (loading) return renderSkeleton();
          
          return (
            <SolicitudCard 
              item={item as UserProfile}
              processingId={processingId}
              onApprove={(id) => handleVerification(id, 'aprobado')}
              onReject={(id) => handleVerification(id, 'rechazado')}
              onImagePress={(url) => { setSelectedImage(url); setIsModalVisible(true); }}
            />
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center mt-12">
              <View className="w-20 h-20 rounded-full border border-white/5 bg-[#121212] items-center justify-center mb-6">
                <View className="w-12 h-12 rounded-full border border-gray-600 items-center justify-center">
                  <Ionicons name="checkmark" size={24} color="#D1D5DB" />
                </View>
              </View>
              <Text className="text-white text-[17px] font-bold tracking-tight mb-3">No hay más solicitudes</Text>
              <Text className="text-gray-500 text-[13px] text-center leading-5 px-6">
                Has revisado todos los documentos pendientes.{'\n'}Tu bandeja está limpia por ahora.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Tab Bar Mockup */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0F0F0F] pt-4 pb-8 px-6 flex-row justify-between items-center border-t border-white/5">
        <TouchableOpacity className="items-center">
          <View className="bg-[#5C8FFB] px-4 py-2 rounded-full flex-row items-center shadow-lg shadow-blue-500/20">
            <Ionicons name="clipboard-outline" size={18} color="#000" />
            <Text className="text-[#000] text-[11px] font-bold ml-1.5">Solicitudes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="items-center opacity-50">
          <Ionicons name="time-outline" size={20} color="#FFF" className="mb-1" />
          <Text className="text-white text-[10px] font-medium">Historial</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center opacity-50">
          <Ionicons name="stats-chart-outline" size={20} color="#FFF" className="mb-1" />
          <Text className="text-white text-[10px] font-medium">Análisis</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center opacity-50">
          <Ionicons name="settings-outline" size={20} color="#FFF" className="mb-1" />
          <Text className="text-white text-[10px] font-medium">Ajustes</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Inspección de Documento */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/95 items-center justify-center"
          onPress={() => setIsModalVisible(false)}
        >
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }}
              style={{ width: '90%', height: '80%' }}
              contentFit="contain"
            />
          )}
          <TouchableOpacity 
            className="absolute top-16 right-6 bg-white/10 p-3 rounded-full border border-white/20"
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
