// types/login.ts
export type LoginField = 'email' | 'password';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginValid {
  email: boolean;
  password: boolean;
}

export interface LoginHelperMessage {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  isFirstLogin: boolean;
  isDuplicateLogin: boolean;
}
