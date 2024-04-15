import { RunResult } from "better-sqlite3";
import database from "./DatabaseProvider";
import User from "../models/User";

interface UserRow {
  id: number;
  type: string;
  name: string;
  email: string;
  password: string;
}

export default class UserDao {
  /**
   * Adds a new user.
   * Throws an error if the user could not be registered.
   * @param user The user to register.
   * @returns The user that was registered.
   */
  public addUser(user: User): User {
    const existingUser = this.getUserByEmail(user.getEmail());

    if (existingUser) {
      throw new Error(`User with email ${user.getEmail()} already exists.`);
    }

    const query = `
    INSERT INTO Users ([name], [email], [password], [userTypeId])
    VALUES (?, ?, ?, (SELECT userTypeId FROM UserTypes WHERE typeName = ?));`;

    const result = database
      .prepare(query)
      .run(user.getName(), user.getEmail(), user.getPassword(), user.getType());
    const id = result.lastInsertRowid;

    return this.getUserById(id as number) as User;
  }

  /**
   * Gets a user from the database by ID.
   * @param id The id of the user to get.
   * @returns The user with the given id.
   */
  public getUserById(id: number): User | null {
    const query = `
    SELECT [typeName] AS 'type', [userId] AS 'id', [name], [email], [password]
    FROM [Users] U
    INNER JOIN [UserTypes] UT ON U.[userTypeId] = UT.[userTypeId]
    WHERE U.[userId] = ?;`;
    const user = database.prepare(query).get(id) as UserRow;
    if (!user) {
      return null;
    }
    return new User(user.id, user.type, user.name, user.email, user.password);
  }

  /**
   * Gets a user from the database by email.
   * @param email The email of the user to get.
   * @returns The user with the given email.
   */
  public getUserByEmail(email: string): User | null {
    const query = `
    SELECT [typeName] AS 'type', [userId] AS 'id', [name], [email], [password]
    FROM [Users] U
    INNER JOIN [UserTypes] UT ON U.[userTypeId] = UT.[userTypeId]
    WHERE U.[email] = ?;`;
    const user = database.prepare(query).get(email) as UserRow;
    if (!user) {
      return null;
    }
    return new User(user.id, user.type, user.name, user.email, user.password);
  }

  /**
   * Gets a list of all users in the database.
   * @returns A list of all users in the database.
   */
  public getUsers(): User[] {
    const query = `
    SELECT [userId] AS 'id', [typeName] AS 'type', [name], [email], [password]
    FROM [Users] U
    INNER JOIN [UserTypes] UT ON U.[userTypeId] = UT.[userTypeId];`;
    const readQuery = database.prepare(query);
    const rowList = readQuery.all() as UserRow[];
    return rowList.map(
      (row) => new User(row.id, row.type, row.name, row.email, row.password),
    );
  }

  /**
   * Gets a list of all users of a specific type in the database.
   * @param type The type of user to get:
   * - "Administrator"
   * - "Professor"
   * - "Student"
   * @returns A list of all users of the given type.
   */
  public getUsersByType(type: string): User[] {
    const query = `
    SELECT [userId] AS 'id', [typeName] AS 'type', [name], [email], [password]
    FROM [Users] U
    INNER JOIN [UserTypes] UT ON U.[userTypeId] = UT.[userTypeId]
    WHERE UT.[typeName] = ?;`;
    const users = database.prepare(query).all(type) as UserRow[];
    return users.map(
      (user) =>
        new User(user.id, user.type, user.name, user.email, user.password),
    );
  }

  /**
   * Updates a user in the database.
   * Throws an error if the user could not be updated.
   * @param user The user to update.
   */
  public updateUser(user: User): User {
    const queryWithPassword = `
    UPDATE Users
    SET name = ?, email = ?, password = ?, userTypeId = (
      SELECT userTypeId FROM UserTypes WHERE typeName = ?
    )
    WHERE userId = ?;`;

    const queryWithoutPassword = `
    UPDATE Users
    SET name = ?, email = ?, userTypeId = (
      SELECT userTypeId FROM UserTypes WHERE typeName = ?
    )
    WHERE userId = ?;`;

    let result: RunResult;
    const id = user.getId() as number;
    const name = user.getName();
    const email = user.getEmail();
    const password = user.getPassword();
    const type = user.getType();

    if (password.trim() === "") {
      result = database
        .prepare(queryWithoutPassword)
        .run(name, email, type, id);
    } else {
      result = database
        .prepare(queryWithPassword)
        .run(name, email, password, type, id);
    }

    if (result.changes === 0) {
      throw new Error(`Update failed for user ID ${id}. Check user details.`);
    }

    return this.getUserById(id) as User;
  }

  /**
   * Deletes a user from the database.
   * Throws an error if the user could not be deleted.
   * @param id The ID of the user to delete.
   */
  public deleteUser(id: number): void {
    const query = "DELETE FROM Users WHERE [UserId] = ?;";
    const result = database.prepare(query).run(id);

    if (result.changes === 0) {
      throw new Error(`No user found with ID ${id} to delete.`);
    }
  }
}
