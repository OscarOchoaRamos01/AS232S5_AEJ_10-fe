import React from 'react';
import { MessageSquare, Image, Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { HistoryItem } from '../types/api';
import { formatRelativeDate, formatDateOnly } from '../utils/dateUtils';

interface SidebarProps {
  historyItems: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  selectedItemId?: string;
  loading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  historyItems, 
  onSelectItem, 
  selectedItemId,
  loading = false 
}) => {


  const getItemTitle = (item: HistoryItem) => {
    if (item.type === 'chat') {
      return item.question?.substring(0, 50) + (item.question && item.question.length > 50 ? '...' : '');
    } else {
      return item.prompt?.substring(0, 50) + (item.prompt && item.prompt.length > 50 ? '...' : '');
    }
  };

  const getItemPreview = (item: HistoryItem) => {
    if (item.type === 'chat') {
      return item.response?.substring(0, 100) + (item.response && item.response.length > 100 ? '...' : '');
    } else {
      return item.message || 'Generación de imagen';
    }
  };

  // Agrupar por fecha
  const groupedItems = historyItems.reduce((groups, item) => {
    const date = formatRelativeDate(item.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 border-r flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} />
          Historial
        </h2>
        <p className="text-sm text-gray-600">
          {historyItems.length} conversaciones
        </p>
      </div>

      {/* Lista de historial */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No hay conversaciones aún</p>
            <p className="text-sm">¡Empieza una nueva conversación!</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([date, items]) => (
            <div key={date} className="mb-2">
              {/* Etiqueta de fecha */}
              <div className="px-4 py-2 bg-gray-100 border-b">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar size={14} />
                  {date}
                </div>
              </div>

              {/* Items de esta fecha */}
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`
                    p-3 cursor-pointer transition-colors duration-200 border-b border-gray-100
                    hover:bg-white
                    ${selectedItemId === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icono del tipo */}
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                      ${item.type === 'chat' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}
                    `}>
                      {item.type === 'chat' ? (
                        <MessageSquare size={12} />
                      ) : (
                        <Image size={12} />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {getItemTitle(item)}
                        </h3>
                        {/* Estado */}
                        {(item.success || 
                          (item.type === 'chat' && item.response && item.response.trim() !== '') ||
                          (item.type === 'image' && item.imageUrl)
                        ) ? (
                          <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle size={12} className="text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 overflow-hidden line-clamp-2">
                        {getItemPreview(item)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDateOnly(item.timestamp)}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aquí puedes agregar funcionalidad de eliminar
                            console.log('Eliminar item:', item.id);
                          }}
                          className="opacity-0 hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all duration-200"
                          title="Eliminar"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;