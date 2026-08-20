"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../utils/useRouter';
import { API_URL } from '../../config';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import { generateClientTotpToken, getTimeRemainingSeconds } from '../../utils/totpClient';
import { Ticket, ShieldAlert, CheckCircle2, Clock, Calendar, MapPin, RefreshCw, KeyRound, Sparkles, Plus, Trash2, Users } from 'lucide-react';

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  attendee_name: string;
  attendee_email: string;
  totp_secret: string;
  status: 'registered' | 'checked_in';
  checked_in_at: string | null;
  event_title: string;
  event_date: string;
  event_location: string;
  event_capacity: number;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  checked_in_count: number;
  is_group_event: boolean;
  min_group_size: number | null;
  max_group_size: number | null;
  registration_deadline: string | null;
}

export default function AttendeeDashboard() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [availableEvents, setAvailableEvents] = useState<EventItem[]>([]);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const [totpToken, setTotpToken] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [groupRegEvent, setGroupRegEvent] = useState<EventItem | null>(null);
  const [groupMembers, setGroupMembers] = useState<{name: string, email: string}[]>([]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'attendee')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Fetch My Registrations & All Available Events
  const fetchData = async () => {
    if (!token) return;
    try {
      const [regRes, evtRes] = await Promise.all([
        fetch(`${API_URL}/events/my/registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const regData = await regRes.json();
      const evtData = await evtRes.json();

      if (regRes.ok && regData.registrations) {
        setRegistrations(regData.registrations);
        if (regData.registrations.length > 0 && !selectedReg) {
          setSelectedReg(regData.registrations[0]);
        }
      }

      if (evtRes.ok && evtData.events) {
        setAvailableEvents(evtData.events);
      }
    } catch (e) {
      console.error('Error fetching attendee data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Dynamic TOTP Rotation Effect (30s interval timer)
  useEffect(() => {
    if (!selectedReg) return;

    const updateTotp = async () => {
      const now = Date.now();
      const tokenStr = await generateClientTotpToken(selectedReg.totp_secret, now);
      const secondsLeft = getTimeRemainingSeconds(now);
      
      setTotpToken(tokenStr);
      setTimeRemaining(secondsLeft);
    };

    updateTotp();
    const interval = setInterval(updateTotp, 1000);

    return () => clearInterval(interval);
  }, [selectedReg]);

  // Redraw QR code only when TOTP token changes
  useEffect(() => {
    if (!selectedReg || !totpToken || !qrCanvasRef.current) return;

    const qrPayload = JSON.stringify({
      attendeeId: selectedReg.id,
      eventId: selectedReg.event_id,
      token: totpToken
    });

    QRCode.toCanvas(qrCanvasRef.current, qrPayload, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff'
      }
    }, (err) => {
      if (err) console.error('QR code generation error:', err);
    });
  }, [totpToken, selectedReg]);

  // Initiate Registration (Check if group or single)
  const initiateRegistration = (evt: EventItem) => {
    if (evt.is_group_event) {
      setGroupRegEvent(evt);
      setGroupMembers([{ name: user?.name || '', email: user?.email || '' }]);
    } else {
      handleRegister(evt.id, null);
    }
  };

  // Register for event handler
  const handleRegister = async (eventId: string, members: {name: string, email: string}[] | null) => {
    setRegisteringId(eventId);
    try {
      const res = await fetch(`${API_URL}/events/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, groupMembers: members })
      });

      if (res.ok) {
        setGroupRegEvent(null);
        await fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Registration failed');
      }
    } catch (e) {
      console.error('Registration error:', e);
    } finally {
      setRegisteringId(null);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <span>My Event Passes</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Anti-Screenshot Enabled
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Your dynamic entry tickets rotate every 30 seconds to prevent unauthorized sharing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Registered Events List & Browse */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-pink-400" />
              <span>Registered Passes</span>
            </h2>

            {registrations.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500">
                You haven't registered for any events yet. Browse events below!
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedReg(reg)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedReg?.id === reg.id
                        ? 'bg-pink-500/10 border-pink-500/50 shadow-lg shadow-pink-500/10'
                        : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-white">{reg.event_title}</h3>
                      {reg.status === 'checked_in' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Checked In
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ready to Scan
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        {reg.event_location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Browse & Register for Available Events */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Discover Events</span>
            </h2>

            <div className="space-y-3">
              {availableEvents.map((evt) => {
                const isAlreadyRegistered = registrations.some(r => r.event_id === evt.id);
                return (
                  <div key={evt.id} className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        {evt.title}
                        {evt.is_group_event && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Group
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {evt.location} • Cap: {evt.capacity}
                        {evt.registration_deadline && (
                          <> • <span className={new Date(evt.registration_deadline) < new Date() ? "text-red-400 font-semibold" : "text-amber-400"}>
                            Closes: {new Date(evt.registration_deadline).toLocaleDateString()}
                          </span></>
                        )}
                      </p>
                    </div>

                    {isAlreadyRegistered ? (
                      <span className="text-xs text-emerald-400 font-semibold px-3 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        Registered
                      </span>
                    ) : (evt.registration_deadline && new Date(evt.registration_deadline) < new Date()) ? (
                      <span className="text-xs text-red-400 font-semibold px-3 py-1 bg-red-500/10 rounded-xl border border-red-500/20">
                        Closed
                      </span>
                    ) : (
                      <button
                        onClick={() => initiateRegistration(evt)}
                        disabled={registeringId === evt.id}
                        className="gradient-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50"
                      >
                        {registeringId === evt.id ? 'Registering...' : 'Get Pass'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Anti-Screenshot Dynamic QR Code Pass */}
        <div className="lg:col-span-7">
          {selectedReg ? (
            <div className="glass-card p-8 rounded-3xl border border-pink-500/30 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
              {/* Background glow */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Event Header */}
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-pink-400">Official Entry Pass</span>
                <h2 className="text-2xl font-black text-white mt-1">{selectedReg.event_title}</h2>
                <p className="text-xs text-gray-400 mt-1">{selectedReg.event_location}</p>
              </div>

              {/* Anti-Screenshot Alert Banner */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Anti-Screenshot Protection Active • Rotates every 30s</span>
              </div>

              {/* QR Code Canvas Card */}
              <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-pink-500/20 relative group">
                <canvas ref={qrCanvasRef} className="rounded-2xl" />
              </div>

              {/* 30-Second Rotation Progress Ring */}
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1 text-gray-300">
                    <KeyRound className="w-3.5 h-3.5 text-pink-400" />
                    Token Hash: <strong className="font-mono text-white">{totpToken}</strong>
                  </span>
                  <span className="text-pink-400 font-bold">{timeRemaining}s remaining</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeRemaining / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Attendee Metadata Footer */}
              <div className="w-full pt-4 border-t border-gray-800 grid grid-cols-2 text-left text-xs gap-4">
                <div>
                  <span className="text-gray-500 block">Attendee Name</span>
                  <span className="font-bold text-white">{selectedReg.attendee_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Ticket Status</span>
                  <span className={`font-bold uppercase ${selectedReg.status === 'checked_in' ? 'text-emerald-400' : 'text-pink-400'}`}>
                    {selectedReg.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center border border-gray-800 space-y-4">
              <Ticket className="w-12 h-12 text-gray-500 mx-auto" />
              <h3 className="text-xl font-bold text-white">No Pass Selected</h3>
              <p className="text-xs text-gray-400">Select a pass from your registered list on the left to view your live dynamic QR code.</p>
            </div>
          )}
        </div>
      </div>

      {/* Group Registration Modal */}
      {groupRegEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-gray-700 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Group Registration
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {groupRegEvent.title} allows group registrations. 
                {groupRegEvent.min_group_size ? ` Min: ${groupRegEvent.min_group_size}` : ''}
                {groupRegEvent.max_group_size ? ` Max: ${groupRegEvent.max_group_size}` : ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {groupMembers.map((member, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                  <div className="font-bold text-gray-500 text-xs w-4">{idx + 1}.</div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      required
                      value={member.name}
                      onChange={(e) => {
                        const newM = [...groupMembers];
                        newM[idx].name = e.target.value;
                        setGroupMembers(newM);
                      }}
                      className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={member.email}
                      onChange={(e) => {
                        const newM = [...groupMembers];
                        newM[idx].email = e.target.value;
                        setGroupMembers(newM);
                      }}
                      className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  {idx > 0 && (
                    <button
                      onClick={() => setGroupMembers(groupMembers.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (groupRegEvent.max_group_size && groupMembers.length >= groupRegEvent.max_group_size) {
                    alert(`Maximum group size of ${groupRegEvent.max_group_size} reached.`);
                    return;
                  }
                  setGroupMembers([...groupMembers, { name: '', email: '' }]);
                }}
                className="w-full py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setGroupRegEvent(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-400 hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRegister(groupRegEvent.id, groupMembers)}
                disabled={registeringId === groupRegEvent.id}
                className="flex-1 gradient-btn py-2.5 rounded-xl text-xs font-bold text-white shadow-lg disabled:opacity-50"
              >
                {registeringId === groupRegEvent.id ? 'Registering...' : 'Register Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
