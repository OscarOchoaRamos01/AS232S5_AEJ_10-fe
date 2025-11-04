import React, { useState, useEffect, useRef } from 'react';
import { conversationService } from '../services/chatService';
import MessageBubble from './MessageBubble';
import type { ConversationResponse, MessageResponse } from '../types/api';

// Función helper para manejar fechas en formato array o string
const parseDate = (dateValue: string | number[]): Date => {
  if (Array.isArray(dateValue)) {
    // Formato array: [2025, 11, 3, 22, 56, 10, 560000000]
    const [year, month, day, hour, minute, second, nano] = dateValue;
    // Nota: month en JavaScript es 0-indexado, pero Java es 1-indexado
    return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0, Math.floor((nano || 0) / 1000000));
  }
  // Formato string ISO normal
  return new Date(dateValue);
};

interface ConversationViewProps {
  conversation: ConversationResponse | null;
  onConversationUpdate: () => void;
  isActive?: boolean; // Indica si la conversación está activa o eliminada
}

const ConversationView: React.FC<ConversationViewProps> = ({ 
  conversation, 
  onConversationUpdate,
  isActive = true
}) => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<'CHATGPT' | 'IMAGE'>('CHATGPT');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      // Si la conversación ya tiene mensajes, usarlos
      if (conversation.messages && conversation.messages.length > 0) {
        setMessages(conversation.messages);
        scrollToBottom();
      } else {
        // Si no tiene mensajes, cargarlos desde el backend
        loadConversationMessages(conversation.conversationId);
      }
    }
  }, [conversation]);

  const loadConversationMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const fullConversation = await conversationService.getConversation(conversationId);
      setMessages(fullConversation.messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !conversation) return;

    // Validar que la conversación no esté eliminada
    if (!isActive) {
      // No hacer nada si la conversación está eliminada - ya está bloqueada visualmente
      return;
    }

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      let response: ConversationResponse;
      
      if (inputType === 'CHATGPT') {
        response = await conversationService.continueChatGptConversation(
          conversation.conversationId, 
          messageToSend
        );
      } else {
        response = await conversationService.continueImageConversation(
          conversation.conversationId, 
          messageToSend
        );
      }

      setMessages(response.messages || []);
      onConversationUpdate(); // Notificar que la conversación se actualizó
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: MessageResponse, index: number) => {
    // Convertir MessageResponse a Message para MessageBubble
    const messageForBubble = {
      id: message.id,
      type: message.type.includes('REQUEST') ? 'user' as const : 'assistant' as const,
      content: message.content,
      timestamp: parseDate(message.timestamp),
      imageUrl: message.imageUrl
    };

    return (
      <div key={`${message.id}-${index}`}>
        <MessageBubble message={messageForBubble} />
        
        {/* Mostrar errores si los hay */}
        {!message.success && message.errorMessage && (
          <div className="max-w-4xl mx-auto px-4 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{message.errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">¡Bienvenido!</h3>
          <p className="text-slate-600">Selecciona una conversación existente o crea una nueva</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Header de la conversación - FIJO */}
      <div className="border-b border-slate-200 p-4 bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-800 truncate">{conversation.title}</h2>
          <div className="flex items-center text-sm text-slate-500 mt-1">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01" />
              </svg>
              {conversation.messageCount} mensajes
            </span>
            <span className="mx-2">•</span>
            <span>Actualizado: {parseDate(conversation.updatedAt).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>

      {/* Alerta para conversaciones eliminadas - FIJO */}
      {!isActive && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 flex-shrink-0">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Esta conversación ha sido eliminada.</strong> No puedes enviar mensajes hasta que la restaures.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes - ÁREA CON SCROLL */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg font-medium">No hay mensajes aún</p>
              <p className="text-slate-400 text-sm mt-1">¡Comienza la conversación escribiendo un mensaje!</p>
            </div>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - FIJO */}
      <div className="border-t border-slate-200 bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto p-4">
          {/* Selector del tipo de mensaje */}
          <div className={`flex mb-4 space-x-2 ${!isActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <button
              onClick={() => setInputType('CHATGPT')}
              disabled={!isActive}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                inputType === 'CHATGPT' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              } ${!isActive ? 'cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              ChatGPT
            </button>
            <button
              onClick={() => setInputType('IMAGE')}
              disabled={!isActive}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                inputType === 'IMAGE' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              } ${!isActive ? 'cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Imagen
            </button>
          </div>

          {/* Input del mensaje */}
          <div className={`flex space-x-3 items-end ${!isActive ? 'opacity-50' : ''}`}>
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  !isActive 
                    ? 'Conversación eliminada - Restaura para continuar'
                    : inputType === 'CHATGPT'
                    ? 'Escribe tu pregunta para ChatGPT...'
                    : 'Describe la imagen que quieres generar...'
                }
                className={`w-full px-4 py-3 border rounded-xl resize-none transition-all ${
                  !isActive 
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed' 
                    : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
                rows={2}
                disabled={isLoading || !isActive}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || !isActive}
              className={`p-3 rounded-xl font-medium transition-all ${
                !inputMessage.trim() || isLoading || !isActive
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : inputType === 'CHATGPT'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;