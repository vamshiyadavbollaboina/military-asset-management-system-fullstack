import api from "./api";

export const getDashboardMetrics = async (params = {}) => {
  const response = await api.get("/dashboard/metrics", {
    params,
  });

  return response.data;
}