import { db } from "./DbManager";

// Function to get all users in the database
const getUsers = () => {
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

// Function to try to login with an email and password
const login = (email: string, password: string) : any => {
  // Tries to get an user with a given email and password
  const query = "SELECT * FROM Usuario WHERE Correo = ? AND Contrasena = ?";
  const user = db.prepare(query).get(email, password);

  // Returns Null if no coincidence
  if (!user) {
    return null;
  }

  // Returns the user if found
  return user;
};

const register = (
  name: string,
  email: string,
  password: string,
  type: string,
) => {
  try {
    // Checks if user already exists
    const existingUser = db
      .prepare("SELECT * FROM Usuario WHERE Correo = ?")
      .get(email);
    if (existingUser) {
      // Returns null if already in use
      return null;
    }

    // Inserts a new user
    const insertQuery =
      "INSERT INTO Usuario (Nombre, Correo, Contrasena,IDTipoUsuario) VALUES (?, ?, ?, ?)";
    const result = db.prepare(insertQuery).run(name, email, password, type);
    const userId = result.lastInsertRowid;

    const newUser = db
      .prepare("SELECT * FROM Usuario WHERE IDUsuario = ?")
      .get(userId);

    return newUser;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

export default {
  getUsers,
  login,
  register,
};
