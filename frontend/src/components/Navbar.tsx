"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Wifi, WifiOff, LogOut, Ticket, LayoutDashboard, RefreshCw } from 'lucide-react';
import { getPendingOfflineScans } from '../utils/indexedDB';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingScansCount, setPendingScansCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkOfflineCount = async () => {
      try {
        const pending = await getPendingOfflineScans();
        setPendingScansCount(pending.length);
      } catch (e) {}
    };

    checkOfflineCount();
    const interval = setInterval(checkOfflineCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!user) return null;

  return (
    <header className="glass-card sticky top-0 z-40 border-b border-gray-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight gradient-text">EventPass</span>
            <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Realtime & Offline
            </span>
          </div>
        </div>

        {/* Network & Role Badges */}
        <div className="flex items-center gap-4">
          {/* Online / Offline Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode</span>
              </>
            )}
          </div>

          {/* Pending Offline Sync Badge */}
          {pendingScansCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{pendingScansCount} Pending Sync</span>
            </div>
          )}

          {/* User Role Pill */}
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/profile');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            title="Go to Profile"
            className="flex items-center gap-2 bg-gray-800/80 px-3.5 py-1.5 rounded-full border border-gray-700 hover:bg-gray-700/80 transition-colors"
          >
            {user.role === 'organizer' ? (
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
            ) : (
              <Ticket className="w-4 h-4 text-pink-400" />
            )}
            <span className="text-sm font-medium text-gray-200">{user.name}</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              user.role === 'organizer'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
            }`}>
              {user.role}
            </span>
          </button>

          {/* Home/Dashboard Button */}
          <button
            onClick={() => {
              window.history.pushState({}, '', user.role === 'organizer' ? '/dashboard' : '/attendee');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Home"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
