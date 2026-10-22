import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ImpactCounter from './components/ImpactCounter';
import DonorView from './components/DonorView';
import NgoView from './components/NgoView';
import VolunteerView from './components/VolunteerView';
import AuthForm from './components/AuthForm';

function MainContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <ImpactCounter setActiveTab={setActiveTab} />;

      case 'donor':
        if (!user) {
          return (
            <div className="py-10 max-w-lg mx-auto text-center space-y-4">
              <div className="text-3xl">🍲</div>
              <h2 className="text-xl font-bold text-slate-900">Sign in to Donor Portal</h2>
              <p className="text-xs text-slate-500">
                Log in as a restaurant, canteen or caterer to post surplus food.
              </p>
              <AuthForm onSuccess={() => setActiveTab('donor')} />
            </div>
          );
        }
        return <DonorView />;

      case 'ngo':
        if (!user) {
          return (
            <div className="py-10 max-w-lg mx-auto text-center space-y-4">
              <div className="text-3xl">🏢</div>
              <h2 className="text-xl font-bold text-slate-900">Sign in to NGO Portal</h2>
              <p className="text-xs text-slate-500">
                Log in as an NGO or food shelter to accept matched surplus food.
              </p>
              <AuthForm onSuccess={() => setActiveTab('ngo')} />
            </div>
          );
        }
        return <NgoView />;

      case 'volunteer':
        if (!user) {
          return (
            <div className="py-10 max-w-lg mx-auto text-center space-y-4">
              <div className="text-3xl">🛵</div>
              <h2 className="text-xl font-bold text-slate-900">Sign in to Volunteer Dispatch</h2>
              <p className="text-xs text-slate-500">
                Log in as a volunteer to pick up accepted food and deliver it.
              </p>
              <AuthForm onSuccess={() => setActiveTab('volunteer')} />
            </div>
          );
        }
        return <VolunteerView />;

      case 'auth':
        return (
          <div className="py-10">
            <AuthForm onSuccess={() => setActiveTab('home')} />
          </div>
        );

      default:
        return <ImpactCounter setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">FoodRescue Prototype</p>
        <p className="mt-1">
          Developed for academic evaluation • Roorkee Institute of Technology • B.Tech CSE 2026
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
