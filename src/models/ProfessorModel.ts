export class ProfessorModel {
  public professorId: number = 0;
  public name: string = "";
  public professorType: string = "";

  constructor(name: string, type: string) {
    this.name = name;
    this.professorType = this.mapType(type);
  }

  private mapType(type: string): string {
    const typeMapping: { [key: string]: string } = {
      "profesores de planta": "Permanent",
      "profesores iterinos": "Temporary",
      // Agregsr mapeos si hubieran
    };

    return typeMapping[type.toLowerCase()] || type;
  }
}
