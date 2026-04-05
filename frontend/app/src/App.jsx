import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import RequireOwner from './components/RequireOwner';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Trees from './pages/Trees';
import TreeDetail from './pages/TreeDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Wishlist from './pages/Wishlist';
import Trending from './pages/Trending';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerTrees from './pages/owner/OwnerTrees';
import AddTree from './pages/owner/AddTree';
import EditTree from './pages/owner/EditTree';
import TreeQR from './pages/owner/TreeQR';
import useStore from './store/useStore';
import { fetchMe } from './services/api';

export default function App() {
  const token = useStore((s) => s.token);
  const setUser = useStore((s) => s.setUser);
  const logout = useStore((s) => s.logout);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchMe()
      .then((user) => { if (!cancelled) setUser(user); })
      .catch(() => { if (!cancelled) logout(); });
    return () => { cancelled = true; };
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/trees" element={<Trees />} />
              <Route path="/trees/:id" element={<TreeDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />

              <Route path="/owner" element={<RequireOwner><OwnerDashboard /></RequireOwner>} />
              <Route path="/owner/trees" element={<RequireOwner><OwnerTrees /></RequireOwner>} />
              <Route path="/owner/trees/new" element={<RequireOwner><AddTree /></RequireOwner>} />
              <Route path="/owner/trees/:id/edit" element={<RequireOwner><EditTree /></RequireOwner>} />
              <Route path="/owner/trees/:id/qr" element={<RequireOwner><TreeQR /></RequireOwner>} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
