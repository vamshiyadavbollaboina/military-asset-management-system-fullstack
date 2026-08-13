import api from "./api";

export const getAssignments = async () => {
  const response = await api.get("/assignments");
  return response.data;
};

export const createAssignment = async (data) => {
  const response = await api.post(
    "/assignments",
    data
  );

  return response.data;
};