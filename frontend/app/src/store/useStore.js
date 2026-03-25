import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,

  selectedTree: null,
  startDate: '',
  endDate: '',
  bookingPrice: null,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setSelectedTree: (tree) => set({ selectedTree: tree }),
  setStartDate: (d) => set({ startDate: d }),
  setEndDate: (d) => set({ endDate: d }),
  setBookingPrice: (p) => set({ bookingPrice: p }),

  resetBooking: () =>
    set({ selectedTree: null, startDate: '', endDate: '', bookingPrice: null }),
}));

export default useStore;
