import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { useAuth } from '@/context/AuthContext';

// O servidor Socket.IO roda no mesmo host da API, sem o prefixo /api/v1/lumioo
const SOCKET_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/api\/v1\/lumioo\/?$/, '');

let socket: Socket | null = null;
let socketToken: string | null = null;

/** Conexão única por sessão; recria se o token mudar. */
export function connectSocket(token: string): Socket {
  if (socket && socketToken === token) return socket;
  socket?.disconnect();
  // `websocket` direto evita o fallback de long-polling, que é instável no React Native
  socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'], reconnection: true });
  socketToken = token;
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}

/** Socket da sessão atual (null se deslogado) e se está conectado agora. */
export function useChatSocket() {
  const { token } = useAuth();
  const sock = useMemo(() => (token ? connectSocket(token) : null), [token]);
  const [connected, setConnected] = useState(!!sock?.connected);

  useEffect(() => {
    if (!sock) { setConnected(false); return; }
    const on = () => setConnected(true);
    const off = () => setConnected(false);
    setConnected(sock.connected);
    sock.on('connect', on);
    sock.on('disconnect', off);
    return () => { sock.off('connect', on); sock.off('disconnect', off); };
  }, [sock]);

  return { socket: sock, connected };
}
