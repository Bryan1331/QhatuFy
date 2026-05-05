import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentCard } from '../../components/dashboard/PaymentCard';
import { authAtom } from '../../store/authAtom';
import { PaymentRequirement } from '../../types/payment';

/**
 * DashboardScreen
 * ---------------
 * Pantalla principal privada del cliente QhatuFy.
 * Extrae la información contextual directamente usando `useAtom`.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const [auth, setAuth] = useAtom(authAtom);
  const userName = auth.user?.name || 'Alejandro';

  const handleLogout = () => {
    setAuth({
      user: null,
      isAuthenticated: false,
      token: null,
    });
  };

  const mockPayments: PaymentRequirement[] = [
    {
      id: '1',
      contractName: 'Local Comercial - Sector A',
      amount: 1250,
      currency: 'PEN',
      dueDate: '2026-05-31T00:00:00.000Z',
      isPaid: false,
    },
    {
      id: '2',
      contractName: 'Stand 15 - Zona Tecnológica',
      amount: 800,
      currency: 'PEN',
      dueDate: '2026-05-12T00:00:00.000Z',
      isPaid: false,
    },
    {
      id: '3',
      contractName: 'Almacén B',
      amount: 400,
      currency: 'PEN',
      dueDate: '2026-04-15T00:00:00.000Z',
      isPaid: true,
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D0D', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* 
        Container general con padding. El padding Bottom extra (pb-24) 
        es para que el scroll no quede tapado por la barra de navegación inferior falsa.
      */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header - Avatar, Logo y Botones (Notificaciones y Cerrar Sesión) */}
        <View className="flex-row items-center justify-between mt-6 mb-8">
          <View className="flex-row items-center flex-1">
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
              className="w-11 h-11 rounded-full mr-3 border border-white/10"
            />
            <View>
              <Text className="text-white text-sm font-semibold leading-tight">Hola,</Text>
              <Text className="text-white text-sm font-semibold leading-tight">{userName}</Text>
              <Text className="text-gray-400 text-[10px] mt-0.5">Bienvenido a tu espacio</Text>
            </View>
          </View>

          <Text className="text-[#5C8FFB] text-xl font-bold tracking-tight shadow-sm shadow-blue-500/20">
            QhatuFy
          </Text>

          <View className="flex-row items-center justify-end flex-1">
            <TouchableOpacity className="p-2 rounded-full bg-white/5 mr-2">
              <Ionicons name="notifications" size={18} color="#D1D5DB" />
            </TouchableOpacity>
            {/* Botón de Cerrar Sesión (Ubicado de forma elegante en el header) */}
            <TouchableOpacity className="p-2 rounded-full bg-red-500/10" onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning: Completa tu Perfil */}
        {!auth.user?.hasCompletedProfile && (
          <View className="bg-[#1C130D] rounded-[20px] mb-8 border-l-4 border-[#F97316] py-4 px-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-[#F97316] w-5 h-5 rounded-full items-center justify-center mr-3">
                  <Text className="text-black text-[10px] font-extrabold pb-0.5">!</Text>
                </View>
                <Text className="text-white text-[11px] font-medium leading-4 flex-1 pr-2">
                  Completa tu perfil para agendar citas
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(auth)/complete-profile')}>
                <Text className="text-[#F97316] text-[10px] font-bold tracking-widest">COMPLETAR</Text>
              </TouchableOpacity>
            </View>
            {/* Barra de Progreso */}
            <View className="flex-row items-center h-1 mt-3 ml-8">
              <View className="w-24 h-1 bg-[#F97316] rounded-full" />
              <View className="w-12 h-1 bg-[#3A2415] rounded-full ml-1" />
            </View>
          </View>
        )}

        {/* Card: Próximo Pago */}
        <View className="mb-8">
          <PaymentCard payments={mockPayments} />
        </View>

        {/* Sección: Gestión Rápida */}
        <Text className="text-gray-400 text-[10px] font-bold tracking-widest mb-4">GESTIÓN RÁPIDA</Text>
        <View className="flex-row flex-wrap justify-between pr-0">

          {/* Card 1: Mis Contratos */}
          <TouchableOpacity className="w-[48%] bg-[#151515] p-5 rounded-[28px] mb-4 border border-white/5">
            <View className="w-10 h-10 rounded-full bg-[#1A253A] items-center justify-center mb-4">
              <Ionicons name="document-text" size={18} color="#5C8FFB" />
            </View>
            <Text className="text-white font-bold text-sm mb-1 leading-tight">Mis{'\n'}Contratos</Text>
            <Text className="text-gray-500 text-[10px] mt-1 pr-2">2 Activos</Text>
          </TouchableOpacity>

          {/* Card 2: Reporte WhatsApp */}
          <TouchableOpacity className="w-[48%] bg-[#151515] p-5 rounded-[28px] mb-4 border border-white/5">
            <View className="w-10 h-10 rounded-full bg-[#1A2E22] items-center justify-center mb-4">
              <Ionicons name="chatbubble-ellipses" size={18} color="#22C55E" />
            </View>
            <Text className="text-white font-bold text-sm mb-1 leading-tight">Reporte{'\n'}WhatsApp</Text>
            <Text className="text-gray-500 text-[10px] mt-1 pr-2">Atención inmediata</Text>
          </TouchableOpacity>

          {/* Card 3: Reglamento */}
          <TouchableOpacity className="w-[48%] bg-[#151515] p-5 rounded-[28px] mb-4 border border-white/5">
            <View className="w-10 h-10 rounded-full bg-[#3B281B] items-center justify-center mb-4">
              <Ionicons name="document-lock" size={18} color="#F97316" />
            </View>
            <Text className="text-white font-bold text-sm mb-1 leading-tight">Reglamento</Text>
            <Text className="text-gray-500 text-[10px] mt-1 pr-2">Normas de{'\n'}convivencia</Text>
          </TouchableOpacity>

          {/* Card 4: Soporte */}
          <TouchableOpacity className="w-[48%] bg-[#151515] p-5 rounded-[28px] mb-4 border border-white/5">
            <View className="w-10 h-10 rounded-full bg-[#20223A] items-center justify-center mb-4">
              <Ionicons name="headset" size={18} color="#818CF8" />
            </View>
            <Text className="text-white font-bold text-sm mb-1 leading-tight">Soporte</Text>
            <Text className="text-gray-500 text-[10px] mt-1">Centro de ayuda</Text>
          </TouchableOpacity>

        </View>

        {/* Sección: Contrato Vigente */}
        <View className="bg-[#121212] rounded-[32px] overflow-hidden mt-4 pb-2 border border-white/5">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' }}
            className="w-full h-40 opacity-90"
          />
          <View className="p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-sm shadow-green-500" />
              <Text className="text-white/70 text-[9px] font-bold tracking-widest uppercase mt-0.5">CONTRATO VIGENTE</Text>
            </View>

            <Text className="text-white text-xl font-bold mb-3 tracking-tight">Stand 2680 - Galerias{'\n'}Arcangel</Text>
            <Text className="text-gray-400 text-xs mb-6 leading-5">
              Disfruta de tu estancia. Recuerda que el próximo mantenimiento preventivo de aire acondicionado está programado para el 20 de Octubre.
            </Text>

            <View className="flex-row space-x-3">
              <View className="bg-white/5 px-4 py-2 rounded-full">
                <Text className="text-gray-300 text-[10px] font-medium">Piso 2</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* 
        Bottom Navigation Bar Mockup (Falsa)
        Se renderiza encima (absolute) al fondo. 
      */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0F0F0F] pt-4 pb-6 px-4 flex-row justify-between items-center border-t border-white/5">
        <TouchableOpacity className="items-center flex-1">
          <View className="bg-[#1A253A] w-12 h-12 rounded-full items-center justify-center mb-1">
            <Ionicons name="home" size={20} color="#5C8FFB" />
          </View>
          <Text className="text-[#5C8FFB] text-[10px] font-semibold">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center flex-1 opacity-50">
          <View className="w-12 h-12 rounded-full items-center justify-center mb-1">
            <Ionicons name="document-text-outline" size={22} color="#FFF" />
          </View>
          <Text className="text-white text-[10px] font-medium">Contratos</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center flex-1 opacity-50">
          <View className="w-12 h-12 rounded-full items-center justify-center mb-1">
            <Ionicons name="card-outline" size={22} color="#FFF" />
          </View>
          <Text className="text-white text-[10px] font-medium">Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center flex-1 opacity-50">
          <View className="w-12 h-12 rounded-full items-center justify-center mb-1">
            <Ionicons name="chatbubbles-outline" size={22} color="#FFF" />
          </View>
          <Text className="text-white text-[10px] font-medium">Cita</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
