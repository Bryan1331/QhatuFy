import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';

export default function ManageContractsScreen() {
  const router = useRouter();

  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [locales, setLocales] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedInquilino, setSelectedInquilino] = useState<any>(null);
  const [selectedLocal, setSelectedLocal] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<any>(null);
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showInquilinosModal, setShowInquilinosModal] = useState(false);
  const [showLocalesModal, setShowLocalesModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const { data: users, error: errUsers } = await supabase
          .from('perfiles')
          .select('id, nombre, email, verificacion_status, role')
          .eq('role', 'user');

        if (errUsers) {
          console.error("Error cargando usuarios:", errUsers);
        } else if (users) {
          setInquilinos(users);
        }

        const { data: stores } = await supabase.from('locales').select('*');
        const { data: activeContracts } = await supabase.from('contratos').select('local_id').eq('estado', 'activo');

        if (stores && activeContracts) {
          const activeStoreIds = activeContracts.map(c => c.local_id);
          const availableStores = stores.filter(store => !activeStoreIds.includes(store.id));
          setLocales(availableStores);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Máscara para autocompletar las barras de fecha (DD/MM/YYYY)
  const handleDateChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    setFechaPago(cleaned);
  };

  const handleFechaFinChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    setFechaFin(cleaned);
  };

  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (!result.canceled) setPdfFile(result.assets[0]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
    }
  };

  const handleSubmitContract = async () => {
    if (!selectedInquilino || !selectedLocal || !pdfFile || !monto || !fechaPago || !fechaFin) {
      Alert.alert('Incompleto', 'Llena todos los campos.');
      return;
    }

    // PARSEO DE FECHA: De DD/MM/YYYY a YYYY-MM-DD + Mediodía UTC para evitar desfase en América
    const dateParts = fechaPago.split('/');
    if (dateParts.length !== 3) {
      Alert.alert('Formato Inválido', 'La fecha debe ser DD/MM/YYYY (Ej: 15/06/2026)');
      return;
    }
    // Añadimos T12:00:00Z para que al restar 5 horas en Perú (UTC-5) siga siendo el mismo día
    const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T12:00:00Z`;

    setIsSubmitting(true);
    try {
      const { data: newContract, error: insertError } = await supabase
        .from('contratos')
        .insert([{ inquilino_id: selectedInquilino.id, local_id: selectedLocal.id, estado: 'activo' }])
        .select()
        .single();

      if (insertError || !newContract) throw insertError;

      // Leer archivo local como base64 para evitar errores de carga
      const base64 = await FileSystem.readAsStringAsync(pdfFile.uri, { encoding: 'base64' });
      const arrayBuffer = decode(base64);
      const fileName = `contrato_${newContract.id}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(fileName, arrayBuffer, { contentType: 'application/pdf', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('contratos').getPublicUrl(fileName);

      await supabase
        .from('contratos')
        .update({ documento_url: publicUrlData.publicUrl })
        .eq('id', newContract.id);

      // --- MOTOR GENERADOR DE CRONOGRAMA ---
      const [diaIni, mesIni, anioIni] = fechaPago.split('/').map(Number);
      const [diaFin, mesFin, anioFin] = fechaFin.split('/').map(Number);

      // Usamos Date.UTC para evitar que la zona horaria del dispositivo adelante o atrase los días
      let currentDate = new Date(Date.UTC(anioIni, mesIni - 1, diaIni, 12, 0, 0));
      const endDate = new Date(Date.UTC(anioFin, mesFin - 1, diaFin, 12, 0, 0));

      const pagosAGenerar = [];

      // Bucle: Mientras la fecha actual sea menor o igual a la fecha de fin
      while (currentDate <= endDate) {
        pagosAGenerar.push({
          contrato_id: newContract.id,
          monto: parseFloat(monto),
          moneda: 'PEN',
          fecha_vencimiento: currentDate.toISOString(),
          estado: 'pendiente'
        });

        // Avanzar exactamente 1 mes en el calendario
        currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
      }

      // Insertar todas las cuotas de golpe en Supabase
      const { error: pagosError } = await supabase.from('pagos').insert(pagosAGenerar);
      if (pagosError) console.error("Error insertando el cronograma:", pagosError);
      // -------------------------------------

      Alert.alert('¡Contrato Creado!', 'Se generó el contrato y el cronograma de pagos.', [
        { text: 'Aceptar', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error("Error:", error);
      Alert.alert('Error', 'Hubo un problema al crear el contrato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Crear Contrato</Text>
        <View className="w-10" />
      </View>

      {isLoadingData ? (
        <ActivityIndicator size="large" color="#10B981" className="mt-20" />
      ) : (
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          <Text className="text-gray-400 text-sm mb-6 leading-6">
            Asigna un local disponible a un inquilino verificado y adjunta el documento legal firmado.
          </Text>

          {/* Selector Inquilino */}
          <Text className="text-white font-bold mb-2">1. Seleccionar Inquilino</Text>
          <TouchableOpacity
            onPress={() => setShowInquilinosModal(true)}
            className="bg-[#151517] border border-white/10 rounded-2xl p-4 mb-6 flex-row items-center justify-between"
          >
            <Text className={selectedInquilino ? "text-white font-medium" : "text-gray-500"}>
              {selectedInquilino ? selectedInquilino.nombre : "Toca para elegir un usuario"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Selector Local */}
          <Text className="text-white font-bold mb-2">2. Asignar Local Comercial</Text>
          <TouchableOpacity
            onPress={() => setShowLocalesModal(true)}
            className="bg-[#151517] border border-white/10 rounded-2xl p-4 mb-6 flex-row items-center justify-between"
          >
            <Text className={selectedLocal ? "text-white font-medium" : "text-gray-500"}>
              {selectedLocal ? selectedLocal.nombre : "Toca para elegir un local disponible"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Datos Financieros y Cronograma */}
          <Text className="text-white font-bold mb-2">3. Cronograma de Pagos</Text>
          
          <View className="bg-[#151517] border border-white/10 rounded-2xl px-4 h-14 justify-center mb-3">
            <TextInput placeholder="Monto Mensual (Ej. 500)" placeholderTextColor="#6B7280" className="text-white font-bold" keyboardType="numeric" value={monto} onChangeText={setMonto} />
          </View>
          
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-[#151517] border border-white/10 rounded-2xl px-4 h-14 justify-center">
              <Text className="text-gray-500 text-[9px] absolute top-2 left-4 uppercase font-bold">Inicio Contrato</Text>
              <TextInput
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#6B7280"
                className="text-white font-bold mt-3"
                keyboardType="numeric"
                maxLength={10}
                value={fechaPago}
                onChangeText={handleDateChange}
              />
            </View>
            <View className="flex-1 bg-[#151517] border border-white/10 rounded-2xl px-4 h-14 justify-center">
              <Text className="text-gray-500 text-[9px] absolute top-2 left-4 uppercase font-bold">Fin Contrato</Text>
              <TextInput
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#6B7280"
                className="text-white font-bold mt-3"
                keyboardType="numeric"
                maxLength={10}
                value={fechaFin}
                onChangeText={handleFechaFinChange}
              />
            </View>
          </View>

          {/* Subida PDF */}
          <Text className="text-white font-bold mb-2">4. Adjuntar Contrato (PDF)</Text>
          <TouchableOpacity
            onPress={handlePickPDF}
            className={`border-2 border-dashed rounded-2xl p-6 mb-8 items-center justify-center ${pdfFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 bg-[#151517]'}`}
          >
            <Ionicons name={pdfFile ? "document-text" : "cloud-upload-outline"} size={32} color={pdfFile ? "#22C55E" : "#6B7280"} className="mb-2" />
            <Text className={pdfFile ? "text-green-500 font-bold" : "text-gray-400 font-medium"}>
              {pdfFile ? pdfFile.name : "Subir archivo PDF"}
            </Text>
          </TouchableOpacity>

          {/* Botón Final */}
          <TouchableOpacity
            onPress={handleSubmitContract}
            disabled={isSubmitting}
            className="bg-[#10B981] rounded-full py-4 items-center justify-center flex-row shadow-lg shadow-green-500/20 mb-10"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white font-bold text-base">Crear y Guardar Contrato</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* MODALES VISUALES PARA SELECCIÓN */}
      {/* Modal Inquilinos */}
      <Modal visible={showInquilinosModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#151517] pt-6 px-6">
          <Text className="text-white text-xl font-bold mb-4">Elige un Inquilino</Text>
          <ScrollView>
            {inquilinos.map(inq => (
              <TouchableOpacity key={inq.id} className="py-4 border-b border-white/5 flex-row justify-between" onPress={() => { setSelectedInquilino(inq); setShowInquilinosModal(false); }}>
                <View>
                  <Text className="text-white font-bold">{inq.nombre}</Text>
                  <Text className="text-gray-500 text-xs">{inq.email}</Text>
                </View>
                {inq.verificacion_status === 'aprobado' && <Ionicons name="shield-checkmark" size={16} color="#22C55E" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={() => setShowInquilinosModal(false)} className="py-4 mb-8 items-center bg-white/10 rounded-xl mt-4"><Text className="text-white font-bold">Cancelar</Text></TouchableOpacity>
        </View>
      </Modal>

      {/* Modal Locales */}
      <Modal visible={showLocalesModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#151517] pt-6 px-6">
          <Text className="text-white text-xl font-bold mb-4">Elige un Local Disponible</Text>
          <ScrollView>
            {locales.map(local => (
              <TouchableOpacity
                key={local.id}
                className="py-3 mb-3 border border-white/5 rounded-2xl flex-row items-center bg-[#1C1C1E] p-3"
                onPress={() => {
                  setSelectedLocal(local);
                  setMonto(local.precio ? local.precio.toString() : ''); // AUTO-LLENADO
                  setShowLocalesModal(false);
                }}
              >
                <Image source={{ uri: local.imagen_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=300' }} className="w-12 h-12 rounded-xl mr-3" />
                <View>
                  <Text className="text-white font-bold">{local.nombre}</Text>
                  <Text className="text-gray-500 text-xs">
                    {local.ubicacion} • {local.precio ? `S/ ${local.precio}` : 'Precio no definido'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={() => setShowLocalesModal(false)} className="py-4 mb-8 items-center bg-white/10 rounded-xl mt-4"><Text className="text-white font-bold">Cancelar</Text></TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
