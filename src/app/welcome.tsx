import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
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
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1115' }}>
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
          <View className="w-[100px] h-[100px] bg-[#16181D] rounded-full items-center justify-center mb-8 shadow-2xl">
            <Ionicons name="business" size={42} color="#ADC6FF" />
          </View>
          
          <Text className="text-white text-5xl font-extrabold tracking-tight mb-4">
            QhatuFy
          </Text>
          
          <Text className="text-gray-400 text-base text-center px-4 leading-6">
            La nueva era en gestión de locales comerciales
          </Text>
        </View>

        {/* Botones de Navegación (Auth) */}
        <View className="w-full space-y-4">
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity className="bg-[#6B9EFA] rounded-full py-[18px] items-center flex-row justify-center mb-4 shadow-lg shadow-blue-900/30">
              <Text className="text-[#0F1115] font-bold text-lg mr-2">Crear una cuenta</Text>
              <Ionicons name="arrow-forward" size={20} color="#0F1115" />
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="bg-transparent border-[1.5px] border-white/10 rounded-full py-[18px] items-center bg-[#16181D]">
              <Text className="text-white font-bold text-lg">Iniciar Sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer Legal */}
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <Text className="text-gray-500/80 text-[10px] tracking-widest font-bold uppercase">
            Al continuar, aceptas nuestros términos
          </Text>
        </View>
        
      </Animated.View>
    </SafeAreaView>
  );
}
