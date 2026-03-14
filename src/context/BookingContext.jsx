import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const BookingContext = createContext(null);

const initialDraft = {
  movie: null,
  date: null,
  cinema: null,
  showtime: null,
  selectedSeatIds: [],
  promotion: null,
};

export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(initialDraft);

  const setMovie = useCallback((movie) => {
    setDraft((d) => ({ ...d, movie }));
  }, []);

  const setDate = useCallback((date) => {
    setDraft((d) => ({ ...d, date }));
  }, []);

  const setCinema = useCallback((cinema) => {
    setDraft((d) => ({ ...d, cinema }));
  }, []);

  const setShowtime = useCallback((showtime) => {
    setDraft((d) => ({ ...d, showtime, selectedSeatIds: [] }));
  }, []);

  const setSelectedSeatIds = useCallback((selectedSeatIds) => {
    setDraft((d) => ({ ...d, selectedSeatIds }));
  }, []);

  const setPromotion = useCallback((promotion) => {
    setDraft((d) => ({ ...d, promotion }));
  }, []);

  const resetBooking = useCallback(() => {
    setDraft(initialDraft);
  }, []);

  const totals = useMemo(() => {
    const basePrice = draft.showtime?.base_price ?? 0;
    const seatCount = draft.selectedSeatIds.length;
    const subtotal = seatCount * basePrice;

    let discount = 0;
    const promo = draft.promotion;
    if (promo && subtotal > 0) {
      if (promo.discount_type === "percentage") {
        discount = (subtotal * promo.discount_value) / 100;
      } else if (promo.discount_type === "fixed") {
        discount = promo.discount_value;
      }
      if (discount > subtotal) discount = subtotal;
    }

    const total = subtotal - discount;
    return { subtotal, discount, total };
  }, [draft.selectedSeatIds, draft.showtime, draft.promotion]);

  const value = useMemo(
    () => ({
      ...draft,
      ...totals,
      setMovie,
      setDate,
      setCinema,
      setShowtime,
      setSelectedSeatIds,
      setPromotion,
      resetBooking,
    }),
    [
      draft,
      totals,
      setMovie,
      setDate,
      setCinema,
      setShowtime,
      setSelectedSeatIds,
      setPromotion,
      resetBooking,
    ],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
