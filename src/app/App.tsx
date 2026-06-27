import { useState } from 'react';
import { Home, User, Shield, Menu, X, Wallet, FileText, Clock, Bot } from 'lucide-react';
import ResidentDashboard from './components/ResidentDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import AdminDashboard from './components/AdminDashboard';
import SplashScreen from './components/SplashScreen';
import WalletView from './components/WalletView';
import StatusView from './components/StatusView';
import ProfileView from './components/ProfileView';
import ChatBot from './components/ChatBot';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentRole, setCurrentRole] = useState('resident');
  const [showMenu, setShowMenu] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[17px]">SmartGrama</h1>
              <p className="text-[10px] text-gray-500 capitalize">{currentRole} Portal</p>
            </div>
          </div>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2.5">
            {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Role Menu */}
      {showMenu && (
        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-2 z-40 w-48">
          <p className="text-xs text-gray-500 px-3 py-2">Switch Role</p>
          <button onClick={() => { setCurrentRole('resident'); setShowMenu(false); setCurrentTab('home'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">Resident</button>
          <button onClick={() => { setCurrentRole('officer'); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">Officer</button>
          <button onClick={() => { setCurrentRole('admin'); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">Admin</button>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-md mx-auto pb-20">
        {currentRole === 'resident' && (
          <>
            {currentTab === 'home' && <ResidentDashboard onNavigate={setCurrentTab} />}
            {currentTab === 'wallet' && <WalletView onBack={() => setCurrentTab('home')} />}
            {currentTab === 'status' && <StatusView onBack={() => setCurrentTab('home')} />}
            {currentTab === 'profile' && <ProfileView onBack={() => setCurrentTab('home')} />}
            {currentTab === 'chat' && <ChatBot onBack={() => setCurrentTab('home')} />}
          </>
        )}
        {currentRole === 'officer' && <OfficerDashboard />}
        {currentRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Bottom Tab Navigation */}
      {currentRole === 'resident' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t z-50">
          <div className="flex justify-around py-2">
            <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center text-xs ${currentTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`}>
              <Home className="w-5 h-5" /> Home
            </button>
            <button onClick={() => setCurrentTab('wallet')} className={`flex flex-col items-center text-xs ${currentTab === 'wallet' ? 'text-blue-600' : 'text-gray-500'}`}>
              <Wallet className="w-5 h-5" /> Wallet
            </button>
            <button onClick={() => setCurrentTab('status')} className={`flex flex-col items-center text-xs ${currentTab === 'status' ? 'text-blue-600' : 'text-gray-500'}`}>
              <Clock className="w-5 h-5" /> Status
            </button>
            <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center text-xs ${currentTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}>
              <User className="w-5 h-5" /> Profile
            </button>
            <button onClick={() => setCurrentTab('chat')} className={`flex flex-col items-center text-xs ${currentTab === 'chat' ? 'text-blue-600' : 'text-gray-500'}`}>
              <Bot className="w-5 h-5" /> AI Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}