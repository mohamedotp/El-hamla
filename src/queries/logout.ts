import axios from "axios";

export function logout() {
  return axios.get<{ message: string }>("/api/logout");
}
