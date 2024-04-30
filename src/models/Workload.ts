export interface WorkloadInterface {
  id: number | null;
  activityType: "course" | "research" | "special" | "administrative";
  workloadType: "normal" | "extended" | "double" | "overload" | "adHonorem";
  code: string | null;
  name: string;
  hours: number | null;
  students: number | null;
  suggestedStudents: number | null;
  groupNumber: number | null;
  workload: number;
  calculatedWorkload: number | null;
}

export default class Workload {
  private id: number | null;
  private activityType: "course" | "research" | "special" | "administrative";
  private workloadType: "normal" | "extended" | "double" | "overload" | "adHonorem";
  private code: string | null;
  private name: string;
  private hours: number | null;
  private students: number | null;
  private suggestedStudents: number | null;
  private groupNumber: number | null;
  private workload: number;
  private calculatedWorkload: number | null;

  constructor(
    id: number | null,
    activityType: "course" | "research" | "special" | "administrative",
    workloadType: "normal" | "extended" | "double" | "overload" | "adHonorem",
    code: string | null,
    name: string,
    hours: number | null,
    students: number | null,
    suggestedStudents: number | null,
    groupNumber: number | null,
    workload: number,
    calculatedWorkload: number | null
  ) {
    this.id = id;
    this.activityType = activityType;
    this.workloadType = workloadType;
    this.code = code;
    this.name = name;
    this.hours = hours;
    this.students = students;
    this.suggestedStudents = suggestedStudents;
    this.groupNumber = groupNumber;
    this.workload = workload;
    this.calculatedWorkload = calculatedWorkload;
  }

  static reinstantiate(workload: WorkloadInterface | null): Workload | null {
    if (!workload) {
      return null;
    }
    return new Workload(
      workload.id,
      workload.activityType,
      workload.workloadType,
      workload.code,
      workload.name,
      workload.hours,
      workload.students,
      workload.suggestedStudents,
      workload.groupNumber,
      workload.workload,
      workload.calculatedWorkload
    );
  }

  public asObject(): WorkloadInterface {
    return {
      id: this.id,
      activityType: this.activityType,
      workloadType: this.workloadType,
      code: this.code,
      name: this.name,
      hours: this.hours,
      students: this.students,
      suggestedStudents: this.suggestedStudents,
      groupNumber: this.groupNumber,
      workload: this.workload,
      calculatedWorkload: this.calculatedWorkload,
    };
  }

  public getId(): number | null {
    return this.id;
  }

  public getActivityType(): "course" | "research" | "special" | "administrative" {
    return this.activityType;
  }

  public getWorkloadType():
    | "normal"
    | "extended"
    | "double"
    | "overload"
    | "adHonorem" {
    return this.workloadType;
  }

  public getCode(): string | null {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getHours(): number | null {
    return this.hours;
  }

  public getStudents(): number | null {
    return this.students;
  }

  public getSuggestedStudents(): number | null {
    return this.suggestedStudents;
  }

  public getGroupNumber(): number | null {
    return this.groupNumber;
  }

  public getWorkload(): number {
    return this.workload;
  }

  public getcalculatedWorkload(): number | null {
    return this.calculatedWorkload;
  }
}
