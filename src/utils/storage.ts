import { Complaint } from '../types';

const STORAGE_KEY = 'sikayetimizvar_complaints_v3';
const ADMIN_AUTH_KEY = 'sikayetimizvar_admin_logged_in_v3';
const MY_COMPLAINTS_KEY = 'sikayetimizvar_my_complaint_ids_v3';

// Clear any legacy test data from prior keys
(function purgeLegacyTestData() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem('sikayetimizvar_complaints_v1');
      localStorage.removeItem('sikayetimizvar_complaints_v2');
      localStorage.removeItem('sikayetimizvar_my_complaint_ids_v1');
      localStorage.removeItem('sikayetimizvar_my_complaint_ids_v2');
    } catch (e) {
      // Ignore
    }
  }
})();

export const INITIAL_COMPLAINTS: Complaint[] = [];

export function getMyComplaintIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_COMPLAINTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading my complaint IDs:', err);
    return [];
  }
}

export function saveMyComplaintIds(ids: string[]): void {
  try {
    localStorage.setItem(MY_COMPLAINTS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Error saving my complaint IDs:', err);
  }
}

export function addMyComplaintId(id: string): void {
  const ids = getMyComplaintIds();
  if (!ids.includes(id)) {
    ids.push(id);
    saveMyComplaintIds(ids);
  }
}

export function removeMyComplaintId(id: string): void {
  const ids = getMyComplaintIds().filter((existingId) => existingId !== id);
  saveMyComplaintIds(ids);
}

export function getStoredComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const myIds = getMyComplaintIds();
    if (!raw) {
      return [];
    }
    const parsed: Complaint[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      ...item,
      isMine: myIds.includes(item.id) || !!item.isMine,
    }));
  } catch (err) {
    console.error('Error reading complaints from localStorage:', err);
    return [];
  }
}

export function saveStoredComplaints(complaints: Complaint[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.error('Error saving complaints to localStorage:', err);
  }
}

export function getAdminAuthState(): boolean {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function setAdminAuthState(isLoggedIn: boolean): void {
  if (isLoggedIn) {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

/**
 * Resets all test and live complaints to empty
 */
export function purgeAllComplaints(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MY_COMPLAINTS_KEY);
  } catch (err) {
    console.error('Error purging complaints:', err);
  }
}
