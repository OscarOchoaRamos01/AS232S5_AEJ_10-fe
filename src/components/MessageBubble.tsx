import React from 'react';
import type { Message, MessageResponse } from '../types/api';

interface MessageBubbleProps {
  message: Message | MessageResponse;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  // Funciones auxiliares para manejar ambos tipos de mensaje
  const isMessageResponse = (msg: Message | MessageResponse): msg is MessageResponse => {
    return 'type' in msg && (msg.type === 'CHATGPT_REQUEST' || msg.type === 'CHATGPT_RESPONSE' || 
           msg.type === 'IMAGE_REQUEST' || msg.type === 'IMAGE_RESPONSE');
  };

  const getMessageType = (msg: Message | MessageResponse): 'user' | 'assistant' => {
    if (isMessageResponse(msg)) {
      return msg.type.includes('REQUEST') ? 'user' : 'assistant';
    }
    return msg.type;
  };

  const getTimestamp = (msg: Message | MessageResponse): Date => {
    if (isMessageResponse(msg)) {
      // Manejar tanto formato array como string ISO
      if (Array.isArray(msg.timestamp)) {
        // Formato array: [2025, 11, 3, 22, 56, 10, 560000000]
        const [year, month, day, hour, minute, second, nano] = msg.timestamp;
        // Nota: month en JavaScript es 0-indexado, pero Java es 1-indexado
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000));
      }
      // Formato string ISO normal
      return new Date(msg.timestamp);
    }
    return msg.timestamp;
  };

  const isLoading = (msg: Message | MessageResponse): boolean => {
    return !isMessageResponse(msg) && 'loading' in msg ? msg.loading || false : false;
  };

  const getImageUrl = (msg: Message | MessageResponse): string | undefined => {
    if (isMessageResponse(msg)) {
      return msg.imageUrl;
    }
    return 'imageUrl' in msg ? msg.imageUrl : undefined;
  };

  const isUser = getMessageType(message) === 'user';

  // Función para renderizar contenido que puede incluir imágenes
  const renderMessageContent = (content: string, imageUrl?: string) => {
    // Si hay una URL de imagen del backend, mostrarla directamente
    if (imageUrl) {
      return (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-white/20 shadow-lg">
            <img 
              src={imageUrl} 
              alt="Imagen generada"
              className="max-w-full h-auto"
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
          </div>
          <p className="text-xs font-medium opacity-75">
            {content}
          </p>
        </div>
      );
    }

    // Detectar si el contenido es una imagen en formato markdown (método alternativo)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
    const match = content.match(imageRegex);
    
    if (match) {
      const [, altText, markdownImageUrl] = match;
      return (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
            <img 
              src={markdownImageUrl} 
              alt={altText || 'Imagen generada'}
              className="max-w-full h-auto"
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
          </div>
          {altText && (
            <p className="text-xs font-medium opacity-75">
              {altText}
            </p>
          )}
        </div>
      );
    }
    
    // Si no es una imagen, renderizar como texto normal
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
        {content}
      </p>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-4xl flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
            : 'bg-gradient-to-br from-slate-600 to-slate-700'
        }`}>
          {isUser ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Contenido del mensaje */}
        <div className={`px-5 py-4 rounded-2xl max-w-full shadow-sm border ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300' 
            : 'bg-white text-slate-700 border-slate-200'
        } ${isLoading(message) ? 'animate-pulse' : ''}`}>
          {isLoading(message) ? (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-slate-500 font-medium">Enviando...</span>
            </div>
          ) : (
            <>
              {renderMessageContent(message.content, getImageUrl(message))}
              {/* Timestamp */}
              <div className={`flex items-center gap-1.5 mt-3 text-xs ${
                isUser ? 'text-blue-100' : 'text-slate-400'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  {getTimestamp(message).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;