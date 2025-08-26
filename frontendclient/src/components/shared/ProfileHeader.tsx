// src/components/shared/ProfileHeader.tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Camera, MessageCircle, User, MapPin } from "lucide-react";
import { ProfileStats } from "./ProfileStats";
import { useRef } from "react";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

interface UserData {
  fullName?: string;
  username?: string;
  bio?: string | null;
  avatar?: string | null;
  coverPhoto?: string | null;
  posts?: number;
  followers?: number;
  following?: number;
  institution?: string;
}

interface ProfileHeaderProps {
  userData: UserData;
  isOwner: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  onDataChange: (field: keyof UserData, value: string | null) => void;
  onSaveChanges: () => void;
  onSendMessage: () => void;
}

export function ProfileHeader({ userData, isOwner, isEditing, onEditToggle, onDataChange, onSaveChanges, onSendMessage }: ProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onDataChange('avatar', base64);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onDataChange('coverPhoto', base64);
    }
  };

  return (
    <div className="relative">
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden relative">
        {userData.coverPhoto ? (
          <img src={userData.coverPhoto} alt="Capa do perfil" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800"></div>
        )}
        
        {isEditing && (
          <>
            <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => coverInputRef.current?.click()} 
              className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-800/80 rounded-full"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      <div className="px-4 md:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-6">
          <div className="relative">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-slate-900 shadow-lg">
              <AvatarImage src={userData.avatar || undefined} alt={userData.fullName} />
              <AvatarFallback className="bg-red-600 text-white text-4xl font-bold">
                {userData.fullName?.charAt(0) || <User className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => avatarInputRef.current?.click()} 
                  className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-800/80 rounded-full h-10 w-10"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <Input 
                    type="text" 
                    value={userData.fullName || ''} 
                    onChange={(e) => onDataChange('fullName', e.target.value)} 
                    className="bg-slate-800 border-slate-700 text-slate-100 text-2xl font-bold h-12 focus:ring-red-500" 
                  />
                  <Input 
                    type="text" 
                    value={userData.username || ''} 
                    onChange={(e) => onDataChange('username', e.target.value)} 
                    className="bg-slate-800 border-slate-700 text-slate-400 focus:ring-red-500" 
                    prefix="@"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{userData.fullName}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-slate-400">@{userData.username}</p>
                    {userData.institution && (
                      <div className="flex items-center text-slate-500 text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {userData.institution}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                {isOwner ? (
                  isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" 
                        onClick={onEditToggle}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-red-600 hover:bg-red-700 transition-colors" 
                        onClick={onSaveChanges}
                      >
                        Salvar Alterações
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors" 
                      onClick={onEditToggle}
                    >
                      <Edit className="h-4 w-4" />
                      Editar Perfil
                    </Button>
                  )
                ) : (
                  <Button 
                    onClick={onSendMessage} 
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar Mensagem
                  </Button>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <Textarea 
                value={userData.bio || ''} 
                onChange={(e) => onDataChange('bio', e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-red-500" 
                rows={3} 
                placeholder="Escreva uma breve biografia..." 
              />
            ) : (
              <p className="text-slate-300 leading-relaxed">{userData.bio || "Este usuário ainda não adicionou uma biografia."}</p>
            )}
            
            <ProfileStats 
              posts={userData.posts || 0} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}