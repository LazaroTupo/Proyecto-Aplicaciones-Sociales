export interface User {
  id: number;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}