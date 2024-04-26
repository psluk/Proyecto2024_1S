import Professor from "../models/Professor";
import Student from "../models/Student";
import Group from "../models/Group";
import GroupDao from "../database/GroupDao";

export default class GroupController {
  private groupDao: GroupDao;

  constructor() {
    this.groupDao = new GroupDao();
  }

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
    students: Student[],
    professors: Professor[],
    moderator: Professor | null,
  ): { success: boolean; error?: any } {
    const group = new Group(
      null,
      groupNumber,
      classroom,
      students,
      professors,
      moderator,
    );
    return this.groupDao.addGroup(group);
  }

  public addGroups(groups: Group[]): {
    successfulInserts: Group[];
    errors: Group[];
  } {
    return this.groupDao.addGroups(groups);
  }

  /**
   * Gets a group from the database.
   * @param id The id of the group to get.
   * @returns The group with the given id.
   */
  public getGroupById(id: number): Group | null {
    return this.groupDao.getGroupById(id);
  }

  /**
   * Gets all groups from the database.
   * @returns An array of all groups.
   */
  public getGroups(): Group[] {
    return this.groupDao.getGroups();
  }

  /**
   * Updates a group in the database.
   * Throws an error if the group could not be updated.
   * @param group The group to update.
   * @returns The group that was updated.
   */
  public updateGroup(group: Group): { success: boolean; error?: any } {
    return this.groupDao.updateGroup(group);
  }

  /**
   * Deletes a group from the database.
   * Throws an error if the group could not be deleted.
   * @param id The id of the group to delete.
   */
  public deleteGroup(id: number): { success: boolean; error?: any } {
    return this.groupDao.deleteGroup(id);
  }

  /**
   * Gets all students without a group.
   * @returns An array of students without a group.
   */
  public getStudentsWithoutGroup(): Student[] {
    return this.groupDao.getStudentsWithoutGroup();
  }
  
}
