import React, { useState } from 'react';
import { conversationService } from '../services/chatService';
import type { ConversationResponse } from '../types/api';

interface NewConversationProps {
  onConversationCreated: (conversation: ConversationResponse) => void;
}

const NewConversation: React.FC<NewConversationProps> = ({ onConversationCreated }) => {
  const [message, setMessage] = useState('');
  const [conversationType, setConversationType] = useState<'CHATGPT' | 'IMAGE'>('CHATGPT');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateConversation = async () => {
    if (!message.trim() || isLoading) return;

    const messageToSend = message.trim();
    setIsLoading(true);

    try {
      let newConversation: ConversationResponse;

      if (conversationType === 'CHATGPT') {
        newConversation = await conversationService.createChatGptConversation(messageToSend);
      } else {
        newConversation = await conversationService.createImageConversation(messageToSend);
      }

      setMessage('');
      onConversationCreated(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateConversation();
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Nueva Conversación</h2>
          </div>
          <p className="text-slate-600">Selecciona el tipo de conversación y comienza a interactuar con la IA</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          
          {/* Selector del tipo de conversación */}
          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-4">Tipo de conversación:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setConversationType('CHATGPT')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  conversationType === 'CHATGPT'
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 text-lg">ChatGPT</div>
                    <div className="text-slate-600 text-sm">Conversación con AI inteligente</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setConversationType('IMAGE')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  conversationType === 'IMAGE'
                    ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
                    : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 text-lg">Imágenes</div>
                    <div className="text-slate-600 text-sm">Generación de imágenes con IA</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Input del mensaje inicial */}
          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-4">
              {conversationType === 'CHATGPT' ? 'Tu primera pregunta:' : 'Describe la imagen:'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                conversationType === 'CHATGPT'
                  ? 'Ejemplo: ¿Qué es la inteligencia artificial?'
                  : 'Ejemplo: Un gato jugando con una pelota en un jardín soleado'
              }
              className="w-full px-4 py-4 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Botón para crear */}
          <button
            onClick={handleCreateConversation}
            disabled={!message.trim() || isLoading}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
              !message.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : conversationType === 'CHATGPT'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {conversationType === 'CHATGPT' ? 'Iniciando conversación...' : 'Generando imagen...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {conversationType === 'CHATGPT' ? 'Iniciar Chat' : 'Generar Imagen'}
              </div>
            )}
          </button>

          {/* Ejemplos */}
          <div className={`p-6 rounded-xl border ${
            conversationType === 'CHATGPT' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="font-semibold text-slate-800">Ejemplos e inspiración:</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {conversationType === 'CHATGPT' ? (
                <>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="font-medium text-slate-700">"Explícame qué es Spring Boot"</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="font-medium text-slate-700">"¿Cómo funciona React?"</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="font-medium text-slate-700">"Ayúdame con programación"</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="font-medium text-slate-700">"Paisaje futurista con ciudades flotantes"</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="font-medium text-slate-700">"Gato astronauta en el espacio"</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="font-medium text-slate-700">"Casa moderna en la playa"</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewConversation;