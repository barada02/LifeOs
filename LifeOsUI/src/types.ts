// ============================================
// Life OS – Shared Types
// ============================================

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
}

export interface TaskUpdate {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
}

export interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface NoteCreate {
  title: string
  content: string
  tags: string[]
}

export interface NoteUpdate {
  title?: string
  content?: string
  tags?: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  thinking?: boolean
}

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}
