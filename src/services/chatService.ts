import axios from 'axios';
import type { ChatGptResponse, ChatConversation, HistoryItem, ImageGeneratorResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:8081/api';

// Configurar axios con la URL base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  // Enviar una pregunta a ChatGPT
  async askQuestion(question: string): Promise<ChatGptResponse> {
    const response = await apiClient.post('/chatgpt/ask', question, {
      headers: {
        'Content-Type': 'text/plain', // El backend espera String directo
      },
    });
    return response.data;
  },

  // Obtener todo el historial
  async getAllHistory(): Promise<HistoryItem[]> {
    const response = await apiClient.get('/history/all');
    return response.data;
  },

  // Obtener solo historial de chat
  async getChatHistory(): Promise<ChatConversation[]> {
    const response = await apiClient.get('/history/chat');
    return response.data;
  },

  // Obtener historial de imágenes
  async getImageHistory() {
    const response = await apiClient.get('/history/images');
    return response.data;
  },

  // Generar imagen
  async generateImage(prompt: string): Promise<ImageGeneratorResponse> {
    const response = await apiClient.post('/image-generator/generate', prompt, {
      headers: {
        'Content-Type': 'text/plain', // El backend espera String directo
      },
    });
    return response.data;
  },
};

export default chatService;