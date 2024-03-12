import { db as _db } from "./DBManager";
const db = _db;

const getUsuarios = () => {
  try {
    const query = `SELECT * FROM Usuario`;
    const readQuery = db.prepare(query);
    const rowList = readQuery.all();
    return rowList;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Función para verificar las credenciales de inicio de sesión
const login = (nombreUsuario, contrasena) => {
  // Buscar el usuario en la base de datos por el nombre de usuario y la contraseña
  const query = "SELECT * FROM Usuario WHERE Correo = ? AND Contrasena = ?";
  const usuario = db.prepare(query).get(nombreUsuario, contrasena);

  // Si no se encuentra el usuario, devolver null
  if (!usuario) {
    return null;
  }

  // Si se encuentra el usuario, devolverlo
  return usuario;
};


module.exports = {
    getUsuarios,
    login

}
