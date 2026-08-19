import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Users, BookOpen, Calendar, Download, ArrowLeft, MessageCircle, Lock, MapPin, Globe, Check, X as XIcon, Ban } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/contexts/auth.context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkById,
  downloadWork,
  requestWorkAccess,
  getWorkAccessRequests,
  respondToWorkAccessRequest,
  WORK_AREA_LABELS,
  type WorkAccessStatus,
} from "@/api/works";
import { ApiError } from "@/api/client";
import { createConversation } from "@/api/conversations";
import { queryKeys } from "@/api/queryKeys";

const ACCESS_STATUS_LABELS: Record<WorkAccessStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  DENIED: "Negado",
  REVOKED: "Revogado",
};

export function WorkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const startChatMutation = useMutation({
    mutationFn: (recipientId: string) => createConversation(recipientId),
    onSuccess: (conversation) => navigate('/mensagens', { state: { conversationId: conversation.id } }),
  });

  const handleContact = (recipientId: string) => {
    if (!user) { navigate('/login'); return; }
    startChatMutation.mutate(recipientId);
  };

  const { data: work, isLoading, error: workError } = useQuery({
    queryKey: queryKeys.works.detail(id!),
    queryFn: () => fetchWorkById(id!),
    enabled: !!id,
    retry: false,
  });

  const isOwner = !!user && !!work && user.username === work.authorUsername;

  const requestAccessMutation = useMutation({
    mutationFn: () => requestWorkAccess(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.works.detail(id!) }),
  });

  const { data: accessRequests } = useQuery({
    queryKey: queryKeys.works.accessRequests(id!),
    queryFn: () => getWorkAccessRequests(id!),
    enabled: !!id && isOwner && work?.visibility === "PRIVATE",
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: "APPROVED" | "DENIED" | "REVOKED" }) =>
      respondToWorkAccessRequest(id!, requestId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.works.accessRequests(id!) }),
  });

  const downloadMutation = useMutation({
    mutationFn: () => downloadWork(id!),
    onSuccess: (data) => {
      const byteCharacters = atob(data.pdfFile.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Download error:", error);
    },
  });

  const handleDownload = () => {
    if (!token) return;
    downloadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Carregando detalhes do trabalho...</p>
      </div>
    );
  }

  if (workError instanceof ApiError && workError.status === 403) {
    const status = (workError.data as { accessRequestStatus?: WorkAccessStatus | null } | undefined)
      ?.accessRequestStatus;

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-900/20 border border-red-700/50 flex items-center justify-center">
            <Lock className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Este trabalho é privado</h2>
          <p className="text-slate-400 mb-6">
            O autor restringiu o acesso a este trabalho. Solicite acesso para poder visualizá-lo e baixá-lo.
          </p>

          {!user && (
            <Button
              onClick={() => navigate('/login')}
              className="bg-[#ff3131] hover:bg-red-600 text-white mb-4"
            >
              Entrar para solicitar acesso
            </Button>
          )}

          {user && !status && (
            <Button
              onClick={() => requestAccessMutation.mutate()}
              disabled={requestAccessMutation.isPending}
              className="bg-[#ff3131] hover:bg-red-600 text-white mb-4"
            >
              {requestAccessMutation.isPending ? "Enviando..." : "Solicitar acesso"}
            </Button>
          )}

          {user && status === "PENDING" && (
            <p className="text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 mb-4">
              Seu pedido de acesso foi enviado e está aguardando aprovação do autor.
            </p>
          )}

          {user && status === "DENIED" && (
            <p className="text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 mb-4">
              Seu pedido de acesso a este trabalho foi negado.
            </p>
          )}

          {user && status === "REVOKED" && (
            <p className="text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 mb-4">
              Seu acesso a este trabalho foi revogado.
            </p>
          )}

          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/trabalhos')}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para trabalhos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Trabalho não encontrado</h2>
          <Button
            onClick={() => navigate('/trabalhos')}
            className="bg-[#ff3131] hover:bg-red-600 text-white"
          >
            Voltar para trabalhos
          </Button>
        </div>
      </div>
    );
  }

  const displayDownloads = downloadMutation.isSuccess
    ? work.downloads + 1
    : work.downloads;

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="md:hidden fixed top-4 left-4 z-20">
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-slate-900/95 backdrop-blur-sm border-slate-800 p-0 w-[280px]"
          >
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <main className="py-8 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="hidden md:flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/trabalhos')}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para trabalhos
            </Button>
          </div>
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 mb-8">
            <div className="h-64 md:h-80 bg-slate-700 relative overflow-hidden">
              <img
                src={work.image || "https://placehold.co/1200x400/1e293b/ef4444?text=Lumioo"}
                alt={work.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-red-900/20 border-red-700/50 text-red-400"
                >
                  {work.type}
                </Badge>
                {work.visibility === "PRIVATE" && (
                  <Badge
                    variant="outline"
                    className="bg-slate-900/60 border-slate-600 text-slate-300 flex items-center gap-1"
                  >
                    <Lock className="h-3 w-3" />
                    Privado
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
                    {work.title}
                  </h1>
                  <div className="flex items-center gap-3 mb-4">
                    <Link to={`/perfil/${work.authorUsername}`} className="text-lg text-slate-300 hover:text-red-400 transition-colors">
                      {work.author}
                    </Link>
                    {work.authorId && user?.username !== work.authorUsername && (
                      <button
                        onClick={() => handleContact(work.authorId!)}
                        disabled={startChatMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-900/20 border border-red-700/40 text-red-400 hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Enviar mensagem
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{work.year}</span>
                    </div>
                    {work.area && (
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{WORK_AREA_LABELS[work.area] ?? work.area}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{displayDownloads.toLocaleString()} downloads</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-green-600 text-white hover:text-white hover:bg-green-700 border-none"
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                >
                  <Download className="h-5 w-5 mr-2" />
                  {downloadMutation.isPending ? 'Baixando...' : 'Baixar Trabalho'}
                </Button>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Resumo</h2>
                <p className="text-slate-300">{work.abstract}</p>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Descrição Detalhada</h2>
                <p className="text-slate-300 whitespace-pre-line">{work.detailedDescription}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="font-medium text-slate-100 mb-2">Orientador</h3>
                  <p className="text-slate-300">{work.advisor}</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="font-medium text-slate-100 mb-2">Instituição</h3>
                  <p className="text-slate-300">{work.institution}</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="font-medium text-slate-100 mb-2">Departamento</h3>
                  <p className="text-slate-300">{work.department || 'Não informado'}</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="font-medium text-slate-100 mb-2">Tipo de Trabalho</h3>
                  <p className="text-slate-300">{work.type}</p>
                </div>
                {(work.city || work.state || work.country) && (
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <h3 className="font-medium text-slate-100 mb-2 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      Localização
                    </h3>
                    <p className="text-slate-300">
                      {[work.campus, work.city, work.state, work.country].filter(Boolean).join(' — ')}
                    </p>
                  </div>
                )}
                {work.area && (
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <h3 className="font-medium text-slate-100 mb-2 flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      Área do Conhecimento
                    </h3>
                    <p className="text-slate-300">{WORK_AREA_LABELS[work.area] ?? work.area}</p>
                  </div>
                )}
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Palavras-chave</h2>
                <div className="flex flex-wrap gap-2">
                  {work.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="bg-slate-700/50 border-slate-600 text-slate-300"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              {work.references && work.references.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-100 mb-3">
                    Referências Bibliográficas
                  </h2>
                  <div className="space-y-2">
                    {work.references.map((ref, index) => (
                      <p key={index} className="text-sm text-slate-400">
                        {ref}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {isOwner && work.visibility === "PRIVATE" && (
                <div>
                  <h2 className="text-xl font-semibold text-slate-100 mb-3">Pedidos de Acesso</h2>
                  {!accessRequests || accessRequests.length === 0 ? (
                    <p className="text-slate-400">Nenhum pedido de acesso até o momento.</p>
                  ) : (
                    <div className="space-y-3">
                      {accessRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                          <div>
                            <Link
                              to={`/perfil/${req.requester?.username}`}
                              className="text-slate-100 font-medium hover:text-red-400 transition-colors"
                            >
                              {req.requester?.fullName ?? "Usuário"}
                            </Link>
                            <p className="text-sm text-slate-400">
                              {req.requester?.institution}
                              {req.requester?.username ? ` · @${req.requester.username}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-slate-700/50 border-slate-600 text-slate-300"
                            >
                              {ACCESS_STATUS_LABELS[req.status]}
                            </Badge>
                            {req.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:text-white hover:bg-green-700 border-none"
                                  onClick={() => respondMutation.mutate({ requestId: req.id, status: "APPROVED" })}
                                  disabled={respondMutation.isPending}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-700/50 text-red-400 hover:bg-red-900/20"
                                  onClick={() => respondMutation.mutate({ requestId: req.id, status: "DENIED" })}
                                  disabled={respondMutation.isPending}
                                >
                                  <XIcon className="h-4 w-4 mr-1" />
                                  Negar
                                </Button>
                              </>
                            )}
                            {req.status === "APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-700/50 text-red-400 hover:bg-red-900/20"
                                onClick={() => respondMutation.mutate({ requestId: req.id, status: "REVOKED" })}
                                disabled={respondMutation.isPending}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Revogar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
