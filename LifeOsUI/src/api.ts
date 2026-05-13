// ============================================
// Life OS – API Client
// ============================================

import type { Task, TaskCreate, TaskUpdate, Note, NoteCreate, NoteUpdate } from './types'

const BASE_URL = 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

// ---- Tasks ----
export const api = {
  tasks: {
    list: () => request<Task[]>('/tasks/'),
    create: (data: TaskCreate) =>
      request<Task>('/tasks/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: TaskUpdate) =>
      request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
  },

  notes: {
    list: () => request<Note[]>('/notes/'),
    create: (data: NoteCreate) =>
      request<Note>('/notes/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: NoteUpdate) =>
      request<Note>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/notes/${id}`, { method: 'DELETE' }),
  },

  chat: {
    send: (message: string) =>
      request<{ response: string; status: string }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    reset: () => request<{ message: string }>('/chat/reset', { method: 'POST' }),
  },
}
