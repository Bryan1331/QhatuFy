import { supabase } from './supabase';
import { getLocalDb } from './localDb';

export const syncTenantData = async (userId: string) => {
  try {
    const db = await getLocalDb();

    // 1. Descargar Contratos y Locales vinculados desde Supabase
    const { data: contratos, error: errContratos } = await supabase
      .from('contratos')
      .select('*, locales(*)')
      .eq('inquilino_id', userId);

    if (errContratos || !contratos) throw errContratos;

    // Guardar Locales y Contratos localmente
    for (const con of contratos) {
      if (con.locales) {
        await db.runAsync(
          'INSERT OR REPLACE INTO locales (id, nombre, ubicacion, imagen_url) VALUES (?, ?, ?, ?);',
          [con.locales.id, con.locales.nombre, con.locales.ubicacion, con.locales.imagen_url]
        );
      }
      await db.runAsync(
        'INSERT OR REPLACE INTO contratos (id, inquilino_id, local_id, estado) VALUES (?, ?, ?, ?);',
        [con.id, con.inquilino_id, con.local_id, con.estado]
      );
    }

    // 2. Descargar Pagos vinculados a esos contratos
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
    return true;
  } catch (error) {
    console.error('Error en la sincronización Offline-First:', error);
    return false;
  }
};

// Función para leer los pagos locales formateados para la UI
export const getLocalPayments = async (): Promise<any[]> => {
  const db = await getLocalDb();
  const rows = await db.getAllAsync(`
    SELECT p.*, l.nombre as local_nombre 
    FROM pagos p
    JOIN contratos c ON p.contrato_id = c.id
    JOIN locales l ON c.local_id = l.id
    ORDER BY p.fecha_vencimiento ASC;
  `);
  
  return rows.map((r: any) => ({
    id: r.id,
    contractName: r.local_nombre,
    amount: r.monto,
    currency: r.moneda,
    dueDate: r.fecha_vencimiento,
    isPaid: r.estado === 'pagado'
  }));
};
