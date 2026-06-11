import { useRouter } from 'expo-router';
import { AlertCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

export function PaymentCard({ payments }: { payments: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const pendingPayments = useMemo(() => payments.filter(p => p.isPaid === false), [payments]);

  const totalAmount = useMemo(() => {
    return pendingPayments.reduce((sum, payment) => sum + payment.totalAmount, 0); // Ahora suma la mora
  }, [pendingPayments]);

  const totalPenalty = useMemo(() => {
    return pendingPayments.reduce((sum, payment) => sum + (payment.penalty || 0), 0);
  }, [pendingPayments]);

  const sortedPayments = useMemo(() => {
    return [...pendingPayments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [pendingPayments]);

  if (pendingPayments.length === 0) {
    return (
      <View className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5 items-center">
        <View className="w-12 h-12 bg-green-500/20 rounded-full items-center justify-center mb-3">
          <Text className="text-green-500 text-xl">🎉</Text>
        </View>
        <Text className="text-white text-lg font-bold mb-1">Todo al día</Text>
        <Text className="text-white/60 text-xs">No tienes pagos pendientes. ¡Excelente!</Text>
      </View>
    );
  }

  const closestPayment = sortedPayments[0];
  const currencySymbol = closestPayment.currency === 'PEN' ? 'S/ ' : '$ ';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <View className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
      {totalPenalty > 0 && (
        <View className="absolute top-0 right-0 bg-red-500 px-4 py-1 rounded-bl-xl z-10">
          <Text className="text-white text-[9px] font-bold tracking-widest">EN MORA</Text>
        </View>
      )}

      <Pressable onPress={() => setIsExpanded(!isExpanded)} className="flex-row justify-between items-center mb-5 mt-2">
        <View>
          <Text className="text-white/60 text-[11px] font-bold tracking-widest uppercase mb-1">Total a Pagar</Text>
          <Text className="text-white text-3xl font-black tracking-tighter">
            {currencySymbol}{totalAmount.toFixed(2)}
          </Text>
          {totalPenalty > 0 && (
            <Text className="text-red-400 text-[10px] font-bold mt-1">
              Incluye mora de {currencySymbol}{totalPenalty.toFixed(2)}
            </Text>
          )}
          <View className="flex-row items-center mt-3 bg-white/5 self-start px-3 py-1.5 rounded-full">
            <Calendar color="#A1A1AA" size={12} />
            <Text className="text-[#A1A1AA] text-[10px] font-bold ml-1.5 uppercase">
              VENCE: {formatDate(closestPayment.dueDate)}
            </Text>
          </View>
        </View>
        <View className="bg-white/5 rounded-full p-2 border border-white/10">
          {isExpanded ? <ChevronUp color="#FFFFFF" size={18} /> : <ChevronDown color="#FFFFFF" size={18} />}
        </View>
      </Pressable>

      {isExpanded && (
        <View className="mt-5 pt-4 border-t border-white/5 gap-3">
          {sortedPayments.map((payment) => (
            <View key={payment.id} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex-row items-center justify-between">

              {/* Detalles del pago (Izquierda) */}
              <View className="flex-1 mr-3">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-white font-bold text-sm">{payment.contractName}</Text>
                  <Text className="text-white font-black text-sm">
                    {payment.currency === 'PEN' ? 'S/' : '$'} {payment.totalAmount.toFixed(2)}
                  </Text>
                </View>

                {/* NUEVO: Fecha de vencimiento y Base alineados */}
                <View className="flex-row items-center mb-2">
                  <Text className={`text-[10px] font-bold uppercase mr-2 ${payment.penalty > 0 ? 'text-red-400' : 'text-[#A1A1AA]'}`}>
                    VENCE: {formatDate(payment.dueDate)}
                  </Text>
                  <Text className="text-white/30 text-[10px] font-bold uppercase">• Base: {payment.amount.toFixed(2)}</Text>
                </View>

                {payment.penalty > 0 && (
                  <View className="flex-row items-center bg-red-500/10 self-start px-2 py-1 rounded-md mt-0.5">
                    <AlertCircle color="#EF4444" size={10} />
                    <Text className="text-red-400 text-[9px] font-bold ml-1">
                      +{payment.daysLate} Días ({payment.penalty.toFixed(2)})
                    </Text>
                  </View>
                )}
              </View>

              {/* Botón de pago individual (Derecha) */}
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(private)/pay-rent', params: { paymentId: payment.id } } as any)}
                className="bg-blue-600 px-4 py-2.5 rounded-full shadow-lg shadow-blue-500/20 active:bg-blue-700"
              >
                <Text className="text-white font-bold text-[11px] tracking-wide">PAGAR</Text>
              </TouchableOpacity>

            </View>
          ))}
        </View>
      )}
    </View>
  );
}
