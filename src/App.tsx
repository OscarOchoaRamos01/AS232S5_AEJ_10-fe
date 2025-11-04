import { useState } from 'react';
import ConversationManager from './components/ConversationManager';
import ConversationView from './components/ConversationView';
import NewConversation from './components/NewConversation';
import type { ConversationResponse } from './types/api';

function App() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [inactiveConversationIds, setInactiveConversationIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConversationSelect = (conversation: ConversationResponse, isActive?: boolean) => {
    setSelectedConversation(conversation);
    setShowNewConversation(false);
    
    // Actualizar el estado de conversaciones inactivas
    if (isActive === false) {
      setInactiveConversationIds(prev => new Set(prev).add(conversation.conversationId));
    } else if (isActive === true) {
      setInactiveConversationIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(conversation.conversationId);
        return newSet;
      });
    }
  };

  const handleConversationCreated = (conversation: ConversationResponse) => {
    setSelectedConversation(conversation);
    setShowNewConversation(false);
    // Forzar recarga de la lista de conversaciones
    setRefreshKey(prev => prev + 1);
  };

  const handleConversationUpdate = () => {
    if (selectedConversation) {
      // Recargar si es necesario
    }
  };

  // Función para determinar si una conversación está activa
  const isConversationActive = (conversationId: string): boolean => {
    return !inactiveConversationIds.has(conversationId);
  };



  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex overflow-hidden">
      {/* Sidebar empresarial - FIJO */}
      <div className="w-80 bg-white shadow-2xl border-r border-slate-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Assistant</h1>
              <p className="text-blue-100 text-sm">Conversaciones Inteligentes</p>
            </div>
          </div>
        </div>

        {/* Gestor de conversaciones */}
        <div className="flex-1 overflow-hidden">
          <ConversationManager 
            key={refreshKey}
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversation?.conversationId}
            onNewConversation={() => {
              setSelectedConversation(null);
              setShowNewConversation(true);
            }}
          />
        </div>
      </div>

      {/* Área principal de chat - Como ChatGPT - FIJO */}
      <div className="flex-1 flex flex-col bg-white h-full">
        {selectedConversation ? (
          <ConversationView 
            conversation={selectedConversation}
            onConversationUpdate={handleConversationUpdate}
            isActive={isConversationActive(selectedConversation.conversationId)}
          />
        ) : showNewConversation ? (
          <div className="h-full">
            <NewConversation onConversationCreated={handleConversationCreated} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-3">Bienvenido a AI Assistant</h2>
              <p className="text-slate-600 mb-6 max-w-md">Selecciona una conversación existente o crea una nueva para comenzar a interactuar con la inteligencia artificial.</p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Conversación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
