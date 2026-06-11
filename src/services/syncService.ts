import * as Notifications from 'expo-notifications';
import { getLocalDb } from './localDb';
import { supabase } from './supabase';

export const syncTenantData = async (userId: string) => {
  try {
    const db = await getLocalDb();

    // 1. Descargar Contratos y Locales vinculados desde Supabase
    const { data: contratos, error: errContratos } = await supabase
      .from('contratos')
      .select('*, locales(*)')
      .eq('inquilino_id', userId);

    if (errContratos || !contratos) throw errContratos;

    // Borrar localmente para evitar duplicados. Orden: Hijos (pagos) -> Padres (contratos)
    await db.runAsync('DELETE FROM pagos');
    await db.runAsync('DELETE FROM contratos');

    // Guardar Locales y Contratos localmente
    for (const con of contratos) {
      if (con.locales) {
        await db.runAsync(
          'INSERT OR REPLACE INTO locales (id, nombre, ubicacion, imagen_url) VALUES (?, ?, ?, ?);',
          [con.locales.id, con.locales.nombre, con.locales.ubicacion, con.locales.imagen_url]
        );
      }
      await db.runAsync(
        'INSERT OR REPLACE INTO contratos (id, inquilino_id, local_id, estado, documento_url) VALUES (?, ?, ?, ?, ?);',
        [con.id, con.inquilino_id, con.local_id, con.estado, con.documento_url]
      );
    }

    // 2. Descargar e Insertar nuevos Pagos
    const contratoIds = contratos.map(c => c.id);

    if (contratoIds.length > 0) {
      const { data: pagos, error: errPagos } = await supabase
        .from('pagos')
        .select('*')
        .in('contrato_id', contratoIds);

      if (errPagos || !pagos) throw errPagos;

      for (const pago of pagos) {
        await db.runAsync(
          'INSERT OR REPLACE INTO pagos (id, contrato_id, monto, moneda, fecha_vencimiento, estado) VALUES (?, ?, ?, ?, ?, ?);',
          [pago.id, pago.contrato_id, pago.monto, pago.moneda, pago.fecha_vencimiento, pago.estado]
        );
      }
    }

    // Sincronizar Citas reales del usuario
    const { data: citas, error: errCitas } = await supabase
      .from('citas')
      .select('*, locales(*)')
      .eq('inquilino_id', userId);

    if (!errCitas && citas) {
      await db.runAsync('DELETE FROM citas');
      for (const cita of citas) {
        if (cita.locales) {
          await db.runAsync(
            'INSERT OR REPLACE INTO locales (id, nombre, ubicacion, imagen_url) VALUES (?, ?, ?, ?);',
            [cita.locales.id, cita.locales.nombre, cita.locales.ubicacion, cita.locales.imagen_url]
          );
        }
        await db.runAsync(
          'INSERT OR REPLACE INTO citas (id, local_id, fecha_hora, estado) VALUES (?, ?, ?, ?);',
          [cita.id, cita.local_id, cita.fecha_hora, cita.estado]
        );
      }
    }

    // ¡Disparar el motor de notificaciones!
    await schedulePaymentReminders();

    return true;
  } catch (error) {
    console.error('Error en la sincronización Offline-First:', error);
    return false;
  }
};

// Función para leer los pagos locales formateados para la UI
// Modifica el mapeo de getLocalPayments para devolver el estado original y calcular días de mora
export const getLocalPayments = async (): Promise<any[]> => {
  const db = await getLocalDb();
  const rows = await db.getAllAsync(`
    SELECT p.*, l.nombre as local_nombre 
    FROM pagos p
    JOIN contratos c ON p.contrato_id = c.id
    JOIN locales l ON c.local_id = l.id
    ORDER BY p.fecha_vencimiento ASC;
  `);

  return rows.map((r: any) => {
    const dueDate = new Date(r.fecha_vencimiento);
    const now = new Date();
    // Normalizamos fechas para no contar horas
    dueDate.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    
    let daysLate = 0;
    if (r.estado === 'pendiente' && now > dueDate) {
      const diffTime = Math.abs(now.getTime() - dueDate.getTime());
      daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const penalty = daysLate * 30; // 30 Soles por día
    const finalAmount = Number(r.monto) + penalty;

    return {
      id: r.id,
      contractName: r.local_nombre,
      amount: Number(r.monto),
      penalty: penalty,
      daysLate: daysLate,
      totalAmount: finalAmount,
      currency: r.moneda,
      dueDate: r.fecha_vencimiento,
      status: r.estado || 'pendiente',
      isPaid: r.estado === 'pagado' || r.estado === 'en_revision' // Si está en revisión, lo quitamos del total pendiente
    };
  });
};

// Nueva función para registrar el pago
export const submitPayment = async (pagoId: string, voucherUrl: string, montoFinal: number) => {
  const db = await getLocalDb();
  
  // 1. Actualizar Supabase
  const { error } = await supabase
    .from('pagos')
    .update({ estado: 'en_revision', voucher_url: voucherUrl, monto_final_pagado: montoFinal })
    .eq('id', pagoId);

  if (error) throw error;

  // 2. Actualizar localmente para UI instantánea
  await db.runAsync(`UPDATE pagos SET estado = 'en_revision' WHERE id = ?`, [pagoId]);
  return true;
};

export const getLocalActiveContract = async () => {
  const db = await getLocalDb();
  const countResult = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) as total FROM contratos WHERE estado = 'activo';`
  );

  const activeContracts = await db.getAllAsync<any>(`
    SELECT c.id, c.estado, c.documento_url, l.nombre, l.ubicacion, l.imagen_url 
    FROM contratos c
    JOIN locales l ON c.local_id = l.id
    WHERE c.estado = 'activo'
  `);

  return {
    activeCount: countResult?.total || 0,
    contractData: activeContracts || []
  };
};

export const getLocalAppointments = async (): Promise<any[]> => {
  const db = await getLocalDb();
  const rows = await db.getAllAsync(`
    SELECT c.*, l.nombre as local_nombre, l.imagen_url as local_imagen
    FROM citas c
    LEFT JOIN locales l ON c.local_id = l.id
    ORDER BY c.fecha_hora ASC;
  `);
  return rows;
};

// Motor de Notificaciones Automáticas
const schedulePaymentReminders = async () => {
  try {
    // 1. Limpiamos alarmas viejas para no duplicar si el usuario recarga la app
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Prueba de Sistema QhatuFy',
        body: '¡El motor de notificaciones está funcionando perfectamente!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
      }, // Se dispara en exactamente 5 segundos
    });

    // 2. Traemos los pagos que acabamos de guardar en SQLite
    const pendingPayments = await getLocalPayments();
    const now = new Date();

    for (const payment of pendingPayments) {
      if (payment.isPaid) continue; // Si ya pagó, ignoramos

      const dueDate = new Date(payment.dueDate);
      const monedaStr = payment.currency === 'PEN' ? 'S/' : '$';

      // ALARMA 1: Aviso 2 días antes a las 9:00 AM
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 2);
      reminderDate.setHours(9, 0, 0, 0);

      if (reminderDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '¡Pago de Alquiler Próximo! 🏢',
            body: `Tu pago de ${monedaStr} ${payment.amount} para ${payment.contractName} vence el ${dueDate.toLocaleDateString()}.`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          }, // En Expo SDK 50+, se puede pasar la fecha directo o un objeto { date: reminderDate }
        });
      }

      // ALARMA 2: El mismo día del vencimiento a las 10:00 AM
      const exactDate = new Date(dueDate);
      exactDate.setHours(10, 0, 0, 0);

      if (exactDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '¡Hoy vence tu cuota! ⚠️',
            body: `Recuerda realizar el pago de ${monedaStr} ${payment.amount} para ${payment.contractName} hoy para evitar moras.`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: exactDate,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error programando notificaciones:', error);
  }
};
