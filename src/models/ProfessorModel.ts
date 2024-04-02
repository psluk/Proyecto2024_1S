export class ProfessorModel {
  public professorId: number;
  public name: string;
  public email: string | null;
  public professorType: string;

  constructor(name: string, type: string, email?: string, id?: number) {
    this.name = name;
    this.professorType = type
    this.professorId = id || 0;
    this.email = email || null;
  }

  

  public getProfessorType(): string {
    return this.professorType;
  }

  public getProfessorId(): number {
    return this.professorId;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string | null{
    return this.email;
  }
  
 
}
