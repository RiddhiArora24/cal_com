import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import PublicBookingPage from './components/PublicBookingPage';

export default function App() {
  const [view, setView] = useState('admin'); // 'admin' or 'public'
  const [activeSlug, setActiveSlug] = useState('');

  // Handle professional dynamic URL routing naturally
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/book/')) {
      const slug = path.split('/book/')[1];
      if (slug) {
        setActiveSlug(slug);
        setView('public');
      }
    }
  }, []);

  const navigateToPublic = (slug) => {
    window.history.pushState({}, '', `/book/${slug}`);
    setActiveSlug(slug);
    setView('public');
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/');
    setView('admin');
  };

  return (
    <div className="min-h-screen bg-[#0b0b14] text-gray-100 antialiased">
      {view === 'admin' ? (
        <div className="container mx-auto max-w-7xl p-6">
          <AdminDashboard openPublicProfile={navigateToPublic} />
        </div>
      ) : (
        <div className="container mx-auto max-w-7xl p-6">
          <PublicBookingPage eventSlug={activeSlug} navigateBack={navigateToAdmin} />
        </div>
      )}
    </div>
  );
}