import pool from "../config/database";

export const getUsers = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id,
        matricula, 
        nombre, 
        apellido,
        estado,
        CONVERT_TZ(creado_en, @@session.time_zone, 'America/Mexico_City') as creado_en 
      FROM Usuario`
    );
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateUserState = async (id: number, state: string) => {
  try {
    const [result] = await pool.execute(
      "UPDATE Usuario SET estado = ? WHERE id = ?",
      [state, id]
    );
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createAppeal = async (id: number, description: string) => {
  try {
    const [result] = await pool.execute(
      "INSERT INTO Apelaciones (id_usuario, mensaje,resuelto,id_admin) VALUES (?,?,?,?)",
      [id, description, false, null]
    );
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAppeals = async () => {
  try {
    const [rows] = await pool.execute(`SELECT 
                A.id,
                A.mensaje,
                A.fecha,
                U.id as userId,
                U.nombre, 
                U.apellido
            FROM Apelaciones A
            JOIN Usuario U ON A.id_usuario = U.id
            WHERE A.resuelto = false`);
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateAppeal = async (
  id: number,
  description: string,
  state: string,
  adminId: number,
  userId: number
) => {
  try {
    const [result2] = await pool.execute(
      "UPDATE Usuario SET estado = ? WHERE id = ?",
      [state, userId]
    );
    const [result] = await pool.execute(
      "UPDATE Apelaciones SET mensaje_admin = ?, resuelto = ?, id_admin = ?,fecha_respuesta= CURRENT_TIMESTAMP WHERE id = ?",
      [description, true, adminId, id]
    );

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUserStatus = async (id: number): Promise<string | null> => {
  try {
    const [rows] = await pool.execute<any[]>(
      "SELECT estado FROM Usuario WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0].estado : null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
