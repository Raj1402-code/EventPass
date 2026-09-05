// IndexedDB helper for Offline-First Scan Queueing

export interface OfflineScan {
  id: string;
  attendeeId: string;
  eventId: string;
  token?: string;
  scannedAt: string;
  deviceId: string;
  status: 'pending' | 'synced';
}

const DB_NAME = 'EventCheckInOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'scans_queue';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject('IndexedDB not supported in this environment');
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Failed to open IndexedDB');

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('eventId', 'eventId', { unique: false });
        store.createIndex('scannedAt', 'scannedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveOfflineScan(scan: Omit<OfflineScan, 'id' | 'status'>): Promise<OfflineScan> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const newScan: OfflineScan = {
      ...scan,
      id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      status: 'pending'
    };

    const request = store.add(newScan);
    request.onsuccess = () => resolve(newScan);
    request.onerror = () => reject('Error saving offline scan to IndexedDB');
  });
}

export async function getPendingOfflineScans(): Promise<OfflineScan[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const allScans: OfflineScan[] = request.result || [];
      const pending = allScans.filter(s => s.status === 'pending');
      pending.sort((a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime());
      resolve(pending);
    };
    request.onerror = () => reject('Error getting offline scans from IndexedDB');
  });
}

export async function clearOfflineScan(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error deleting offline scan');
  });
}

export async function clearAllOfflineScans(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error clearing IndexedDB store');
  });
}
