// Utilidades para manejo de fechas

export const parseTimestamp = (timestamp: string | number[]): Date => {
  if (!timestamp) {
    console.error('Timestamp vacío recibido');
    return new Date();
  }
  
  // Manejar formato de array del backend Java [year, month, day, hour, minute, second, nanosecond]
  if (Array.isArray(timestamp)) {
    console.log('Parseando timestamp array:', timestamp);
    
    if (timestamp.length >= 6) {
      const [year, month, day, hour, minute, second, nanosecond = 0] = timestamp;
      // Nota: JavaScript months are 0-based, Java months are 1-based
      const date = new Date(year, month - 1, day, hour, minute, second, Math.floor((nanosecond || 0) / 1000000));
      console.log('Array timestamp parseado:', timestamp, '-> Date:', date);
      return date;
    } else {
      console.error('Array timestamp con formato inválido:', timestamp);
      return new Date();
    }
  }
  
  // Manejar formato string
  if (typeof timestamp === 'string') {
    // Manejar el formato específico del backend sin zona horaria
    // "2025-08-30T19:28:41" -> asumimos que es hora local del servidor
    let dateString = timestamp;
    if (timestamp.includes('T') && !timestamp.includes('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
      // No agregamos Z para mantener la hora local
      dateString = timestamp;
    }
    
    const date = new Date(dateString);
    
    // Debug para verificar el parsing
    console.log('Parseando timestamp string:', timestamp, '-> Date:', date, 'Valid:', !isNaN(date.getTime()));
    
    // Si la fecha es inválida, retornar fecha actual pero loggear el error
    if (isNaN(date.getTime())) {
      console.error('Fecha string inválida:', timestamp);
      return new Date();
    }
    
    return date;
  }
  
  console.error('Tipo de timestamp no soportado:', typeof timestamp, timestamp);
  return new Date();
};

export const formatRelativeDate = (timestamp: string | number[]): string => {
  const date = parseTimestamp(timestamp);
  const now = new Date();
  
  // Calcular diferencia en días de manera más precisa
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffInDays = Math.floor((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log('formatRelativeDate - Timestamp:', timestamp, 'Date:', date, 'Diff days:', diffInDays);
  
  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatTime = (timestamp: string | number[]): string => {
  const date = parseTimestamp(timestamp);
  const timeString = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  console.log('formatTime - Timestamp:', timestamp, 'Date:', date, 'Time:', timeString);
  
  return timeString;
};

export const formatDateOnly = (timestamp: string | number[]): string => {
  const date = parseTimestamp(timestamp);
  const dateString = date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  console.log('formatDateOnly - Timestamp:', timestamp, 'Date:', date, 'DateString:', dateString);
  
  return dateString;
};