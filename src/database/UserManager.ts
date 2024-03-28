import { RunResult } from "better-sqlite3";
import { db } from "./DBManager";

// Function to get all users in the database
const getUsers = () => {
  try {
    const query = `SELECT * FROM Users;`;
    const readQuery = db.prepare(query);
    const rowList = readQuery.all();
    return rowList;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Functions to get users by type
const getUsersByType = (type: string) => {
  const query = `SELECT [userId], [name], [email], [password] FROM [Users] U INNER JOIN [UserTypes] UT ON U.[userTypeId] = UT.[userTypeId] WHERE UT.[typeName] = ?;`;
  const users = db.prepare(query).all(type);
  return users;
};

// Function to get a user
const getUser = (userId: number) => {
  const query =
    "SELECT [typeName] type, [userId], [name], [email], '' password FROM [Users] U INNER JOIN [UserTypes] UT ON U.[userTypeId] = UT.[userTypeId] WHERE U.[userId] = ?;";
  const user = db.prepare(query).get(userId);
  return user;
};

// Function to update a user, including their type
const updateUser = (
  userId: number,
  type: string,
  name: string,
  email: string,
  password: string,
) => {
  // Update query with a subquery to get the userTypeId from the UserTypes table
  const queryWithPassword = `
    UPDATE Users
    SET name = ?, email = ?, password = ?, userTypeId = (
      SELECT userTypeId FROM UserTypes WHERE typeName = ?
    )
    WHERE userId = ?;
  `;

  // Update query without password
  const queryWithoutPassword = `
    UPDATE Users
    SET name = ?, email = ?, userTypeId = (
      SELECT userTypeId FROM UserTypes WHERE typeName = ?
    )
    WHERE userId = ?;
  `;

  let result: RunResult;

  // If password is empty, use the query without password
  if (password.trim() === "") {
    result = db.prepare(queryWithoutPassword).run(name, email, type, userId);
  } else {
    result = db
      .prepare(queryWithPassword)
      .run(name, email, password, type, userId);
  }

  if (result.changes === 0) {
    throw new Error(
      `No user was updated, check if the userId (${userId}) exists and the type (${type}) is valid.`,
    );
  }
};

// Function to delete an user by email
const deleteUser = (email: string) => {
  const query = "DELETE FROM Users WHERE [email] = ?;";
  db.prepare(query).run(email);
};

// Function to try to login with an email and password
const login = (email: string, password: string): any => {
  // Tries to get an user with a given email and password
  const query = "SELECT * FROM Users WHERE [email] = ? AND [password] = ?;";
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
      .prepare("SELECT * FROM Users WHERE [email] = ?")
      .get(email);

    if (existingUser) {
      // Returns null if already in use
      return null;
    }

    // Inserts a new user
    const insertQuery =
      "INSERT INTO Users ([name], [email], [password], [userTypeId]) VALUES (?, ?, ?, ?);";

    const result = db.prepare(insertQuery).run(name, email, password, type);
    const userId = result.lastInsertRowid;

    const newUser = db
      .prepare("SELECT * FROM Users WHERE [userId] = ?;")
      .get(userId);

    return newUser;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

export default {
  getUsers,
  getUsersByType,
  getUser,
  updateUser,
  deleteUser,
  login,
  register,
};
