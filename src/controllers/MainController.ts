import ProfessorController from "./ProfessorController";
import UserController from "./UserController";
import { ProfessorInterface } from "../models/Professor";
import { UserInterface } from "../models/User";

export default class MainController {
  private static instance: MainController;
  private userController: UserController;
  private professorController: ProfessorController;

  private constructor() {
    this.userController = new UserController();
    this.professorController = new ProfessorController();

    // Bind methods
    this.login = this.login.bind(this);
    this.addUser = this.addUser.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.getUserByEmail = this.getUserByEmail.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUsersByType = this.getUsersByType.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.addProfessor = this.addProfessor.bind(this);
    this.importProfessors = this.importProfessors.bind(this);
    this.getProfessorById = this.getProfessorById.bind(this);
    this.getProfessors = this.getProfessors.bind(this);
    this.updateProfessor = this.updateProfessor.bind(this);
    this.deleteProfessor = this.deleteProfessor.bind(this);
  }

  public static getInstance(): MainController {
    if (!MainController.instance) {
      MainController.instance = new MainController();
    }

    return MainController.instance;
  }

  /**
   * USER CONTROLLER METHODS
   */

  /**
   * Logs in a user.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns The user that was logged in, or null if the login failed.
   */
  public login(email: string, password: string): UserInterface | null {
    return this.userController.login(email, password)?.asObject() || null;
  }

  /**
   * Adds a new user.
   * Throws an error if the user could not be added.
   * @param name The name of the user.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns The user that was added.
   */
  public addUser(name: string, email: string, password: string): UserInterface {
    return this.userController.addUser(name, email, password).asObject();
  }

  /**
   * Gets a user from the database.
   * @param id The id of the user to get.
   * @returns The user with the given id.
   */
  public getUserById(id: number): UserInterface | null {
    return this.userController.getUserById(id)?.asObject() || null;
  }

  /**
   * Gets a user from the database by email.
   * @param email The email of the user to get.
   * @returns The user with the given email.
   */
  public getUserByEmail(email: string): UserInterface | null {
    return this.userController.getUserByEmail(email)?.asObject() || null;
  }

  /**
   * Gets a list of all users in the database.
   * @returns A list of all users in the database.
   */
  public getUsers(): UserInterface[] {
    return this.userController.getUsers().map((user) => user.asObject());
  }

  /**
   * Gets a list of all users of a specific type in the database.
   * @param type The type of user to get:
   * - "Administrator"
   * - "Professor"
   * - "Student"
   * @returns A list of all users of the given type in the database.
   */
  public getUsersByType(type: string): UserInterface[] {
    return this.userController
      .getUsersByType(type)
      .map((user) => user.asObject());
  }

  /**
   * Updates a user in the database.
   * @param id The ID of the user to update.
   * @param type The type of the user.
   * @param name The name of the user.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns
   */
  public updateUser(
    id: number,
    type: string,
    name: string,
    email: string,
    password: string,
  ): UserInterface {
    return this.userController
      .updateUser(id, type, name, email, password)
      .asObject();
  }

  /**
   * Deletes a user from the database.
   * Throws an error if the user could not be deleted.
   * @param id The id of the user to delete.
   */
  public deleteUser(id: number): void {
    this.userController.deleteUser(id);
  }

  /**
   * PROFESSOR CONTROLLER METHODS
   */

  /**
   * Adds a professor to the database.
   * Throws an error if the professor could not be added.
   * @param type The type of the professor.
   * @param name The name of the professor.
   * @param email The email of the professor.
   * @returns The professor that was added.
   */
  public addProfessor(
    type: string,
    name: string,
    email?: string | null,
  ): ProfessorInterface {
    return this.professorController.addProfessor(type, name, email).asObject();
  }

  /**
   * Imports a list of professors from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns An object containing two arrays: one for the professors added successfully, and another for errors.
   */
  public importProfessors(fileBuffer: ArrayBuffer): {
    successfulInserts: ProfessorInterface[];
    errors: ProfessorInterface[];
  } {
    const { successfulInserts, errors } =
      this.professorController.importProfessors(fileBuffer);
    return {
      successfulInserts: successfulInserts.map((professor) =>
        professor.asObject(),
      ),
      errors: errors.map((professor) => professor.asObject()),
    };
  }

  /**
   * Gets a professor from the database.
   * @param id The id of the professor to get.
   * @returns The professor with the given id.
   */
  public getProfessorById(id: number): ProfessorInterface | null {
    return this.professorController.getProfessorById(id)?.asObject() || null;
  }

  /**
   * Gets all professors from the database.
   * @returns An array of all professors.
   */
  public getProfessors(): ProfessorInterface[] {
    return this.professorController
      .getProfessors()
      .map((professor) => professor.asObject());
  }

  /**
   * Updates a professor in the database.
   * Throws an error if the professor could not be added.
   * @param id The ID of the professor to update.
   * @param type The type of the professor.
   * @param name The name of the professor.
   * @param email The email of the professor.
   * @returns The professor that was updated.
   */
  public updateProfessor(
    id: number,
    type: string,
    name: string,
    email?: string | null,
  ): ProfessorInterface {
    return this.professorController
      .updateProfessor(id, type, name, email)
      .asObject();
  }

  /**
   * Deletes a professor from the database.
   * @param id The id of the professor to delete.
   */
  public deleteProfessor(id: number) {
    this.professorController.deleteProfessor(id);
  }
}
