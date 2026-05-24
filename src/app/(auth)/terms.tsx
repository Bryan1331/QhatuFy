import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-white/5">
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Términos y Condiciones</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-400 text-xs tracking-widest uppercase mb-6 font-bold">
          Última actualización: 24 de Mayo de 2026
        </Text>

        <Text className="text-white text-xl font-bold mb-4">1. Aceptación de los Términos</Text>
        <Text className="text-gray-400 text-sm mb-6 leading-6 text-justify">
          Al registrarse, acceder o utilizar la plataforma QhatuFy (la "Aplicación"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al servicio. QhatuFy actúa como un intermediario tecnológico para la gestión de arrendamiento comercial.
        </Text>

        <Text className="text-white text-xl font-bold mb-4">2. Verificación de Identidad (KYC)</Text>
        <Text className="text-gray-400 text-sm mb-6 leading-6 text-justify">
          Como parte de nuestros protocolos de seguridad y prevención de fraudes, QhatuFy requiere que todos los inquilinos pasen por un proceso de verificación de identidad (KYC). Usted se compromete a proporcionar información y documentación oficial, veraz, precisa y actualizada (ej. DNI, Pasaporte). La falsificación de documentos resultará en el baneo inmediato de la plataforma y el reporte a las autoridades competentes.
        </Text>

        <Text className="text-white text-xl font-bold mb-4">3. Gestión de Contratos y Pagos</Text>
        <Text className="text-gray-400 text-sm mb-6 leading-6 text-justify">
          La Aplicación facilita la visualización de contratos de arrendamiento y la gestión de cronogramas de pago. Sin embargo, el contrato final de arrendamiento es un acuerdo legal vinculante directamente entre el Administrador/Propietario y el Inquilino. QhatuFy no se hace responsable por disputas legales derivadas del incumplimiento de dicho contrato físico o digital.
        </Text>

        <Text className="text-white text-xl font-bold mb-4">4. Privacidad y Protección de Datos</Text>
        <Text className="text-gray-400 text-sm mb-6 leading-6 text-justify">
          Su privacidad es primordial. QhatuFy almacena y encripta su información personal (incluyendo documentos de identidad y contratos) utilizando infraestructura de grado militar (Supabase). Sus datos no serán vendidos a terceros. Solo los administradores autorizados de la galería comercial tendrán acceso a su perfil para fines de aprobación y seguimiento.
        </Text>

        <Text className="text-white text-xl font-bold mb-4">5. Propiedad Intelectual</Text>
        <Text className="text-gray-400 text-sm mb-6 leading-6 text-justify">
          Todo el código, diseño, arquitectura y marca "QhatuFy" son propiedad exclusiva de la plataforma. La ingeniería inversa o copia no autorizada de la interfaz será motivo de acciones legales.
        </Text>

        {/* Espacio para hacer scroll cómodamente hasta el final */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
