import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function PrivateLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#5C8FFB', // Azul premium para el activo
        tabBarInactiveTintColor: '#9CA3AF', // Gris para los inactivos
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      {/* 1. Izquierda: Catálogo */}
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* 2. Centro: Home (Antes dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center w-11 h-11 rounded-full ${focused ? 'bg-[#1A253A]' : ''}`}>
              <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
            </View>
          ),
        }}
      />

      {/* 3. Derecha: Cita */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Cita',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* Ocultar pantallas secundarias de la barra inferior */}
      <Tabs.Screen name="store-detail" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="my-contracts" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="rules" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="profile" options={{ href: null, headerShown: false }} /> {/* NUEVA RUTA */}
    </Tabs>
  );
}
