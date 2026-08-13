import api from "./api";

export const getPurchases = async () => {
  const response = await api.get("/purchases");

  return response.data;
};

export const createPurchase = async (data) => {
  const response = await api.post("/purchases", data);

  return response.data;
};
