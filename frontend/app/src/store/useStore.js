import { create } from 'zustand';

function safeGetUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
}

const useStore = create((set) => ({
  user: safeGetUser(),
  token: localStorage.getItem('token') || null,

  selectedTree: null,
  startDate: '',
  endDate: '',
  bookingPrice: null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  loginUser: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  isOwner: () => {
    const state = useStore.getState();
    return state.user?.role === 'owner';
  },

  setSelectedTree: (tree) => set({ selectedTree: tree }),
  setStartDate: (d) => set({ startDate: d }),
  setEndDate: (d) => set({ endDate: d }),
  setBookingPrice: (p) => set({ bookingPrice: p }),

  resetBooking: () =>
    set({ selectedTree: null, startDate: '', endDate: '', bookingPrice: null }),
}));

export default useStore;
