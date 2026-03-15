import { apiClient } from "./client";

// Returns seat_ids held by OTHER users for this showtime (yours are excluded)
export async function fetchHeldSeatIds(showtimeId, currentUserId) {
  const response = await apiClient.get("/seat_holds", {
    params: { showtime_id: showtimeId, exclude_user_id: currentUserId },
  });
  return response.data; // number[]
}

// Hold (or refresh) the given seats for this user.
// Returns 409 with conflicting_seat_ids if any seat is held by someone else.
export async function holdSeats({ userId, showtimeId, seatIds }) {
  const response = await apiClient.post("/seat_holds", {
    user_id: userId,
    showtime_id: showtimeId,
    seat_ids: seatIds,
  });
  return response.data;
}

// Release all active holds for this user + showtime
export async function releaseHolds({ userId, showtimeId }) {
  const response = await apiClient.delete("/seat_holds", {
    data: { user_id: userId, showtime_id: showtimeId },
  });
  return response.data;
}
