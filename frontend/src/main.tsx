import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './app/globals.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import AuthPage from './app/page';
import OrganizerDashboard from './app/dashboard/page';
import AttendeeDashboard from './app/attendee/page';
import ProfilePage from './app/profile/page';

function AppRouter() {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync navigation
  useEffect(() => {
    if (!user) {
      if (currentPath !== '/') {
        window.history.pushState({}, '', '/');
        setCurrentPath('/');
      }
    } else if (user.role === 'organizer' && currentPath === '/') {
      window.history.pushState({}, '', '/dashboard');
      setCurrentPath('/dashboard');
    } else if (user.role === 'attendee' && currentPath === '/') {
      window.history.pushState({}, '', '/attendee');
      setCurrentPath('/attendee');
    }
  }, [user, currentPath]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        {currentPath === '/profile' ? (
          <ProfilePage />
        ) : currentPath === '/dashboard' ? (
          <OrganizerDashboard />
        ) : currentPath === '/attendee' ? (
          <AttendeeDashboard />
        ) : (
          <AuthPage />
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
