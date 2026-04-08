// src/pages/ProfilePage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/shared/Sidebar";
import { ProfileHeader } from "@/components/shared/ProfileHeader";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { ProfileTabs } from "@/components/shared/ProfileTabs";
import { useAuth } from "@/contexts/auth.context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOwnProfile, fetchProfileByUsername, updateProfile } from "@/api/profile";
import { createConversation } from "@/api/conversations";
import { queryKeys } from "@/api/queryKeys";
import type { UserProfileData } from "@/api/profile";

export function ProfilePage() {
  const { username } = useParams<{ username?: string }>();
  const { user, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isOwner = !username || user?.username === username;
  const queryKey = isOwner ? queryKeys.profile.own() : queryKeys.profile.byUsername(username!);

  const { data: profileData, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => (isOwner ? fetchOwnProfile() : fetchProfileByUsername(username!)),
    retry: (failCount, err: Error) => {
      // Não retentar em 404 (perfil bloqueado ou inexistente)
      if (err.message.includes('404')) return false;
      return failCount < 1;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<UserProfileData>) => updateProfile(data),
    onSuccess: (updatedUserData) => {
      updateUserContext(updatedUserData);
      qc.invalidateQueries({ queryKey: queryKeys.profile.own() });
    },
  });

  const handleSendMessage = async () => {
    if (!profileData?.id) return;
    try {
      const conversation = await createConversation(profileData.id);
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" />
        </div>
      </div>
    );
  }

  if (!profileData || error) {
    const isBlocked = error?.message?.includes('404');
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center px-6 max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">{isBlocked ? '🚫' : '👤'}</span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-2">
            {isBlocked ? 'Perfil indisponível' : 'Perfil não encontrado'}
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {isBlocked
              ? 'Este perfil não está disponível para você no momento.'
              : 'O perfil que você está procurando não existe ou não pôde ser carregado.'}
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Voltar ao feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      <MobileSidebar
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      <main className="flex-1 overflow-y-auto">
        <ProfileHeader
          userData={profileData}
          isOwner={isOwner}
          onSave={(data) => saveMutation.mutate(data)}
          isSaving={saveMutation.isPending}
          onSendMessage={handleSendMessage}
        />

        <ProfileTabs
          userPosts={profileData.userPosts}
          savedPosts={profileData.savedPosts}
          isOwner={isOwner}
          onUpdate={() => qc.invalidateQueries({ queryKey })}
        />
      </main>
    </div>
  );
}
