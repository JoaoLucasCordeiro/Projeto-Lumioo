import { useState, useEffect } from 'react';

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Menos de 1 minuto
  if (seconds < 60) {
    return `${seconds}s atrás`;
  }

  // Menos de 1 hora
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m atrás`;
  }

  // Menos de 24 horas
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h atrás`;
  }

  // Até 3 dias
  const days = Math.floor(hours / 24);
  if (days <= 3) {
    return `${days}d atrás`;
  }

  // Mais de 3 dias, formato DD/MM/YYYY
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const useTimeAgo = (dateString: string) => {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(dateString));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(dateString));
    }, 30000); 

    return () => clearInterval(interval);
  }, [dateString]);

  return timeAgo;
};