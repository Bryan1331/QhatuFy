import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * WelcomeScreen
 * -------------
 * Pantalla inicial para usuarios no autenticados.
 * Presenta opciones para registrarse o iniciar sesión con una animación elegante de entrada.
 */
export default function WelcomeScreen() {
  // Valores para la animación
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Ejecutar transición limpia de React Native
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131517' }}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="flex-1 justify-center px-6"
      >
        {/* Icono Central Superpuesto */}
        <View className="items-center mb-[70px]">
          <View className="w-[120px] h-[120px] bg-[#1E1F22] rounded-full items-center justify-center mb-8">
            <Ionicons name="business" size={54} color="#ADC6FF" />
          </View>

          <Text className="text-white text-[44px] font-extrabold tracking-tight mb-4">
            QhatuFy
          </Text>

          <Text className="text-[#9CA3AF] text-[17px] text-center px-6 leading-7">
            La nueva era en gestión de locales comerciales
          </Text>
        </View>

        {/* Botones de Navegación (Auth) */}
        <View className="w-full space-y-4">
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity
              activeOpacity={0.8}
              style={
                Platform.OS === 'web'
                  ? { boxShadow: '0px 8px 20px rgba(122, 166, 250, 0.3)' } as any
                  : {
                      shadowColor: '#7AA6FA',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 20,
                      elevation: 10,
                    }
              }
              className="bg-[#7AA6FA] rounded-full py-[18px] items-center flex-row justify-center mb-4"
            >
              <Text className="text-[#0D1526] font-bold text-lg mr-2">Crear una cuenta</Text>
              <Ionicons name="arrow-forward" size={20} color="#0D1526" />
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#1E1F22] rounded-full py-[18px] items-center justify-center border border-white/5"
            >
              <Text className="text-white font-semibold text-lg">Iniciar Sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer Legal */}
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <Text className="text-[#6B7280] text-[11px] tracking-[0.1em] font-medium uppercase">
            Al continuar, aceptas nuestros términos
          </Text>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}
