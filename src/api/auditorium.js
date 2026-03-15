import { apiClient } from "./client";

export async function fetchAuditoriumById(auditoriumId) {
  const response = await apiClient.get(`/auditorium/${auditoriumId}`);
  return response.data;
}

export async function fetchAuditoriumsByIds(auditoriumIds) {
  const ids = Array.from(new Set(auditoriumIds.filter(Boolean)));
  if (!ids.length) return [];
  const response = await apiClient.get("/auditorium", {
    params: { auditorium_id: ids },
  });
  return response.data;
}
