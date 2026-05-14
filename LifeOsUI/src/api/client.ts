// ============================================
// Life OS – API Client (matches backend exactly)
// ============================================
import type { Task, TaskCreate, TaskUpdate, Note, NoteCreate, NoteUpdate } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ── Auth header helper ────────────────────────────────────────────────────────
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('lifeos_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Core request ─────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }

  // Handle empty responses (e.g. 204)
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ── Auth — POST /auth/signup, POST /auth/login, GET /auth/me ──────────────────
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: {
    _id: string;
    name: string;
    email: string;
    created_at: string;
  };
}

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    request<TokenResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  // FastAPI OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', email);   // FastAPI OAuth2 uses "username" field
    form.append('password', password);
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? `Login failed: ${res.status}`);
      }
      return res.json() as Promise<TokenResponse>;
    });
  },

  me: () => request<TokenResponse['user']>('/auth/me'),
};

// ── Tasks — /tasks/ ───────────────────────────────────────────────────────────
export const tasksApi = {
  list:   ()                        => request<Task[]>('/tasks/'),
  create: (data: TaskCreate)        => request<Task>('/tasks/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: TaskUpdate) => request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string)              => request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
};

// ── Notes — /notes/ ───────────────────────────────────────────────────────────
export const notesApi = {
  list:   ()                        => request<Note[]>('/notes/'),
  create: (data: NoteCreate)        => request<Note>('/notes/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: NoteUpdate) => request<Note>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string)              => request<{ message: string }>(`/notes/${id}`, { method: 'DELETE' }),
};

// ── AI — /ai/chat, /ai/clear-session ─────────────────────────────────────────
export const aiApi = {
  chat: (message: string) =>
    request<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  clearSession: () =>
    request<{ message: string }>('/ai/clear-session', { method: 'POST' }),
};
