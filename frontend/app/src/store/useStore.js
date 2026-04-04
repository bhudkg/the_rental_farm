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

function safeGetCart() {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    localStorage.removeItem('cart');
    return [];
  }
}

function persistCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

const DELIVERY_FEE = 1000;

const useStore = create((set, get) => ({
  user: safeGetUser(),
  token: localStorage.getItem('token') || null,

  // ── Cart ──
  cart: safeGetCart(),
  cartDrawerOpen: false,

  addToCart: (tree) => {
    const cart = [...get().cart];
    if (cart.some((item) => item.tree.id === tree.id)) return;
    cart.push({ tree });
    persistCart(cart);
    set({ cart });
  },

  removeFromCart: (treeId) => {
    const cart = get().cart.filter((item) => item.tree.id !== treeId);
    persistCart(cart);
    set({ cart });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ cart: [] });
  },

  getCartCount: () => get().cart.length,

  getCartTotal: () =>
    get().cart.reduce(
      (sum, item) =>
        sum + (Number(item.tree.price_per_season) || 0) + DELIVERY_FEE,
      0,
    ),

  setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),

  isInCart: (treeId) => get().cart.some((item) => item.tree.id === treeId),

  // ── Wishlist (optimistic local overrides) ──
  wishlistOverrides: {},

  setWishlistOverride: (treeId, { wishlisted, count }) =>
    set((state) => ({
      wishlistOverrides: {
        ...state.wishlistOverrides,
        [treeId]: { wishlisted, count },
      },
    })),

  clearWishlistOverrides: () => set({ wishlistOverrides: {} }),

  // ── Auth ──
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
}));

export default useStore;
export { DELIVERY_FEE };
