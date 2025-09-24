import axios from "axios";

export type UserRole = "admin" | "warehouse" | "maintenance";

export interface LoginResponse {
  message: string;
  user?: {
    username: string;
    role: UserRole;
    id: string;
  };
}

export function login(data: { username: string; password: string }) {
  return axios.post<LoginResponse>("/api/login", data);
}
