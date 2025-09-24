import axios from "axios";

export function createSupplier({ name }: { name: string }) {
  return axios.post<{ message: string }>("/api/supplier", { name });
}

export const getSuppliers = async () => {
  const response = await axios.get("/api/suppliers");
  return response.data;
};
