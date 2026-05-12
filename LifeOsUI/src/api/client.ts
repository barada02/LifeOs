export const API_BASE_URL = 'http://127.0.0.1:8000';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An error occurred while fetching data');
  }

  return response.json();
}

export const api = {
  tasks: {
    getAll: () => apiRequest<any[]>('/tasks/'),
    getOne: (id: string) => apiRequest<any>(`/tasks/${id}`),
    create: (data: any) => apiRequest<any>('/tasks/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest<any>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  notes: {
    getAll: () => apiRequest<any[]>('/notes/'),
    getOne: (id: string) => apiRequest<any>(`/notes/${id}`),
    create: (data: any) => apiRequest<any>('/notes/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest<any>('/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest<any>(`/notes/${id}`, { method: 'DELETE' }),
  },
  chat: {
    send: (message: string) => apiRequest<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    }),
  },
};
