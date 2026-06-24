import api from "../lib/axios";
import { LoginResponse } from "../types/auth.types";

export const loginRequest = async (
  email: string,
  password: string,
) => {
  const { data } =
    await api.post<LoginResponse>(
      '/auth/login',
      {
        email,
        password,
      },
    );

  return data;
};