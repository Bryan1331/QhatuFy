import React, { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
import { PaymentRequirement } from '../../types/payment';

interface PaymentCardProps {
  payments: PaymentRequirement[];
}

export function PaymentCard({ payments }: PaymentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtramos los pagos pendientes
  const pendingPayments = useMemo(() => {
    return payments.filter(p => p.isPaid === false);
  }, [payments]);

  // Sumamos los montos de los pagos pendientes
  const totalAmount = useMemo(() => {
    return pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [pendingPayments]);

  // Ordenamos los pagos por fecha de vencimiento (el más próximo primero)
  const sortedPayments = useMemo(() => {
    return [...pendingPayments].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [pendingPayments]);

  // Si no hay pagos pendientes, retornamos el Empty State
  if (pendingPayments.length === 0) {
    return (
      <View className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5">
        <Text className="text-white text-xl font-bold mb-2">Todo al día</Text>
        <Text className="text-white/60">No tienes pagos pendientes este mes.</Text>
      </View>
    );
  }

  // Obtenemos el pago más próximo para mostrar su fecha y símbolo de moneda en la cabecera
  const closestPayment = sortedPayments[0];
  const currencySymbol = closestPayment.currency === 'USD' ? '$' : 'S/';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <View className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5">
      {/* Cabecera interactiva */}
      <Pressable 
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row justify-between items-center"
      >
        <View>
          <Text className="text-white/60 text-sm font-medium mb-1">Total a Pagar</Text>
          <Text className="text-white text-3xl font-bold">
            {currencySymbol}{totalAmount.toFixed(2)}
          </Text>
          <View className="flex-row items-center mt-2 gap-1.5">
            <Calendar color="#A1A1AA" size={14} />
            <Text className="text-[#A1A1AA] text-xs">
              Próximo vcto: {formatDate(closestPayment.dueDate)}
            </Text>
          </View>
        </View>
        
        {/* Indicador visual de despliegue */}
        <View className="bg-white/10 rounded-full p-2">
          {isExpanded ? (
            <ChevronUp color="#FFFFFF" size={20} />
          ) : (
            <ChevronDown color="#FFFFFF" size={20} />
          )}
        </View>
      </Pressable>

      {/* Desglose renderizado condicionalmente */}
      {isExpanded && (
        <View className="mt-6 pt-4 border-t border-white/10 gap-3">
          {sortedPayments.map((payment) => (
            <View key={payment.id} className="flex-row justify-between items-center bg-black/20 p-4 rounded-2xl">
              <View>
                <Text className="text-white font-medium">{payment.contractName}</Text>
                <Text className="text-white/50 text-xs mt-1">
                  Vence el {formatDate(payment.dueDate)}
                </Text>
              </View>
              <Text className="text-white font-bold text-base">
                {payment.currency === 'USD' ? '$' : 'S/'}{payment.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
