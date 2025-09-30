import React from 'react';
import { User, Bot, Clock } from 'lucide-react';
import type { Message } from '../types/api';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';

  // Función para renderizar contenido que puede incluir imágenes
  const renderMessageContent = (content: string) => {
    // Detectar si el contenido es una imagen en formato markdown
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
    const match = content.match(imageRegex);
    
    if (match) {
      const [, altText, imageUrl] = match;
      return (
        <div className="space-y-2">
          <img 
            src={imageUrl} 
            alt={altText || 'Imagen generada'}
            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // Mostrar mensaje de error si la imagen no se puede cargar
              const errorDiv = document.createElement('div');
              errorDiv.className = 'text-red-500 text-sm';
              errorDiv.textContent = 'Error al cargar la imagen';
              target.parentNode?.appendChild(errorDiv);
            }}
          />
          {altText && (
            <p className="text-xs text-gray-600 italic">
              {altText}
            </p>
          )}
        </div>
      );
    }
    
    // Si no es una imagen, renderizar como texto normal
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-green-600'}`}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-white" />
          )}
        </div>

        {/* Contenido del mensaje */}
        <div className={`px-4 py-3 rounded-lg max-w-full 
          ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 border border-gray-200'}
          ${message.loading ? 'animate-pulse' : ''}
        `}>
          {message.loading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-sm text-gray-600">Pensando...</span>
            </div>
          ) : (
            <>
              {renderMessageContent(message.content)}
            </>
          )}
          
          {/* Timestamp */}
          <div className={`flex items-center gap-1 mt-2 text-xs ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
            <Clock size={12} />
            <span>{message.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;