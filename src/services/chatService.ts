import axios from 'axios';
import type { 
  ConversationResponse, 
  ChatGptResponse, 
  ImageGeneratorResponse,
  ChatConversation,
  HistoryItem
} from '../types/api';

const API_BASE_URL = 'http://localhost:8081/api';

// Helper function to parse dates that can be either ISO strings or Java LocalDateTime arrays
const parseDate = (dateValue: string | number[] | undefined): Date | null => {
  if (!dateValue) return null;
  
  if (Array.isArray(dateValue)) {
    // Handle Java LocalDateTime array format: [year, month, day, hour, minute, second, nanosecond]
    const [year, month, day, hour, minute, second, nano] = dateValue;
    return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0, Math.floor((nano || 0) / 1000000));
  }
  
  // Handle ISO string format
  return new Date(dateValue);
};

// Configurar axios con la URL base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'text/plain',
  },
});

export const conversationService = {
  // ========================================
  // APIS PRINCIPALES (LAS 9 NUEVAS)
  // ========================================

  // API 1: ChatGPT - Nueva conversación
  async createChatGptConversation(message: string): Promise<ConversationResponse> {
    const response = await apiClient.post('/chatgpt', message);
    return response.data;
  },

  // API 2: Imágenes - Nueva conversación  
  async createImageConversation(prompt: string): Promise<ConversationResponse> {
    const response = await apiClient.post('/images', prompt);
    return response.data;
  },

  // API 3: ChatGPT - Conversación existente
  async continueChatGptConversation(conversationId: string, message: string): Promise<ConversationResponse> {
    const response = await apiClient.post(`/chatgpt/${conversationId}`, message);
    return response.data;
  },

  // API 4: Imágenes - Conversación existente
  async continueImageConversation(conversationId: string, prompt: string): Promise<ConversationResponse> {
    const response = await apiClient.post(`/images/${conversationId}`, prompt);
    return response.data;
  },

  // API 5: Ver conversación específica
  async getConversation(conversationId: string): Promise<ConversationResponse> {
    try {
      console.log(`Loading conversation: ${conversationId}`);
      const response = await apiClient.get(`/conversations/${conversationId}`);
      console.log('Conversation loaded:', response.data);
      
      // Validar la estructura de la respuesta
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error loading conversation ${conversationId}:`, error);
      throw error;
    }
  },

  // API 6: Eliminar conversación (lógico)
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/conversations/${conversationId}`);
  },

  // API 7: Restaurar conversación
  async restoreConversation(conversationId: string): Promise<void> {
    await apiClient.post(`/conversations/${conversationId}/restore`);
  },

  // API 8: Listar conversaciones activas
  async getActiveConversations(): Promise<ConversationResponse[]> {
    try {
      const response = await apiClient.get('/conversations/active');
      // Verificar que la respuesta sea un array
      if (!Array.isArray(response.data)) {
        console.warn('getActiveConversations: Response is not an array:', response.data);
        return [];
      }
      return response.data;
    } catch (error) {
      console.error('Error getting active conversations:', error);
      return [];
    }
  },

  // API 9: Listar conversaciones eliminadas
  async getInactiveConversations(): Promise<ConversationResponse[]> {
    try {
      const response = await apiClient.get('/conversations/inactive');
      // Verificar que la respuesta sea un array
      if (!Array.isArray(response.data)) {
        console.warn('getInactiveConversations: Response is not an array:', response.data);
        return [];
      }
      return response.data;
    } catch (error) {
      console.error('Error getting inactive conversations:', error);
      return [];
    }
  },

  // ========================================
  // MÉTODOS DE COMPATIBILIDAD (para no romper componentes existentes)
  // ========================================

  // Compatibilidad: Enviar pregunta a ChatGPT
  async askQuestion(question: string): Promise<ChatGptResponse> {
    try {
      const conversationResponse = await this.createChatGptConversation(question);
      
      // Validar que messages existe y es un array
      if (!conversationResponse.messages || !Array.isArray(conversationResponse.messages)) {
        return {
          result: '',
          content: '',
          success: false,
          error: 'No se recibieron mensajes en la respuesta'
        };
      }
      
      // Buscar la última respuesta del asistente
      const lastAssistantMessage = conversationResponse.messages
        .filter(msg => msg && msg.type === 'CHATGPT_RESPONSE')
        .pop();

      return {
        result: lastAssistantMessage?.content || '',
        content: lastAssistantMessage?.content || '',
        success: lastAssistantMessage?.success || false,
        error: lastAssistantMessage?.errorMessage
      };
    } catch (error) {
      console.error('Error asking question:', error);
      return {
        result: '',
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Compatibilidad: Generar imagen
  async generateImage(prompt: string): Promise<ImageGeneratorResponse> {
    try {
      const conversationResponse = await this.createImageConversation(prompt);
      
      // Validar que messages existe y es un array
      if (!conversationResponse.messages || !Array.isArray(conversationResponse.messages)) {
        return {
          image_url: undefined,
          success: false,
          status: 'error',
          message: 'No se recibieron mensajes en la respuesta'
        };
      }
      
      // Buscar la última respuesta de imagen
      const lastImageMessage = conversationResponse.messages
        .filter(msg => msg && msg.type === 'IMAGE_RESPONSE')
        .pop();

      return {
        image_url: lastImageMessage?.imageUrl,
        success: lastImageMessage?.success || false,
        status: lastImageMessage?.success ? 'success' : 'error',
        message: lastImageMessage?.errorMessage
      };
    } catch (error) {
      console.error('Error generating image:', error);
      return {
        image_url: undefined,
        success: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Compatibilidad: Obtener historial de chat
  async getChatHistory(): Promise<ChatConversation[]> {
    try {
      const conversations = await this.getActiveConversations();
      
      return conversations
        .filter(conv => conv && conv.lastMessageType === 'CHATGPT' && conv.messages && Array.isArray(conv.messages))
        .map(conv => {
          const userMessage = conv.messages.find(msg => msg && msg.type === 'CHATGPT_REQUEST');
          const assistantMessage = conv.messages.find(msg => msg && msg.type === 'CHATGPT_RESPONSE');
          
          return {
            id: conv.conversationId,
            question: userMessage?.content || '',
            response: assistantMessage?.content || '',
            timestamp: conv.updatedAt,
            webAccess: false,
            success: assistantMessage?.success || false,
            errorMessage: assistantMessage?.errorMessage
          };
        });
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  },

  // Compatibilidad: Obtener historial de imágenes  
  async getImageHistory() {
    try {
      const conversations = await this.getActiveConversations();
      
      return conversations
        .filter(conv => conv && conv.lastMessageType === 'IMAGE' && conv.messages && Array.isArray(conv.messages))
        .map(conv => {
          const userMessage = conv.messages.find(msg => msg && msg.type === 'IMAGE_REQUEST');
          const imageMessage = conv.messages.find(msg => msg && msg.type === 'IMAGE_RESPONSE');
          
          return {
            id: conv.conversationId,
            prompt: userMessage?.content || '',
            imageUrl: imageMessage?.imageUrl,
            timestamp: conv.updatedAt,
            success: imageMessage?.success || false,
            status: imageMessage?.success ? 'success' : 'error',
            message: imageMessage?.errorMessage
          };
        });
    } catch (error) {
      console.error('Error getting image history:', error);
      return [];
    }
  },

  // Compatibilidad: Obtener todo el historial
  async getAllHistory(): Promise<HistoryItem[]> {
    try {
      const conversations = await this.getActiveConversations();
      
      const history: HistoryItem[] = [];
      
      conversations.forEach(conv => {
        // Validar que conv y conv.messages existan
        if (!conv || !conv.messages || !Array.isArray(conv.messages)) {
          return; // Skip this conversation
        }

        if (conv.lastMessageType === 'CHATGPT') {
          const userMessage = conv.messages.find(msg => msg && msg.type === 'CHATGPT_REQUEST');
          const assistantMessage = conv.messages.find(msg => msg && msg.type === 'CHATGPT_RESPONSE');
          
          history.push({
            type: 'chat',
            id: conv.conversationId,
            question: userMessage?.content || '',
            response: assistantMessage?.content || '',
            timestamp: conv.updatedAt,
            success: assistantMessage?.success || false
          });
        } else if (conv.lastMessageType === 'IMAGE') {
          const userMessage = conv.messages.find(msg => msg && msg.type === 'IMAGE_REQUEST');
          const imageMessage = conv.messages.find(msg => msg && msg.type === 'IMAGE_RESPONSE');
          
          history.push({
            type: 'image',
            id: conv.conversationId,
            prompt: userMessage?.content || '',
            imageUrl: imageMessage?.imageUrl,
            timestamp: conv.updatedAt,
            success: imageMessage?.success || false,
            status: imageMessage?.success ? 'success' : 'error',
            message: imageMessage?.errorMessage
          });
        }
      });
      
      return history.sort((a: HistoryItem, b: HistoryItem) => {
        const dateA = parseDate(a.timestamp);
        const dateB = parseDate(b.timestamp);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting history:', error);
      return []; // Return empty array on error
    }
  }
};

// Exportar también como chatService para compatibilidad
export const chatService = conversationService;

export default chatService;