"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthContext';
import { QRScannerModal } from '@/components/QRScannerModal';
import { AIInsightsWidget } from '@/components/AIInsightsWidget';
import { 
  Users, CheckCircle2, Clock, Download, Camera, Plus, Search, 
  RefreshCw, Sparkles, Calendar, MapPin, AlertCircle, ShieldAlert
} from 'lucide-react';
import { getPendingOfflineScans, clearOfflineScan } from '../../utils/indexedDB';
const API_URL = "/api";

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  checked_in_count: number;
  registration_deadline: string | null;
}

interface Attendee {
  id: string;
  attendee_name: string;
  attendee_email: string;
  status: 'registered' | 'checked_in';
  checked_in_at: string | null;
  created_at: string;
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'registered'>('all');

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState(100);
  const [isGroupEvent, setIsGroupEvent] = useState(false);
  const [minGroupSize, setMinGroupSize] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState('');
  const [newRegDeadline, setNewRegDeadline] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Event State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCapacity, setEditCapacity] = useState(100);
  const [editRegDeadline, setEditRegDeadline] = useState('');

  const [syncingOffline, setSyncingOffline] = useState(false);
  // Fetch Organizer's Events
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'organizer')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchEvents = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.events) {
        setEvents(data.events);
        if (data.events.length > 0 && !selectedEventId) {
          setSelectedEventId(data.events[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching events:', e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  // Fetch Event Details & Attendees when selectedEventId changes
  const fetchEventDetails = async (id: string) => {
    if (!token || !id) return;
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveEvent(data.event);
        setAttendees(data.attendees || []);
      }
    } catch (e) {
      console.error('Error fetching event details:', e);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchEventDetails(selectedEventId);

      const interval = setInterval(() => {
        fetchEventDetails(selectedEventId);
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedEventId, token]);

  // Create Event Handler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newLocation || !newCapacity) return;

    setCreateLoading(true);
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          date: newDate,
          location: newLocation,
          capacity: newCapacity,
          isGroupEvent,
          minGroupSize: minGroupSize ? parseInt(minGroupSize, 10) : null,
          maxGroupSize: maxGroupSize ? parseInt(maxGroupSize, 10) : null,
          registrationDeadline: newRegDeadline ? new Date(newRegDeadline).toISOString() : null
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        setNewDate('');
        setNewLocation('');
        setNewCapacity(100);
        setIsGroupEvent(false);
        setMinGroupSize('');
        setMaxGroupSize('');
        setNewRegDeadline('');
        await fetchEvents();
        if (data.event) {
          setSelectedEventId(data.event.id);
        }
      }
    } catch (e) {
      console.error('Create event error:', e);
    } finally {
      setCreateLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = () => {
    if (!activeEvent) return;
    setEditTitle(activeEvent.title);
    setEditDesc(activeEvent.description || '');
    const dateObj = new Date(activeEvent.date);
    setEditDate(new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16));
    setEditLocation(activeEvent.location);
    setEditCapacity(activeEvent.capacity);
    if (activeEvent.registration_deadline) {
      const rdObj = new Date(activeEvent.registration_deadline);
      setEditRegDeadline(new Date(rdObj.getTime() - (rdObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16));
    } else {
      setEditRegDeadline('');
    }
    setIsEditModalOpen(true);
  };

  // Handle Edit Event
  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !editTitle || !editDate || !editLocation || !editCapacity) return;
    
    setCreateLoading(true);
    try {
      const res = await fetch(`${API_URL}/events/${activeEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          date: new Date(editDate).toISOString(),
          location: editLocation,
          capacity: editCapacity,
          registrationDeadline: editRegDeadline ? new Date(editRegDeadline).toISOString() : null
        })
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        await fetchEvents();
        fetchEventDetails(activeEvent.id);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Update failed');
      }
    } catch (e) {
      console.error('Update event error:', e);
    } finally {
      setCreateLoading(false);
    }
  };

  // Sync Offline Scans Handler
  const handleSyncOfflineScans = async () => {
    setSyncingOffline(true);
    try {
      const pendingScans = await getPendingOfflineScans();
      if (pendingScans.length === 0) {
        setSyncingOffline(false);
        return;
      }

      const res = await fetch(`${API_URL}/checkin/sync-offline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scans: pendingScans })
      });

      if (res.ok) {
        for (const scan of pendingScans) {
          await clearOfflineScan(scan.id);
        }
        if (selectedEventId) {
          fetchEventDetails(selectedEventId);
        }
      }
    } catch (e) {
      console.error('Error syncing offline scans:', e);
    } finally {
      setSyncingOffline(false);
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!selectedEventId || !token) return;
    window.open(`${API_URL}/events/${selectedEventId}/export?token=${token}`, '_blank');
  };

  if (isLoading || !user) return null;

  const checkedInCount = activeEvent ? activeEvent.checked_in_count : 0;
  const capacity = activeEvent ? activeEvent.capacity : 100;
  const percentCheckedIn = capacity > 0 ? Math.min(100, Math.round((checkedInCount / capacity) * 100)) : 0;

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = 
      a.attendee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.attendee_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && a.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Event Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-card p-6 rounded-3xl border border-gray-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <span>Organizer Dashboard</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live Real-Time
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage check-ins, view live capacity telemetry, and run AI insights</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Event Dropdown Selector */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="glass-input px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-purple-500"
          >
            {events.length === 0 ? (
              <option value="">No events created yet</option>
            ) : (
              events.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-gray-900 text-white">
                  {evt.title} ({evt.checked_in_count}/{evt.capacity})
                </option>
              ))
            )}
          </select>

          {/* Create Event Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {activeEvent ? (
        <>
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Registered */}
            <div className="glass-card p-6 rounded-2xl border border-gray-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Registered</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white">{attendees.length}</div>
              <div className="text-xs text-gray-500 mt-1">Registered tickets for this event</div>
            </div>

            {/* Total Checked In */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Checked In</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-400">{checkedInCount}</div>
              <div className="text-xs text-emerald-500/80 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Socket Updates Active</span>
              </div>
            </div>

            {/* Capacity Limit */}
            <div className="glass-card p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Capacity Fill</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white">{percentCheckedIn}%</div>
              <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentCheckedIn}%` }}
                />
              </div>
            </div>

            {/* Offline Sync Status */}
            <div className="glass-card p-6 rounded-2xl border border-amber-500/20 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Offline Sync</span>
                <button
                  onClick={handleSyncOfflineScans}
                  disabled={syncingOffline}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                  title="Flush Offline Scans"
                >
                  <RefreshCw className={`w-5 h-5 ${syncingOffline ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div>
                <div className="text-xs text-gray-300 font-medium">Earliest Scan Wins Sync</div>
                <button
                  onClick={handleSyncOfflineScans}
                  disabled={syncingOffline}
                  className="mt-2 text-xs text-amber-400 underline font-semibold cursor-pointer hover:text-amber-300"
                >
                  {syncingOffline ? 'Syncing queued scans...' : 'Flush IndexedDB Queue Now'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Insights Section */}
          <AIInsightsWidget eventId={selectedEventId} />

          {/* Action Toolbar & Attendee Table */}
          <div className="glass-card rounded-3xl p-6 border border-gray-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Attendee Directory</h2>
                <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
                  {filteredAttendees.length} records
                </span>
              </div>

              {/* Action Buttons: Scanner & Export CSV */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={openEditModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 flex items-center gap-2 transition-all"
                >
                  <span>Edit Event</span>
                </button>

                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch Camera Scanner</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by attendee name or email..."
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('checked_in')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'checked_in' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Checked In
                </button>
                <button
                  onClick={() => setStatusFilter('registered')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'registered' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Registered
                </button>
              </div>
            </div>

            {/* Attendees Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900/90 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Attendee Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Checked-In Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 bg-gray-950/30">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No attendees match the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-gray-900/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{att.attendee_name}</td>
                        <td className="px-6 py-4 text-gray-300">{att.attendee_email}</td>
                        <td className="px-6 py-4 font-mono text-gray-400 text-[11px]">{att.id}</td>
                        <td className="px-6 py-4">
                          {att.status === 'checked_in' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              Registered
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono">
                          {att.checked_in_at
                            ? new Date(att.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center border border-gray-800 space-y-4">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Event Selected</h3>
          <p className="text-xs text-gray-400">Create a new event or select an existing event from the dropdown to start managing check-ins.</p>
        </div>
      )}

      {/* Camera Scanner Modal */}
      <QRScannerModal
        eventId={selectedEventId}
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={() => {
          if (selectedEventId) fetchEventDetails(selectedEventId);
        }}
      />

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-gray-700 shadow-2xl relative space-y-4">
            <h3 className="text-xl font-bold text-white">Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Tech Summit 2026"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Main stage keynote and developer breakout sessions..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Capacity Limit</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(parseInt(e.target.value, 10))}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Grand Ballroom / Online"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Registration Deadline (Optional)</label>
                <input
                  type="datetime-local"
                  value={newRegDeadline}
                  onChange={(e) => setNewRegDeadline(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isGroupEvent"
                  checked={isGroupEvent}
                  onChange={(e) => setIsGroupEvent(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="isGroupEvent" className="text-xs font-semibold text-gray-300 cursor-pointer">
                  This is a Group Registration Event
                </label>
              </div>

              {isGroupEvent && (
                <div className="grid grid-cols-2 gap-2 bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Min Group Size</label>
                    <input
                      type="number"
                      min={1}
                      value={minGroupSize}
                      onChange={(e) => setMinGroupSize(e.target.value)}
                      placeholder="Optional"
                      className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Max Group Size</label>
                    <input
                      type="number"
                      min={1}
                      value={maxGroupSize}
                      onChange={(e) => setMaxGroupSize(e.target.value)}
                      placeholder="Optional"
                      className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 gradient-btn py-2.5 rounded-xl text-xs font-bold text-white shadow-lg disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-gray-700 shadow-2xl relative space-y-4">
            <h3 className="text-xl font-bold text-white">Edit Event</h3>
            <form onSubmit={handleEditEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Capacity Limit</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(parseInt(e.target.value, 10))}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Registration Deadline (Optional)</label>
                <input
                  type="datetime-local"
                  value={editRegDeadline}
                  onChange={(e) => setEditRegDeadline(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 gradient-btn py-2.5 rounded-xl text-xs font-bold text-white shadow-lg disabled:opacity-50"
                >
                  {createLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
