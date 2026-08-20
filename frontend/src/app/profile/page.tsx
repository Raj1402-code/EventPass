import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { CalendarDays, History, UserCircle, Mail, Hash, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/events/my/registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setRegistrations(data.registrations || []);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  const now = new Date();
  const upcomingEvents = registrations.filter(r => new Date(r.event_date) >= now);
  const pastEvents = registrations.filter(r => new Date(r.event_date) < now);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="glass-card rounded-3xl p-6 border border-gray-800 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-24 h-24 rounded-full gradient-btn flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <UserCircle className="w-12 h-12 text-white" />
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-3">
          <h1 className="text-3xl font-extrabold text-white">{user?.name}</h1>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/50 border border-gray-800 text-xs text-gray-300 font-medium">
              <Mail className="w-4 h-4 text-indigo-400" />
              {user?.email}
            </div>
            {user?.reg_no && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/50 border border-gray-800 text-xs text-gray-300 font-medium">
                <Hash className="w-4 h-4 text-pink-400" />
                {user.reg_no}
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium uppercase tracking-wider">
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="glass-card rounded-3xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
              <span className="ml-auto bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full font-bold">
                {upcomingEvents.length}
              </span>
            </div>
            
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No upcoming events registered.</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map(reg => (
                  <div key={reg.id} className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
                    <h3 className="text-sm font-bold text-white mb-2">{reg.event_title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(reg.event_date).toLocaleDateString()}
                      </div>
                      <div className={`px-2 py-0.5 rounded-full font-semibold ${
                        reg.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {reg.status === 'checked_in' ? 'Checked In' : 'Pending Check-in'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Events */}
          <div className="glass-card rounded-3xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
              <div className="p-2 rounded-xl bg-gray-800 text-gray-400">
                <History className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Previous Events</h2>
              <span className="ml-auto bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full font-bold">
                {pastEvents.length}
              </span>
            </div>
            
            {pastEvents.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No past events found.</p>
            ) : (
              <div className="space-y-4">
                {pastEvents.map(reg => (
                  <div key={reg.id} className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800 opacity-80 hover:opacity-100 transition-opacity">
                    <h3 className="text-sm font-bold text-white mb-2">{reg.event_title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(reg.event_date).toLocaleDateString()}
                      </div>
                      <div className={`px-2 py-0.5 rounded-full font-semibold ${
                        reg.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {reg.status === 'checked_in' ? 'Attended' : 'Missed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
