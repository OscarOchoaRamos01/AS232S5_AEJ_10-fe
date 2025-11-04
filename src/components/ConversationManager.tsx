import React, { useState, useEffect } from 'react';
import { conversationService } from '../services/chatService';
import type { ConversationResponse } from '../types/api';

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

interface ConversationManagerProps {
  onConversationSelect: (conversation: ConversationResponse, isActive?: boolean) => void;
  selectedConversationId?: string;
  onNewConversation?: () => void;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({ 
  onConversationSelect, 
  selectedConversationId,
  onNewConversation
}) => {
  const [activeConversations, setActiveConversations] = useState<ConversationResponse[]>([]);
  const [inactiveConversations, setInactiveConversations] = useState<ConversationResponse[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const [active, inactive] = await Promise.all([
        conversationService.getActiveConversations(),
        conversationService.getInactiveConversations()
      ]);
      setActiveConversations(active);
      setInactiveConversations(inactive);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await conversationService.deleteConversation(conversationId);
      await loadConversations(); // Recargar listas
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleRestoreConversation = async (conversationId: string) => {
    try {
      await conversationService.restoreConversation(conversationId);
      await loadConversations(); // Recargar listas
    } catch (error) {
      console.error('Error restoring conversation:', error);
    }
  };

  const renderConversation = (conversation: ConversationResponse, isActive: boolean) => (
    <div
      key={conversation.conversationId}
      className={`p-4 mb-2 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selectedConversationId === conversation.conversationId
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
      onClick={() => onConversationSelect(conversation, isActive)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
            conversation.lastMessageType === 'CHATGPT' ? 'bg-green-500' : 
            conversation.lastMessageType === 'IMAGE' ? 'bg-purple-500' : 'bg-blue-500'
          }`} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">
              {conversation.title}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" />
                </svg>
                {conversation.messageCount} mensajes
              </span>
              <span>•</span>
              <span>
                {parseDate(conversation.updatedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1 ml-2">
          {isActive ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteConversation(conversation.conversationId);
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Eliminar conversación"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreConversation(conversation.conversationId);
              }}
              className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
              title="Restaurar conversación"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-300 mb-1">
        {conversation.lastMessageType} • {conversation.messageCount} mensajes
      </div>
      
      <div className="text-xs text-gray-400">
        {parseDate(conversation.updatedAt).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-slate-500 text-sm">Cargando conversaciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Botón Nueva Conversación */}
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={() => onNewConversation?.()}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Conversación
        </button>
      </div>

      {/* Header con toggle */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Conversaciones</h2>
        <button
          onClick={() => setShowInactive(!showInactive)}
          className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            showInactive 
              ? 'bg-red-50 text-red-700 hover:bg-red-100' 
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {showInactive ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminadas
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Activas
            </>
          )}
        </button>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {showInactive ? (
          <>
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wide px-3 mb-4">
              Eliminadas ({inactiveConversations.length})
            </div>
            {inactiveConversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No hay conversaciones eliminadas</p>
              </div>
            ) : (
              inactiveConversations.map(conversation => 
                renderConversation(conversation, false)
              )
            )}
          </>
        ) : (
          <>
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wide px-3 mb-4">
              Activas ({activeConversations.length})
            </div>
            {activeConversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium mb-1">No hay conversaciones aún</p>
                <p className="text-slate-400 text-sm">¡Comienza una nueva conversación!</p>
              </div>
            ) : (
              activeConversations.map(conversation => 
                renderConversation(conversation, true)
              )
            )}
          </>
        )}
      </div>

      {/* Botón para recargar */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={loadConversations}
          className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border border-slate-200 text-slate-600 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar</span>
        </button>
      </div>
    </div>
  );
};

export default ConversationManager;