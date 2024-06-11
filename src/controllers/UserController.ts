import UserDao from "../database/UserDao";
import User from "../models/User";

export default class UserController {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  /**
   * Logs in a user.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns The user that was logged in, or null if the login failed.
   */
  public login(email: string, password: string): User | null {
    const user = this.userDao.getUserByEmail(email);
    if (!user) {
      return null;
    }
    if (user.getPassword() !== password) {
      return null;
    }
    return user;
  }

  /**
   * Adds a new user.
   * Throws an error if the user could not be added.
   * @param name The name of the user.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns The user that was added.
   */
  public addUser(name: string, email: string, password: string): User {
    let type: string;

    if (email.endsWith("@itcr.ac.cr") || email.endsWith("@tec.ac.cr")) {
      type = "Professor";
    } else {
      type = "Student";
    }

    const user = new User(null, type, name, email, password);
    return this.userDao.addUser(user);
  }

  /**
   * Gets a user from the database by ID.
   * @param userId The id of the user to get.
   * @returns The user with the given id.
   */
  public getUserById(userId: number): User | null {
    return this.userDao.getUserById(userId);
  }

  /**
   * Gets a user from the database by email.
   * @param email The email of the user to get.
   * @returns The user with the given email.
   */
  public getUserByEmail(email: string): User | null {
    return this.userDao.getUserByEmail(email);
  }

  /**
   * Gets a list of all users in the database.
   * @returns A list of all users in the database.
   */
  public getUsers(): User[] {
    return this.userDao.getUsers();
  }

  /**
   * Gets a list of all users of a specific type in the database.
   * @param type The type of user to get:
   * - "Administrator"
   * - "Professor"
   * - "Student"
   * @returns A list of all users of the given type in the database.
   */
  public getUsersByType(type: string): User[] {
    return this.userDao.getUsersByType(type);
  }

  /**
   * Updates a user in the database.
   * @param userId The ID of the user to update.
   * @param type The type of the user.
   * @param name The name of the user.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns
   */
  public updateUser(
    userId: number,
    type: string,
    name: string,
    email: string,
    password: string,
  ): User {
    const user = new User(userId, type, name, email, password);
    return this.userDao.updateUser(user);
  }

  /**
   * Deletes a user from the database.
   * Throws an error if the user could not be deleted.
   * @param userId The id of the user to delete.
   */
  public deleteUser(userId: number): void {
    this.userDao.deleteUser(userId);
  }
}
