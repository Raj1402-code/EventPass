"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, WifiOff, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { saveOfflineScan } from '@/lib/indexedDB';
const API_URL = "/api";

interface QRScannerModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: any) => void;
}

export function QRScannerModal({ eventId, isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const { token } = useAuth();
  const [manualInput, setManualInput] = useState('');
  const [manualTotp, setManualTotp] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'offline';
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize HTML5 QR Code Scanner
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          videoConstraints: { facingMode: "environment" }
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          handleScannedPayload(decodedText);
        },
        (error) => {
          // ignore scan errors per frame
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  const processCheckIn = async (attendeeId: string, qrToken?: string) => {
    setLoading(true);
    setStatusMessage(null);

    const scanTimestamp = new Date().toISOString();
    const isOnline = navigator.onLine;

    if (!isOnline) {
      // OFFLINE MODE: Store scan in IndexedDB
      try {
        await saveOfflineScan({
          attendeeId,
          eventId,
          token: qrToken,
          scannedAt: scanTimestamp,
          deviceId: 'camera-scanner-client'
        });

        setStatusMessage({
          type: 'offline',
          text: `Offline Mode: Scan for ticket ${attendeeId.substring(0, 8)} stored locally in IndexedDB. Will sync when reconnected!`
        });
        onScanSuccess({ offline: true, attendeeId });
      } catch (err) {
        setStatusMessage({
          type: 'error',
          text: 'Failed to save offline scan to IndexedDB.'
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // ONLINE MODE: Send to Backend API
    try {
      const res = await fetch(`${API_URL}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attendeeId,
          eventId,
          token: qrToken,
          scannedAt: scanTimestamp,
          deviceId: 'camera-scanner-client'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Check-in failed.');
      }

      setStatusMessage({
        type: 'success',
        text: `Checked in ${data.attendee?.attendee_name || 'Attendee'} successfully!`
      });

      onScanSuccess(data);
    } catch (err: any) {
      if (err.message.includes('Failed to fetch') || !navigator.onLine) {
        // Network drop during fetch -> save offline
        await saveOfflineScan({
          attendeeId,
          eventId,
          token: qrToken,
          scannedAt: scanTimestamp,
          deviceId: 'camera-scanner-client'
        });
        setStatusMessage({
          type: 'offline',
          text: 'Network connection lost. Scan cached offline in IndexedDB.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: err.message || 'Check-in failed.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScannedPayload = (payloadStr: string) => {
    try {
      const parsed = JSON.parse(payloadStr);
      if (parsed.attendeeId) {
        processCheckIn(parsed.attendeeId, parsed.token);
      } else {
        setStatusMessage({ type: 'error', text: 'Invalid QR code format.' });
      }
    } catch (e) {
      // Raw attendee ID scan
      processCheckIn(payloadStr.trim(), manualTotp);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processCheckIn(manualInput.trim(), manualTotp.trim() || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-gray-700 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl gradient-btn text-white">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Scan Attendee Ticket</h3>
            <p className="text-xs text-gray-400">Position QR code in camera view or enter ticket code below</p>
          </div>
        </div>

        {/* Camera Container */}
        <div className="rounded-xl overflow-hidden bg-black/60 border border-gray-800 mb-4 min-h-[260px]">
          <div id="qr-reader-container" className="w-full text-white text-xs" />
        </div>

        {/* Status Message Overlay */}
        {statusMessage && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : statusMessage.type === 'offline'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            {statusMessage.type === 'offline' && <WifiOff className="w-4 h-4 flex-shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Manual Fallback Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-3 pt-2 border-t border-gray-800">
          <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Manual Code Entry</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Attendee ID (e.g. att_123)"
              className="glass-input px-3.5 py-2 rounded-xl text-xs"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={manualTotp}
                onChange={(e) => setManualTotp(e.target.value)}
                placeholder="60s TOTP Token"
                className="glass-input px-3.5 py-2 rounded-xl text-xs flex-1"
              />
              <button
                type="submit"
                disabled={loading || !manualInput.trim()}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Check In'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
