import { useEffect } from 'react';
import { Home, Sparkles } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
            <Home className="w-12 h-12 text-blue-600" />
          </div>
          <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">SmartGrama</h1>
        <p className="text-blue-100">Empowering Rural Communities</p>
      </div>
    </div>
  );
}