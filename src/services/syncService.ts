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
