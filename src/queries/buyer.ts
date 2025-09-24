import axios from "axios";

export function createBuyer({ name }: { name: string }) {
  return axios.post<{ message: string }>("/api/buyer", { name });
}
export type Buyer = {
  id: string;
  name: string;
};
export const getBuyers = async () => {
  const response = await axios.get("/api/buyers");
  return response.data;
};