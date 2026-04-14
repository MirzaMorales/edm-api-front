export interface User {
  id: number;
  name: string;
  lastname: string;
  username: string;
  password?: string;
  hash?: string | null;
  create_at?: Date;
}

export interface CreateUserDto {
  name: string;
  lastname: string;
  username: string;
  password?: string;
}

export interface UpdateUserDto {
  name?: string;
  lastname?: string;
  username?: string;
  password?: string;
}
