import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { Sidebar } from '@/components/shared/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, MessageCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface Participant {
  id: string;
  username: string;
  avatar: string | null;
  fullName: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  messages: Array<{
    id: string;
    text: string;
    createdAt: string;
    senderId: string;
  }>;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

export function ConversationsPage() {
  const {  token } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const filtered = conversations.filter(conv => 
      conv.participants[0]?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants[0]?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  const fetchConversations = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data);
      setFilteredConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return 'Inicie uma conversa';
    }
    
    const lastMessage = conversation.messages[0];
    return lastMessage.text.length > 50 
      ? lastMessage.text.substring(0, 50) + '...' 
      : lastMessage.text;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300">Carregando conversas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      
      <main className="flex flex-col h-screen w-full">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="mr-3 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">Mensagens</h1>
              <p className="text-sm text-slate-400">
                {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Pesquisar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white rounded-full focus-visible:ring-red-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="rounded-2xl bg-slate-800/50 p-6 mb-6 backdrop-blur-sm border border-slate-700/50">
                  <MessageCircle size={40} className="text-slate-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                </h3>
                <p className="text-sm text-slate-400 max-w-md">
                  {searchTerm 
                    ? `Nenhuma conversa encontrada para "${searchTerm}"`
                    : 'Quando você iniciar conversas, elas aparecerão aqui.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredConversations.map((conversation) => {
                  const participant = conversation.participants[0];
                  const unreadCount = conversation._count?.messages || 0;
                  
                  return (
                    <div
                      key={conversation.id}
                      className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/chat/${conversation.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={participant?.avatar || undefined} />
                          <AvatarFallback className="bg-red-600 text-white">
                            {participant?.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-white truncate">
                              {participant?.fullName || 'Usuário'}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(conversation.updatedAt)}
                              </span>
                              {unreadCount > 0 && (
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-400 truncate">
                            {getLastMessagePreview(conversation)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}