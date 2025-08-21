import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/shared/Sidebar";
import { ProfileHeader } from "@/components/shared/ProfileHeader";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { ProfileTabs } from "@/components/shared/ProfileTabs";
import { ProfileInfo } from "@/components/shared/ProfileInfo";
import { useAuth } from "@/contexts/auth.context";
import type { Post } from "@/types/feed";

const API_URL = import.meta.env.VITE_API_URL;

interface UserProfileData {
  fullName: string;
  username: string;
  email: string;
  institution: string;
  academicLevel: string;
  birthDate: string;
  joinDate: string;
  bio: string | null;
  avatar: string | null;
  coverPhoto: string | null;
  posts: number;
  followers: number;
  following: number;
  userPosts: Post[];
  savedPosts: Post[];
}

export function ProfilePage() {
  const { token, updateUserContext } = useAuth(); // Pega a função de update do contexto
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [editableData, setEditableData] = useState<Partial<UserProfileData>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao buscar dados do perfil.");
      const data = await response.json();
      setProfileData(data);
      setEditableData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = () => {
    fetchProfile();
  };

  const handleEditToggle = () => {
    if (isEditing) {
        if (profileData) setEditableData(profileData);
    }
    setIsEditing(!isEditing);
  };

  const handleDataChange = (field: keyof UserProfileData, value: string | null) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
        const response = await fetch(`${API_URL}/profile`, { // Usa a rota /profile que funciona
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editableData)
        });
        const updatedUserData = await response.json();
        if (!response.ok) throw new Error("Falha ao salvar alterações");

        // --- A LINHA QUE FALTAVA ---
        // Atualiza o contexto global com os novos dados do usuário
        updateUserContext(updatedUserData);

        setIsEditing(false);
        await fetchProfile(); // Recarrega os dados da página de perfil
    } catch (error) {
        console.error("Failed to save changes:", error);
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading && !profileData) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando perfil...</div>;
  }

  if (!profileData) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-500">Erro ao carregar o perfil.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      <MobileSidebar 
        mobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />

      <main className="overflow-y-auto">
        <ProfileHeader 
          userData={editableData}
          isOwner={true}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          onDataChange={handleDataChange}
          onSaveChanges={handleSaveChanges}
        />

        <ProfileTabs 
          userPosts={profileData.userPosts}
          savedPosts={profileData.savedPosts}
          isOwner={true}
          onUpdate={handleUpdate}
        />

        <ProfileInfo 
          userData={profileData}
          isEditing={isEditing}
        />
      </main>
    </div>
  );
}