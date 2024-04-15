export interface UserInterface {
  id: number | null;
  type: string;
  name: string;
  email: string;
  password: string;
}

export default class User {
  private id: number | null;
  private type: string;
  private name: string;
  private email: string;
  private password: string;

  constructor(
    id: number | null,
    type: string,
    name: string,
    email: string,
    password: string,
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static reinstantiate(user: UserInterface | null): User | null {
    if (!user) {
      return null;
    }
    return new User(user.id, user.type, user.name, user.email, user.password);
  }

  public asObject(): UserInterface {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      email: this.email,
      password: this.password,
    };
  }

  public getId(): number {
    if (!this.id) {
      throw new Error("User ID is null");
    }
    return this.id;
  }

  public getType(): string {
    return this.type;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }
}
