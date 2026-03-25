import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function RequireOwner({ children }) {
  const { token, user } = useStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'owner') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-500 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
        <p className="text-gray-500 mb-6">You need an owner account to access this section.</p>
        <a href="/login" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors inline-block">
          Sign up as Owner
        </a>
      </div>
    );
  }

  return children;
}
