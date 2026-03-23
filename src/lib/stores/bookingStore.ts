import { create } from 'zustand';

type BookingStore = {
  selectedDate: Date | null;
  selectedTime: string | null; // "HH:MM"
  selectedServiceId: number | null;
  step: 1 | 2 | 3 | 4;
  setDate: (d: Date) => void;
  setTime: (t: string) => void;
  setService: (id: number) => void;
  setStep: (s: 1 | 2 | 3 | 4) => void;
  reset: () => void;
};

const initialState = {
  selectedDate: null as Date | null,
  selectedTime: null as string | null,
  selectedServiceId: null as number | null,
  step: 1 as const,
};

export const useBookingStore = create<BookingStore>((set) => ({
  ...initialState,
  setDate: (selectedDate) => set({ selectedDate, selectedTime: null, step: 2 }),
  setTime: (selectedTime) => set({ selectedTime, step: 3 }),
  setService: (selectedServiceId) => set({ selectedServiceId, step: 4 }),
  setStep: (step) => set({ step }),
  reset: () => set({ ...initialState }),
}));
