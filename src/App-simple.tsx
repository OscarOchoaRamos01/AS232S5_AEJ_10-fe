import { useState } from 'react';
import ChatContainer from './components/ChatContainer';
import ImageGeneratorContainer from './components/ImageGeneratorContainer';
import HistoryContainer from './components/HistoryContainer';
import './App.css';

type Feature = 'chat' | 'image' | 'history';

function App() {
  const [activeFeature, setActiveFeature] = useState<Feature>('chat');

  const renderFeature = () => {
    switch (activeFeature) {
      case 'chat':
        return <ChatContainer />;
      case 'image':
        return <ImageGeneratorContainer />;
      case 'history':
        return <HistoryContainer />;
      default:
        return <ChatContainer />;
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden text-white bg-gray-900">
      {/* Header con navegación */}
      <div className="flex justify-center p-4 bg-gray-800 border-b border-gray-600">
        <button
          className={`px-4 py-2 mx-2 rounded transition-all ${
            activeFeature === 'chat' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          onClick={() => setActiveFeature('chat')}
        >
          🤖 Chat
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded transition-all ${
            activeFeature === 'image' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          onClick={() => setActiveFeature('image')}
        >
          🖼️ Imagen
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded transition-all ${
            activeFeature === 'history' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          onClick={() => setActiveFeature('history')}
        >
          📋 Historial
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4 overflow-hidden">
        {renderFeature()}
      </div>
    </div>
  );
}

export default App;