import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function RequireOwner({ children }) {
  const { token } = useStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
