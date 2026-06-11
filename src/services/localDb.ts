import * as SQLite from 'expo-sqlite';

export const getLocalDb = async () => {
  return await SQLite.openDatabaseAsync('qhatufy_v3.db');
};

export const initLocalDb = async () => {
  const db = await getLocalDb();

  // 1. Desactivar llaves foráneas y limpiar tablas existentes
  await db.execAsync(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS pagos;
    DROP TABLE IF EXISTS contratos;
    DROP TABLE IF EXISTS locales;
    DROP TABLE IF EXISTS citas;
    PRAGMA foreign_keys = ON;
  `);

  // 2. Crear las tablas locales necesarias para el funcionamiento Offline-First
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS locales (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      ubicacion TEXT,
      imagen_url TEXT,
      precio REAL
    );
    CREATE TABLE IF NOT EXISTS contratos (
      id TEXT PRIMARY KEY NOT NULL,
      inquilino_id TEXT,
      local_id TEXT,
      estado TEXT,
      documento_url TEXT,
      FOREIGN KEY (local_id) REFERENCES locales(id)
    );
    CREATE TABLE IF NOT EXISTS pagos (
      id TEXT PRIMARY KEY,
      contrato_id TEXT,
      monto REAL NOT NULL,
      moneda TEXT,
      fecha_vencimiento TEXT NOT NULL,
      estado TEXT,
      FOREIGN KEY (contrato_id) REFERENCES contratos(id)
    );
    CREATE TABLE IF NOT EXISTS citas (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT NOT NULL,
      fecha_hora TEXT NOT NULL,
      estado TEXT DEFAULT 'PENDIENTE'
    );
  `);
};
