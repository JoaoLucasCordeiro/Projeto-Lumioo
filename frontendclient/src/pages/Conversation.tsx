import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { io, Socket } from 'socket.io-client';
import { Sidebar } from '@/components/shared/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  type Conversation,
  type Message,
} from '@/api/conversations';
import { fetchProfileByUsername } from '@/api/profile';
import { queryKeys } from '@/api/queryKeys';
import {
  MessageSquare,
  Search,
  Send,
  Plus,
  X,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = API_URL.replace('/api/v1/lumioo', '');

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffH = (now.getTime() - date.getTime()) / 3_600_000;
  if (diffH < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffH < 168) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

function lastPreview(conv: Conversation) {
  if (!conv.messages.length) return 'Inicie uma conversa';
  const t = conv.messages[0].text;
  return t.length > 45 ? t.slice(0, 45) + '…' : t;
}

// ─── Nova conversa dialog ───────────────────────────────────────────────────
interface NewConvDialogProps {
  onClose: () => void;
  onCreated: (conv: Conversation) => void;
}

function NewConvDialog({ onClose, onCreated }: NewConvDialogProps) {
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'input' | 'found' | 'error'>('input');
  const [foundUser, setFoundUser] = useState<{ id: string; fullName: string; avatar: string | null; username: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const profile = await fetchProfileByUsername(username.trim());
      setFoundUser({ id: profile.id, fullName: profile.fullName, avatar: profile.avatar, username: profile.username });
      setStep('found');
    } catch {
      setErrorMsg('Usuário não encontrado. Verifique o nome de usuário.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!foundUser) return;
    setLoading(true);
    try {
      const conv = await createConversation(foundUser.id);
      onCreated(conv);
    } catch {
      setErrorMsg('Não foi possível iniciar a conversa. Tente novamente.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-white/[0.08] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-black tracking-tight text-slate-100">Nova Conversa</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step !== 'found' ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                Nome de usuário
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                <Input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setStep('input'); setErrorMsg(''); }}
                  placeholder="nome.de.usuario"
                  className="bg-slate-800/60 border-white/[0.08] text-slate-200 pl-8 rounded-xl focus:border-red-500/60 focus:ring-0"
                  autoFocus
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? 'Buscando…' : 'Buscar usuário'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-white/[0.06] rounded-xl">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={foundUser?.avatar || undefined} />
                <AvatarFallback className="bg-red-900/40 text-red-400 font-bold">
                  {foundUser?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-100 text-sm">{foundUser?.fullName}</p>
                <p className="text-xs text-slate-500">@{foundUser?.username}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setStep('input'); setFoundUser(null); }}
                className="flex-1 border border-white/20 text-slate-300 hover:border-white/40 hover:text-white py-2.5 rounded-full text-sm transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Iniciar conversa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export function ConversationsPage() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConv, setShowNewConv] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // ID vindo de navegação externa (ex: projeto/trabalho) — processado uma única vez
  const pendingConvIdRef = useRef<string | null>(
    (location.state as { conversationId?: string } | null)?.conversationId ?? null
  );

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: fetchConversations,
  });

  const filtered = conversations.filter((c) => {
    const p = c.participants[0];
    if (!p) return true;
    return (
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectConversation = useCallback(async (conv: Conversation) => {
    setSelectedConv(conv);
    setShowChatOnMobile(true);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const history = await fetchMessages(conv.id);
      setMessages(history);
    } finally {
      setLoadingMessages(false);
    }
    socketRef.current?.emit('joinConversation', conv.id);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Auto-selecionar conversa vinda de navegação externa
  useEffect(() => {
    const pending = pendingConvIdRef.current;
    if (!pending || conversations.length === 0) return;
    const found = conversations.find((c) => c.id === pending);
    if (found) {
      pendingConvIdRef.current = null;
      selectConversation(found);
    }
  }, [conversations, selectConversation]);

  // Connect socket once
  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [token]);

  // Listen for incoming messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (msg: Message & { conversationId: string }) => {
      if (msg.conversationId === selectedConv?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      // Refresh conversation list for preview/ordering
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
    };
    socket.on('receiveMessage', handler);
    return () => { socket.off('receiveMessage', handler); };
  }, [selectedConv?.id, queryClient]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !selectedConv) return;
    socketRef.current.emit('sendMessage', { conversationId: selectedConv.id, text: newMessage.trim() });
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleNewConvCreated = async (conv: Conversation) => {
    setShowNewConv(false);
    await queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
    selectConversation(conv);
  };

  const participant = selectedConv?.participants[0];

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* App sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      {/* ── Left panel: conversation list ── */}
      <div
        className={`
          flex flex-col w-full md:w-80 lg:w-96 shrink-0
          border-r border-white/[0.06] bg-slate-900
          ${showChatOnMobile ? 'hidden md:flex' : 'flex'}
        `}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-black tracking-tight text-slate-100">Mensagens</h1>
            <button
              onClick={() => setShowNewConv(true)}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/25"
              title="Nova conversa"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar conversa…"
              className="pl-9 bg-slate-800/60 border-white/[0.06] text-slate-300 placeholder:text-slate-600 rounded-xl text-sm focus:border-red-500/40 focus:ring-0 h-9"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">
                {searchTerm ? 'Nenhum resultado.' : 'Nenhuma conversa ainda.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowNewConv(true)}
                  className="mt-4 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Iniciar uma conversa →
                </button>
              )}
            </div>
          ) : (
            <div>
              {filtered.map((conv) => {
                const p = conv.participants[0];
                const isActive = selectedConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`
                      w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors
                      border-b border-white/[0.04]
                      ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                    `}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={p?.avatar || undefined} />
                        <AvatarFallback className="bg-red-900/40 text-red-400 font-bold text-sm">
                          {p?.fullName?.charAt(0) ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {p?.fullName ?? 'Usuário'}
                        </span>
                        <span className="text-xs text-slate-600 shrink-0 ml-2">
                          {formatTime(conv.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{lastPreview(conv)}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: chat area ── */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          ${showChatOnMobile ? 'flex' : 'hidden md:flex'}
        `}
      >
        {!selectedConv ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="h-20 w-20 rounded-3xl bg-slate-800/60 border border-white/[0.06] flex items-center justify-center mb-6">
              <MessageSquare className="h-9 w-9 text-slate-600" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-300 mb-2">
              Suas mensagens
            </h2>
            <p className="text-sm text-slate-600 max-w-xs leading-relaxed mb-6">
              Selecione uma conversa à esquerda ou inicie uma nova para começar.
            </p>
            <button
              onClick={() => setShowNewConv(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-red-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova conversa
            </button>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-slate-900/80 backdrop-blur-sm shrink-0">
              <button
                onClick={() => { setShowChatOnMobile(false); setSelectedConv(null); }}
                className="md:hidden text-slate-500 hover:text-slate-300 transition-colors mr-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={participant?.avatar || undefined} />
                <AvatarFallback className="bg-red-900/40 text-red-400 font-bold text-sm">
                  {participant?.fullName?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">
                  {participant?.fullName ?? 'Usuário'}
                </p>
                <p className="text-xs text-slate-500">@{participant?.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <p className="text-sm text-slate-600">Nenhuma mensagem ainda.</p>
                  <p className="text-xs text-slate-700 mt-1">Envie a primeira mensagem!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <Avatar className="h-7 w-7 shrink-0 mb-0.5">
                          <AvatarImage src={msg.sender.avatar || undefined} />
                          <AvatarFallback className="bg-red-900/40 text-red-400 text-xs font-bold">
                            {msg.sender.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`
                            px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                            ${isMine
                              ? 'bg-red-500 text-white rounded-br-sm'
                              : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-white/[0.06]'}
                          `}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-600 mt-1 mx-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/[0.06] bg-slate-900/80 backdrop-blur-sm shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite uma mensagem…"
                  className="flex-1 bg-slate-800/60 border-white/[0.06] text-slate-200 placeholder:text-slate-600 rounded-full text-sm focus:border-red-500/40 focus:ring-0 px-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as unknown as React.FormEvent);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-10 w-10 shrink-0 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-red-500/20"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* New conversation dialog */}
      {showNewConv && (
        <NewConvDialog
          onClose={() => setShowNewConv(false)}
          onCreated={handleNewConvCreated}
        />
      )}
    </div>
  );
}
