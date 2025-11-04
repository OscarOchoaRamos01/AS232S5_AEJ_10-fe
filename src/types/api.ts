// Tipos que coinciden con el nuevo backend de conversaciones

export interface MessageResponse {
  id: string;
  type: 'CHATGPT_REQUEST' | 'CHATGPT_RESPONSE' | 'IMAGE_REQUEST' | 'IMAGE_RESPONSE';
  content: string;
  imageUrl?: string;
  timestamp: string | number[]; // Permitir tanto string ISO como array de Java
  success: boolean;
  errorMessage?: string;
}

export interface ConversationResponse {
  conversationId: string;
  title: string;
  createdAt: string | number[]; // Permitir tanto string ISO como array de Java
  updatedAt: string | number[]; // Permitir tanto string ISO como array de Java
  messageCount: number;
  lastMessageType: string;
  messages: MessageResponse[];
}

// Para mantener compatibilidad con componentes existentes
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
  timestamp: string | number[];
  webAccess: boolean;
  success: boolean;
  errorMessage?: string;
}

export interface ImageGeneration {
  id: string;
  prompt: string;
  imageUrl?: string;
  timestamp: string | number[];
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
  timestamp: string | number[]; // Permitir tanto string ISO como array de Java
  success: boolean;
  status?: string;
  message?: string;
}

// Tipos para el estado local
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  imageUrl?: string; // Para imágenes del backend
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