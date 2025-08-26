import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
  const { username } = useParams<{ username?: string }>(); // Pega o username da URL, se existir
  const { user, token, updateUserContext } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [editableData, setEditableData] = useState<Partial<UserProfileData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se o usuário logado é o dono do perfil que está sendo visto
  const isOwner = !username || user?.username === username;

  const fetchProfile = useCallback(async () => {
    // Define a URL baseada em quem estamos visitando
    const endpoint = username ? `/profile/${username}` : '/profile';
    const url = `${API_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Falha ao buscar dados do perfil.");
      const data = await response.json();
      setProfileData(data);
      setEditableData(data);
    } catch (error) {
      console.error(error);
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, username]);

  useEffect(() => {
    setIsLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = () => {
    fetchProfile();
  };

  const handleEditToggle = () => {
    if (isEditing && profileData) {
        setEditableData(profileData);
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
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editableData)
        });
        const updatedUserData = await response.json();
        if (!response.ok) throw new Error("Falha ao salvar alterações");

        updateUserContext(updatedUserData);
        setIsEditing(false);
        await fetchProfile();
    } catch (error) {
        console.error("Failed to save changes:", error);
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando perfil...</div>;
  }

  if (!profileData) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-500">Perfil não encontrado.</div>;
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
          userData={isEditing ? editableData : profileData}
          isOwner={isOwner}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          onDataChange={handleDataChange}
          onSaveChanges={handleSaveChanges}
        />

        <ProfileTabs 
          userPosts={profileData.userPosts}
          savedPosts={profileData.savedPosts}
          isOwner={isOwner}
          onUpdate={handleUpdate}
        />

        {isOwner && (
          <ProfileInfo 
            userData={profileData}
            isEditing={isEditing}
          />
        )}
      </main>
    </div>
  );
}