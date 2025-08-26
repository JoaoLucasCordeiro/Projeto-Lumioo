// src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { io, Socket } from 'socket.io-client';
import { Sidebar } from '@/components/shared/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
    sender: {
        username: string;
        avatar: string | null;
    };
}

interface ConversationInfo {
    id: string;
    participants: Array<{
        id: string;
        username: string;
        avatar: string | null;
        fullName: string;
    }>;
}

export function ChatPage() {
    const { conversationId } = useParams<{ conversationId: string }>();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);

    useEffect(() => {
        if (!token || !conversationId) return;

        const socket = io(API_URL.replace('/api/v1/lumioo', ''), {
            auth: { token }
        });
        socketRef.current = socket;

        socket.emit('joinConversation', conversationId);

        socket.on('receiveMessage', (message: Message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setMessages(data);
            } catch (error) {
                console.error("Failed to fetch message history:", error);
            }
        };
        fetchHistory();

        return () => {
            socket.disconnect();
        };
    }, [conversationId, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // src/pages/ChatPage.tsx - Corrigir o fetchConversationInfo
    useEffect(() => {
        if (!token || !conversationId) return;

        const fetchConversationInfo = async () => {
            try {
                const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setConversationInfo(data);
            } catch (error) {
                console.error("Failed to fetch conversation info:", error);
            }
        };

        fetchConversationInfo();
    }, [conversationId, token]);


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit('sendMessage', {
            conversationId,
            text: newMessage,
        });
        setNewMessage('');
        inputRef.current?.focus();
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
                <Sidebar />
            </div>

            <main className="flex flex-col h-screen w-full">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/mensagens')} // Mudar para navegar para a página de conversas
                            className="mr-2 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={conversationInfo?.participants[0]?.avatar || undefined} />
                                <AvatarFallback className="bg-red-600 text-white">
                                    {conversationInfo?.participants[0]?.fullName?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-white">
                                    {conversationInfo?.participants[0]?.fullName || 'Carregando...'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {messages.length > 0 ? `${messages.length} mensagens` : 'Inicie uma conversa'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-700 hover:text-white">
                        <MoreVertical size={20} />
                    </Button>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-800 to-slate-900">
                    <div className="max-w-3xl mx-auto space-y-3">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="rounded-full bg-slate-700 p-4 mb-4">
                                    <Send size={24} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-1">Sua conversa começa aqui</h3>
                                <p className="text-sm text-slate-400">Envie uma mensagem para iniciar a conversa</p>
                            </div>
                        )}

                        {messages.map(msg => {
                            const isSender = msg.senderId === user?.id;
                            return (
                                <div key={msg.id} className={`flex items-start gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                    {!isSender && (
                                        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                                            <AvatarImage src={msg.sender.avatar || undefined} />
                                            <AvatarFallback className="bg-red-600 text-white text-xs">
                                                {msg.sender.username.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className="flex flex-col max-w-xs lg:max-w-md">
                                        {!isSender && (
                                            <span className="text-xs text-slate-400 mb-1 ml-1">{msg.sender.username}</span>
                                        )}
                                        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`relative p-3 rounded-2xl ${isSender ? 'bg-red-600 text-white rounded-br-md' : 'bg-slate-700 text-slate-200 rounded-bl-md'}`}>
                                                <p className="text-sm">{msg.text}</p>
                                            </div>
                                        </div>
                                        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                                            <span className="text-xs text-slate-500 mt-1 mx-1">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <footer className="p-4 border-t border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <Input
                                ref={inputRef}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="bg-slate-700 border-slate-600 text-white rounded-full focus-visible:ring-red-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            size="icon"
                            className="bg-red-600 hover:bg-red-700 flex-shrink-0 rounded-full h-11 w-11"
                            disabled={!newMessage.trim()}
                        >
                            <Send size={18} />
                        </Button>
                    </form>
                </footer>
            </main>
        </div>
    );
}