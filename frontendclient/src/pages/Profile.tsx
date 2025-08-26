// src/pages/ProfilePage.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/shared/Sidebar";
import { ProfileHeader } from "@/components/shared/ProfileHeader";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { ProfileTabs } from "@/components/shared/ProfileTabs";
import { ProfileInfo } from "@/components/shared/ProfileInfo";
import { useAuth } from "@/contexts/auth.context";
import type { Post } from "@/types/feed";

const API_URL = import.meta.env.VITE_API_URL;

interface UserProfileData {
  id: string;
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
  const { username } = useParams<{ username?: string }>();
  const { user, token, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [editableData, setEditableData] = useState<Partial<UserProfileData>>({});
  const [isLoading, setIsLoading] = useState(true);

  const isOwner = !username || user?.username === username;

  const fetchProfile = useCallback(async () => {
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

  const handleSendMessage = async () => {
    if (!token || !profileData?.id) return;
    try {
        const response = await fetch(`${API_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ recipientId: profileData.id })
        });
        const conversation = await response.json();
        if (!response.ok) throw new Error("Não foi possível iniciar a conversa.");
        
        navigate(`/chat/${conversation.id}`);
    } catch (error) {
        console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-red-500 mb-2">Perfil não encontrado</h2>
          <p className="text-slate-400 mb-4">O perfil que você está procurando não existe ou não pôde ser carregado.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Voltar
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
          userData={isEditing ? editableData : profileData}
          isOwner={isOwner}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          onDataChange={handleDataChange}
          onSaveChanges={handleSaveChanges}
          onSendMessage={handleSendMessage}
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