import React, { useState, useEffect } from 'react';
import { Menu, X, RefreshCw, AlertCircle, Image } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import MessageInput from './MessageInput';
import chatService from '../services/chatService';
import type { Message, HistoryItem } from '../types/api';
import { parseTimestamp } from '../utils/dateUtils';

const ChatContainer: React.FC = () => {
  // Estados principales
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageMode, setIsImageMode] = useState(false);

  // Cargar historial al iniciar
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    
    try {
      const history = await chatService.getAllHistory();
      setHistoryItems(history);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (isLoading) return;

    // Crear mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    // Agregar mensaje del usuario inmediatamente
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      if (isImageMode) {
        // Enviar para generación de imagen
        const response = await chatService.generateImage(messageContent);
        
        // Crear mensaje de respuesta con imagen
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.success && response.image_url 
            ? `![Imagen generada](${response.image_url})` 
            : `❌ Error generando imagen: ${response.message || 'Error desconocido'}`,
          timestamp: new Date(),
          error: !response.success,
        };

        // Agregar respuesta
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Enviar consulta de chat normal
        const response = await chatService.askQuestion(messageContent);
        
        // Crear mensaje de respuesta
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.content || response.result || 'Sin respuesta',
          timestamp: new Date(),
          error: false,
        };

        // Agregar respuesta
        setMessages(prev => [...prev, assistantMessage]);
      }

      // Recargar historial
      setTimeout(() => {
        loadHistory();
      }, 1000);

    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      
      // Crear mensaje de error
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: 'Error al procesar la solicitud. Por favor, inténtalo de nuevo.',
        timestamp: new Date(),
        error: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item.id);
    
    // Mostrar la conversación en el chat
    if (item.type === 'chat' && item.question && item.response) {
      // Usar la utilidad parseTimestamp que maneja correctamente el formato del backend
      const messageDate = parseTimestamp(item.timestamp);
      
      const userMessage: Message = {
        id: `${item.id}-user`,
        type: 'user',
        content: item.question,
        timestamp: messageDate,
      };

      const assistantMessage: Message = {
        id: `${item.id}-assistant`,
        type: 'assistant',
        content: item.response,
        timestamp: messageDate,
        error: false,
      };

      setMessages([userMessage, assistantMessage]);
    } else if (item.type === 'image' && item.prompt && item.imageUrl) {
      // Manejar conversaciones de imágenes
      const messageDate = parseTimestamp(item.timestamp);
      
      const userMessage: Message = {
        id: `${item.id}-user`,
        type: 'user',
        content: item.prompt,
        timestamp: messageDate,
      };

      const assistantMessage: Message = {
        id: `${item.id}-assistant`,
        type: 'assistant',
        content: `![Imagen generada](${item.imageUrl})`,
        timestamp: messageDate,
        error: !item.success,
      };

      setMessages([userMessage, assistantMessage]);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedHistoryItem(undefined);
    setError(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {isSidebarOpen && (
        <Sidebar
          historyItems={historyItems}
          onSelectItem={handleSelectHistoryItem}
          selectedItemId={selectedHistoryItem}
          loading={isLoadingHistory}
        />
      )}

      {/* Área principal */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
              title={isSidebarOpen ? 'Ocultar historial' : 'Mostrar historial'}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <h1 className="text-xl font-semibold text-gray-900">
              OscarAi
            </h1>

            {/* Botón para alternar modo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImageMode(!isImageMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isImageMode 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={isImageMode ? 'Cambiar a modo chat' : 'Cambiar a modo imagen'}
              >
                <Image size={16} />
                {isImageMode ? 'Modo Imagen' : 'Modo Chat'}
              </button>
            </div>

            {selectedHistoryItem && (
              <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded">
                Conversación anterior
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <button
              onClick={handleNewChat}
              className="px-3 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Nueva conversación
            </button>
            
            <button
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
              title="Actualizar historial"
            >
              <RefreshCw size={16} className={isLoadingHistory ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Área de chat */}
        <ChatArea 
          messages={messages} 
          loading={isLoading}
          isImageMode={isImageMode}
        />

        {/* Input de mensajes */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          loading={isLoading}
          isImageMode={isImageMode}
        />
      </div>
    </div>
  );
};

export default ChatContainer;