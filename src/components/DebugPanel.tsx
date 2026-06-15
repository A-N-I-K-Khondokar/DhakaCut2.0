import React, { useState, useEffect } from 'react';
import { isMockMode } from '../services/firestoreService';
import { Settings, RefreshCw, Database, Radio, X } from 'lucide-react';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [salonsCount, setSalonsCount] = useState<number>(0);
  const [hasLocalData, setHasLocalData] = useState(false);

  const checkStatus = () => {
    const salonsData = localStorage.getItem('dc_salons');
    if (salonsData) {
      try {
        const parsed = JSON.parse(salonsData);
        setSalonsCount(Array.isArray(parsed) ? parsed.length : 0);
        setHasLocalData(true);
      } catch (e) {
        setSalonsCount(0);
        setHasLocalData(false);
      }
    } else {
      setSalonsCount(0);
      setHasLocalData(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Also check on storage changes
    window.addEventListener('storage', checkStatus);
    return () => window.removeEventListener('storage', checkStatus);
  }, []);

  const handleResetLocalStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Local Storage & Session Storage cleared! Page will reload and reseed mock data.');
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          checkStatus();
          setIsOpen(true);
        }}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-full shadow-lg border border-gray-800 hover:bg-gray-800 transition-all text-xs font-semibold select-none cursor-pointer"
      >
        <Settings className="h-4 w-4 animate-spin-slow text-primary-light" />
        <span>DhakaCut Diagnostics</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-gray-950/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-gray-800 p-5 font-sans animate-fade-in">
      <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Database className="h-4.5 w-4.5 text-primary-light" />
          <h3 className="font-bold text-sm text-gray-100">App Diagnostics</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Connection Mode Status */}
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-400">Database Connection:</span>
          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            isMockMode 
              ? 'bg-green-500/20 text-green-400 border border-green-500/35' 
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/35'
          }`}>
            {isMockMode ? 'Mock (Local)' : 'Live Firebase'}
          </span>
        </div>

        {/* Local Salons Count */}
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-400">Local Salons Cache:</span>
          <span className="font-mono font-bold text-gray-200">
            {salonsCount} salons
          </span>
        </div>

        {/* Has Local Storage */}
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-400">LocalStorage Seeding:</span>
          <span className={`font-semibold ${hasLocalData ? 'text-green-400' : 'text-rose-400'}`}>
            {hasLocalData ? 'Active' : 'Missing/Corrupted'}
          </span>
        </div>

        {/* Troubleshooting Tip */}
        <div className="bg-gray-900/60 rounded p-2.5 border border-gray-800/80 text-gray-400 leading-normal text-[11px]">
          {isMockMode ? (
            <p>
              💡 If you don't see any salons, your local browser storage might be empty. Click the button below to force-seed mock data.
            </p>
          ) : (
            <p>
              ⚠️ In Live Firebase mode, the database must be created in the console and seeded first at <a href="/seed" className="text-primary-light underline hover:text-white">/seed</a>.
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleResetLocalStorage}
          className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Storage & Reseed Mock</span>
        </button>

        {isMockMode && (
          <div className="text-center pt-1 text-[10px] text-gray-500">
            Running on port {window.location.port}
          </div>
        )}
      </div>
    </div>
  );
};
