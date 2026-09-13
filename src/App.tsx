import { useAuth } from '@/authContext';
import AuthPage from '@/AuthPage';
import AppShell from '@/AppShell';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auspost-gray-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-auspost-red flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M20 7L12 11M4 7L12 11M4 7V17L12 21M12 11V21" />
            </svg>
          </div>
          <p className="text-auspost-gray text-sm">Loading Parcel Log Pro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <AppShell />;
}
