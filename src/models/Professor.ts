export interface ProfessorInterface {
  id: number | null;
  type: string;
  name: string;
  email: string | null;
}

export default class Professor {
  private id: number | null;
  private type: string;
  private name: string;
  private email: string | null;

  constructor(
    id: number | null,
    type: string,
    name: string,
    email: string | null,
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.email = email;
  }

  static reinstantiate(professor: ProfessorInterface | null): Professor | null {
    if (!professor) {
      return null;
    }
    return new Professor(
      professor.id,
      professor.type,
      professor.name,
      professor.email,
    );
  }

  public asObject(): ProfessorInterface {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      email: this.email,
    };
  }

  public getType(): string {
    return this.type;
  }

  public getId(): number {
    if (!this.id) {
      throw new Error("Professor ID is null");
    }
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string | null {
    return this.email;
  }
}
