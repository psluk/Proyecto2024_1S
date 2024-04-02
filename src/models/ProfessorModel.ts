export class ProfessorModel {
  public professorId: number;
  public name: string;
  public email: string | null;
  public professorType: string;

  constructor(name: string, type: string, email?: string, id?: number) {
    this.name = this.toNormalCase(name);
    this.professorType = this.mapType(type);
    this.professorId = id || 0;
    this.email = email || null;
  }

  private mapType(type: string): string {
    const typeMapping: { [key: string]: string } = {
      "profesores de planta": "Permanent",
      "profesores iterinos": "Temporary",
      permanent: "De planta",
      temporary: "Interino",
      "de planta": "Permanent",
      "interino": "Temporary",
      // Agregsr mapeos si hubieran
    };

    return typeMapping[type.toLowerCase()] || type;
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
  
  private toNormalCase(input: string): string {
    return input
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}
