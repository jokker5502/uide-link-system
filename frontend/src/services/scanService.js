import axios from 'axios';

import { API_URL } from '../config';

export const getOrCreateAnonymousId = () => {
    let id = localStorage.getItem('anonymous_user_id');
    if (!id) {
        // Fallback for non-secure contexts (HTTP) where crypto.randomUUID is unavailable
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            id = crypto.randomUUID();
        } else {
            id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        localStorage.setItem('anonymous_user_id', id);
    }
    return id;
};

// Queue for storing offline scans
const OFFLINE_QUEUE_KEY = 'offline_scans';

export const getOfflineQueueSize = () => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    return queue.length;
};

export const saveOfflineScan = (scanData) => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    queue.push(scanData);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log("OFFLINE SAVE SUCCESS. Queue Size:", queue.length);
};

export const registerScan = async (qrId, lat, long) => {
    const userId = getOrCreateAnonymousId();
    const payload = {
        qr_code_id: qrId,
        anonymous_user_id: userId,
        lat: lat,
        long: long,
        client_timestamp: new Date().toISOString()
    };

    try {
        const response = await axios.post(`${API_URL}/scan`, payload);
        return response.data;
    } catch (error) {
        // If network error, throw special error to trigger offline handling
        if (!error.response) {
            console.warn("Network error, saving offline");
            saveOfflineScan(payload);
            throw new Error("OFFLINE_SAVED");
        }
        throw error;
    }
};

export const syncOfflineScans = async () => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (queue.length === 0) return 0;

    const remaining = [];
    let syncedCount = 0;

    for (const scan of queue) {
        try {
            await axios.post(`${API_URL}/scan`, scan);
            syncedCount++;
        } catch (error) {
            console.error("Failed to sync item", scan, error);
            remaining.push(scan); // Keep it in queue if still failing
        }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return syncedCount;
};
