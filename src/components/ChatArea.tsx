import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from '../types/api';

interface ChatAreaProps {
  messages: Message[];
  loading?: boolean;
  isImageMode?: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, loading = false, isImageMode = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    // Pequeño delay para asegurar que el DOM se actualice
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <div 
      ref={chatAreaRef}
      className="flex-1 overflow-y-auto bg-white"
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        {messages.length === 0 ? (
          // Estado vacío - cuando no hay mensajes
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Hola! Soy OscarAi
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md">
              Puedes hacerme cualquier pregunta o pedirme ayuda con lo que necesites. 
              ¡Empecemos a conversar!
            </p>
          </div>
        ) : (
          // Mensajes existentes
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
              />
            ))}
          </>
        )}
        
        {/* Indicadores de carga */}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-3xl flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isImageMode ? 'bg-purple-600' : 'bg-green-600'
              }`}>
                {isImageMode ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 8a3 3 0 016 0v4a3 3 0 11-6 0V8zm8.83 2.21a.75.75 0 00-1.46.37 4.5 4.5 0 11-8.74 0 .75.75 0 00-1.46-.37 6 6 0 1011.66 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="bg-gray-100 border px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {isImageMode ? '🎨 Generando imagen...' : 'OscarAi está escribiendo...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Elemento para el scroll automático */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;