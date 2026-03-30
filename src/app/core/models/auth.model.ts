export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

// Para el payload que extraes en el Guard de NestJS
export interface UserPayload {
  id: number;
  username: string;
  name: string;
  lastname: string;
  hash?: string;
}