import api from "./api";

export const getExpenditures = async () => {
  const response = await api.get("/expenditures");
  return response.data;
};

export const createExpenditure = async (data) => {
  const response = await api.post(
    "/expenditures",
    data
  );

  return response.data;
};