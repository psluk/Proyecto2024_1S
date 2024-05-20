import ProfessorController from "./ProfessorController";
import StudentController from "./StudentController";
import UserController from "./UserController";
import Professor, { ProfessorInterface } from "../models/Professor";
import { UserInterface } from "../models/User";
import Group, { GroupInterface } from "../models/Group";
import Student, { StudentInterface } from "../models/Student";

import GroupController from "./GroupController";
import Workload from "../models/Workload";
import { CourseInterface } from "src/models/Course";
import { OtherActivity } from "src/database/ProfessorDao";

import StudentProfessorController from "./StudentProfessorController";
import { StudentProfessorInterface } from "src/models/StudentProfessor";

export default class MainController {
  private static instance: MainController;
  private userController: UserController;
  private professorController: ProfessorController;
  private studentController: StudentController;
  private groupController: GroupController;
  private studentProfessorController: StudentProfessorController;

  private constructor() {
    this.userController = new UserController();
    this.professorController = new ProfessorController();
    this.studentController = new StudentController();
    this.groupController = new GroupController();
    this.studentProfessorController = new StudentProfessorController();

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
    this.getWorkloadByProfessorId = this.getWorkloadByProfessorId.bind(this);
    this.updateProfessor = this.updateProfessor.bind(this);
    this.deleteProfessor = this.deleteProfessor.bind(this);

    this.addStudent = this.addStudent.bind(this);
    this.importStudents = this.importStudents.bind(this);
    this.getStudentById = this.getStudentById.bind(this);
    this.getStudents = this.getStudents.bind(this);
    this.updateStudent = this.updateStudent.bind(this);
    this.deleteStudent = this.deleteStudent.bind(this);

    this.addGroup = this.addGroup.bind(this);
    this.addGroups = this.addGroups.bind(this);
    this.getGroupById = this.getGroupById.bind(this);
    this.getGroups = this.getGroups.bind(this);
    this.updateGroup = this.updateGroup.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.deleteGroups = this.deleteGroups.bind(this);
    this.getStudentsWithoutGroup = this.getStudentsWithoutGroup.bind(this);
    this.deleteProfessorFromGroups = this.deleteProfessorFromGroups.bind(this);

    this.getCourses = this.getCourses.bind(this);
    this.addCourseToWorkload = this.addCourseToWorkload.bind(this);
    this.addTFGActivityToWorkload = this.addTFGActivityToWorkload.bind(this);
    this.getOtherActivities = this.getOtherActivities.bind(this);
    this.addOtherActivityToWorkload =
      this.addOtherActivityToWorkload.bind(this);
    this.updateWorkload = this.updateWorkload.bind(this);
    this.getCalculatedWorkload = this.getCalculatedWorkload.bind(this);
    this.deleteActivity = this.deleteActivity.bind(this);

    this.getStudentsProfessors = this.getStudentsProfessors.bind(this);
    this.generateRandomAssignment = this.generateRandomAssignment.bind(this);
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
  public async importProfessors(fileBuffer: ArrayBuffer): Promise<{
    successfulInserts: ProfessorInterface[];
    errors: ProfessorInterface[];
  }> {
    const { successfulInserts, errors } =
      this.professorController.importProfessors(fileBuffer);
    await this.professorController.importCourses(fileBuffer);
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
   * Gets a professor's workload by professor ID.
   * @param professorId The ID of the professor.
   * @returns A list of workload objects for the professor.
   */
  public getWorkloadByProfessorId(professorId: number): Workload[] {
    return this.professorController.getWorkloadByProfessorId(professorId);
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

  /**
   * STUDENT CONTROLLER METHODS
   */

  /**
   * Adds a student to the database.
   * Throws an error if the student could not be added.
   * @param name The name of the student.
   * @param phone The phone of the student.
   * @param email The email of the student.
   * @param carnet The identification of the student.
   * @param enabled The enabled value of the student.
   * @returns The student that was added.
   */
  public addStudent(
    name: string,
    phone: string,
    email: string,
    carnet: string,
    enabled: boolean,
  ): StudentInterface {
    return this.studentController
      .addStudent(name, phone, email, carnet, enabled)
      .asObject();
  }

  /**
   * Imports a list of students from an Excel file.
   * @param fileBuffer The Excel file's array buffer.
   * @returns An object containing two arrays: one for the students added successfully, and another for errors.
   */
  public importStudents(fileBuffer: ArrayBuffer): {
    successfulInserts: StudentInterface[];
    errors: StudentInterface[];
  } {
    const { successfulInserts, errors } =
      this.studentController.importStudents(fileBuffer);
    return {
      successfulInserts: successfulInserts.map((student) => student.asObject()),
      errors: errors.map((student) => student.asObject()),
    };
  }

  /**
   * Gets a student from the database.
   * @param id The id of the student to get.
   * @returns The student with the given id.
   */
  public getStudentById(id: number): StudentInterface | null {
    return this.studentController.getStudentById(id)?.asObject() || null;
  }

  /**
   * Gets all students from the database.
   * @returns An array of all students.
   */
  public getStudents(): StudentInterface[] {
    return this.studentController
      .getStudents()
      .map((student) => student.asObject());
  }

  /**
   * Updates a student in the database.
   * Throws an error if the student could not be added.
   * @param id The ID of the student to update.
   * @param name The name of the student.
   * @param phoneNumber The phone number of the student.
   * @param email The email of the student.
   * @param universityId The email of the student.
   * @param isEnabled The email of the student.
   * @returns The student that was updated.
   */
  public updateStudent(
    id: number,
    name: string,
    phoneNumber: string,
    email: string,
    universityId: string,
    isEnabled: boolean,
  ): StudentInterface {
    return this.studentController
      .updateStudent(id, name, phoneNumber, email, universityId, isEnabled)
      .asObject();
  }

  /**
   * Deletes a student from the database.
   * @param id The id of the student to delete.
   */
  public deleteStudent(id: number) {
    this.studentController.deleteStudent(id);
  }

  /**
   * GROUP CONTROLLER METHODS
   */

  /**
   * Adds a group to the database.
   * Throws an error if the group could not be added.
   * @param groupNumber The number of the group.
   * @param classroom The classroom of the group.
   * @param students The students in the group.
   * @param professors The professors in the group.
   * @param moderator The moderator of the group.
   * @returns The group that was added.
   */
  public addGroup(
    groupNumber: number,
    classroom: string | null,
    students: StudentInterface[],
    professors: ProfessorInterface[],
    moderator: ProfessorInterface | null,
  ): { success: boolean; error?: any } {
    return this.groupController.addGroup(
      groupNumber,
      classroom || null,
      students.map(
        (student) =>
          new Student(
            student.studentId,
            student.name,
            student.phoneNum,
            student.email,
            student.universityId,
            student.isEnabled,
          ),
      ),
      professors.map(
        (professor) =>
          new Professor(
            professor.id,
            professor.type,
            professor.name,
            professor.email,
          ),
      ),
      moderator
        ? new Professor(
            moderator.id,
            moderator.type,
            moderator.name,
            moderator.email,
          )
        : null,
    );
  }

  /**
   * Adds a list of groups to the database.
   * @param groups The groups to add.
   * @returns An object containing two arrays: one for the groups added successfully, and another for errors.
   */
  public addGroups(groups: GroupInterface[]): {
    successfulInserts: Group[];
    errors: Group[];
  } {
    return this.groupController.addGroups(
      groups.map((group) => {
        return new Group(
          group.groupId,
          group.groupNumber,
          group.classroom,
          group.students.map(
            (student) =>
              new Student(
                student.studentId,
                student.name,
                student.phoneNum,
                student.email,
                student.universityId,
                student.isEnabled,
              ),
          ),
          group.professors.map(
            (professor) =>
              new Professor(
                professor.id,
                professor.type,
                professor.name,
                professor.email,
              ),
          ),
          group.moderator
            ? new Professor(
                group.moderator.id,
                group.moderator.type,
                group.moderator.name,
                group.moderator.email,
              )
            : null,
        );
      }),
    );
  }

  /**
   * Gets a group from the database.
   * @param id The id of the group to get.
   * @returns The group with the given id.
   */
  public getGroupById(id: number): GroupInterface | null {
    return this.groupController.getGroupById(id)?.asObject() || null;
  }

  /**
   * Gets all groups from the database.
   * @returns An array of all groups.
   */
  public getGroups(): GroupInterface[] {
    return this.groupController.getGroups().map((group) => group.asObject());
  }

  /**
   * Updates a group in the database.
   * Throws an error if the group could not be updated.
   * @param group The group to update.
   * @returns The group that was updated.
   */
  public updateGroup(
    id: number,
    groupNumber: number,
    classroom: string | null,
    students: StudentInterface[],
    professors: ProfessorInterface[],
    moderator: ProfessorInterface | null,
  ): { success: boolean; error?: any } {
    return this.groupController.updateGroup(
      new Group(
        id,
        groupNumber,
        classroom,
        students.map(
          (student) =>
            new Student(
              student.studentId,
              student.name,
              student.phoneNum,
              student.email,
              student.universityId,
              student.isEnabled,
            ),
        ),
        professors.map(
          (professor) =>
            new Professor(
              professor.id,
              professor.type,
              professor.name,
              professor.email,
            ),
        ),
        moderator
          ? new Professor(
              moderator.id,
              moderator.type,
              moderator.name,
              moderator.email,
            )
          : null,
      ),
    );
  }

  /**
   * Deletes a group from the database.
   * Throws an error if the group could not be deleted.
   * @param id The id of the group to delete.
   */
  public deleteGroup(id: number): void {
    this.groupController.deleteGroup(id);
  }

  public deleteGroups(): { success: boolean; error?: any } {
    return this.groupController.deleteGroups();
  }
  /**
   * Gets a list of students that are not in any group.
   * @returns A list of students that are not in any group.
   */
  public getStudentsWithoutGroup(): StudentInterface[] {
    return this.groupController
      .getStudentsWithoutGroup()
      .map((student) => student.asObject());
  }

  /**
   * Deletes a professor from all groups.
   * @param professorId The ID of the professor to delete.
   */
  public deleteProfessorFromGroups(professorId: number): void {
    this.groupController.deleteProfessorFromGroups(professorId);
  }

  /**
   * COURSE CONTROLLER METHODS
   */

  /**
   * Gets all professors from the database.
   * @returns An array of all professors.
   */
  public getCourses(): CourseInterface[] {
    return this.professorController
      .getCourses()
      .map((course) => course.asObject());
  }

  /**
   * Gets a list of all other activities from the database.
   * @returns A list of all other activities in the database.
   */
  getOtherActivities(): OtherActivity[] {
    return this.professorController.getOtherActivities();
  }

  /**
   * Adds a new course to the workload of a professor.
   * @param courseId id of the course to be added
   * @param courseName name of the course to be added
   * @param courseHours quantity of hours of the course
   * @param students quantity of students the course has
   * @param experienceFactor experience factor the professor has with that specific course
   * @param group group number for the course
   * @param loadType defines the type of load the course is for that professor
   * @param id id of the professor the course is added to
   */
  public addCourseToWorkload(
    courseId: number,
    courseName: string,
    courseHours: number,
    courseType: string,
    students: number,
    experienceFactor: number,
    group: number,
    loadType: number,
    id: number,
  ): void {
    return this.professorController.addCourseToWorkload(
      courseId,
      courseName,
      courseHours,
      courseType,
      students,
      experienceFactor,
      group,
      loadType,
      id,
    );
  }

  /**
   * Adds a new TFG activity to the workload of a professor.
   * @param courseId id of the course to be added
   * @param courseName name of the course to be added
   * @param courseHours quantity of hours of the course
   * @param students quantity of students the course has
   * @param loadType defines the type of load the course is for that professor
   * @param id id of the professor the course is added to
   */
  public addTFGActivityToWorkload(
    courseId: number,
    courseName: string,
    courseHours: number,
    courseType: string,
    students: number,
    loadType: number,
    id: number,
  ): void {
    return this.professorController.addTFGActivityToWorkload(
      courseId,
      courseName,
      courseHours,
      courseType,
      students,
      loadType,
      id,
    );
  }

  /**
   * Adds a new TFG activity to the workload of a professor.
   * @param activityName name of the activity to be added
   * @param activityTypeId activity type id
   * @param activityLoad the load the activity has
   * @param loadType defines the type of load the activity is for that professor
   * @param id id of the professor the activity is added to
   */
  public addOtherActivityToWorkload(
    activityName: string,
    activityTypeId: number,
    activityLoad: number,
    loadType: number,
    id: number,
  ): void {
    return this.professorController.addOtherActivityToWorkload(
      activityName,
      activityTypeId,
      activityLoad,
      loadType,
      id,
    );
  }

  /**
   * Updates the workload of a professor.
   * @param activityId ID of the activity to be updated
   * @param name Name of the activity
   * @param hours Hours of the activity
   * @param students Number of students
   * @param load Workload of the activity
   * @param workloadType Type of workload
   * @param professorId ID of the professor
   * @param groupNumber Group number
   * @param suggestedStudents Suggested number of students
   * @param courseCode Code of the course
   * @param experienceFactor Experience factor
   */
  public updateWorkload(
    activityId: number,
    name: string,
    hours: number | null,
    students: number | null,
    load: number,
    workloadType: string,
    professorId: number,
    groupNumber: number | null,
    suggestedStudents: number | null,
    courseCode: string | null,
    experienceFactor: string | null,
  ): void {
    return this.professorController.updateWorkload(
      activityId,
      name,
      hours,
      students,
      load,
      workloadType,
      professorId,
      groupNumber,
      suggestedStudents,
      courseCode,
      experienceFactor,
    );
  }

  /**
   * Gets the calculated workload for a course activity, given its parameters..
   * @param courseCode Code of the course
   * @param students Number of students
   * @param hours Number of hours
   * @param experienceFactor Experience factor
   * @param groupNumber Group number
   * @param professorId ID of the professor
   */
  public getCalculatedWorkload(
    courseCode: string,
    students: number,
    hours: number,
    experienceFactor: string,
    groupNumber: number | null,
    professorId: number,
  ): number {
    return this.professorController.getCalculatedWorkload(
      courseCode,
      students,
      hours,
      experienceFactor,
      groupNumber,
      professorId,
    );
  }

  /**
   * Deletes an activity from the workload of a professor.
   * @param activityId ID of the activity to be deleted
   */
  public deleteActivity(activityId: number): void {
    return this.professorController.deleteActivity(activityId);
  }

  /**
   * Gets all students and their professors.
   * @returns An array of StudentProfessor objects.
   */
  public getStudentsProfessors(): StudentProfessorInterface[] {
    return this.studentProfessorController
      .getStudentsProfessors()
      .map((sp) => sp.asObject());
  }

  public generateRandomAssignment(): void {
    return this.studentProfessorController.generateRandom();
  }
}
