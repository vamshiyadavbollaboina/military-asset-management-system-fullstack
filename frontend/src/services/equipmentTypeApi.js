import api from "./api";

export const getEquipmentTypes = async () => {
  const response = await api.get(
    "/equipment-types"
  );

  return response.data;
};