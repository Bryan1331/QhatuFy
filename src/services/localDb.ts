import * as SQLite from 'expo-sqlite';

export const getLocalDb = async () => {
  return await SQLite.openDatabaseAsync('qhatufy.db');
};

export const initLocalDb = async () => {
  const db = await getLocalDb();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS locales (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      ubicacion TEXT,
      imagen_url TEXT
    );
    CREATE TABLE IF NOT EXISTS contratos (
      id TEXT PRIMARY KEY,
      inquilino_id TEXT,
      local_id TEXT,
      estado TEXT,
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
  `);
};
