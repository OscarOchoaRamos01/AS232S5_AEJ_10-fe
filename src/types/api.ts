// Tipos que coinciden con el backend Java

export interface ChatGptResponse {
  result: string;
  content: string;
  success: boolean;
  error?: string;
}

export interface ImageGeneratorResponse {
  image_url?: string;
  success: boolean;
  status: string;
  message?: string;
}

export interface ChatConversation {
  id: string;
  question: string;
  response: string;
  timestamp: string | number[]; // LocalDateTime from Java can be string or array [year, month, day, hour, minute, second, nanosecond]
  webAccess: boolean;
  success: boolean;
  errorMessage?: string;
}

export interface ImageGeneration {
  id: string;
  prompt: string;
  imageUrl?: string;
  timestamp: string | number[]; // LocalDateTime from Java can be string or array
  success: boolean;
  status: string;
  message?: string;
}

export interface HistoryItem {
  type: 'chat' | 'image';
  id: string;
  question?: string;
  response?: string;
  prompt?: string;
  imageUrl?: string;
  timestamp: string;
  success: boolean;
  status?: string;
  message?: string;
}

// Tipos para el estado local
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
}