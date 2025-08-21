import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Camera } from "lucide-react";
import { ProfileStats } from "./ProfileStats";
import { useRef } from "react";

// Função auxiliar para converter arquivo para Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Interface para os dados que o componente recebe
interface UserData {
    fullName?: string;
    username?: string;
    bio?: string | null;
    avatar?: string | null;
    coverPhoto?: string | null;
    posts?: number;
    followers?: number;
    following?: number;
}

interface ProfileHeaderProps {
  userData: UserData;
  isOwner: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  // --- CORREÇÃO AQUI ---
  onDataChange: (field: keyof UserData, value: string | null) => void;
  onSaveChanges: () => void;
}

export function ProfileHeader({ userData, isOwner, isEditing, onEditToggle, onDataChange, onSaveChanges }: ProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onDataChange('avatar', base64);
    }
  };

  return (
    <div className="relative">
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden">
        {userData.coverPhoto && (
          <img
            src={userData.coverPhoto}
            alt="Capa do perfil"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="px-4 md:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-6">
          <div className="relative">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-slate-900">
              <AvatarImage src={userData.avatar || undefined} alt={userData.fullName} />
              <AvatarFallback className="bg-slate-700 text-red-400 text-4xl font-bold">
                {userData.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/80 rounded-full"
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
                    <Input type="text" value={userData.fullName || ''} onChange={(e) => onDataChange('fullName', e.target.value)} className="bg-slate-800 border-slate-700 text-slate-100 text-2xl font-bold h-12" />
                    <Input type="text" value={userData.username || ''} onChange={(e) => onDataChange('username', e.target.value)} className="bg-slate-800 border-slate-700 text-slate-400" />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{userData.fullName}</h1>
                  <p className="text-slate-400">@{userData.username}</p>
                </div>
              )}

              {isOwner && (
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={onEditToggle}>Cancelar</Button>
                      <Button className="bg-red-600 hover:bg-red-700" onClick={onSaveChanges}>Salvar Alterações</Button>
                    </>
                  ) : (
                    <Button className="flex items-center gap-2 bg-[#ff3131] text-white font-bold" onClick={onEditToggle}>
                      <Edit className="h-4 w-4" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <Textarea
                value={userData.bio || ''}
                onChange={(e) => onDataChange('bio', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Escreva uma breve biografia..."
              />
            ) : (
              <p className="text-slate-300">{userData.bio}</p>
            )}

            <ProfileStats posts={userData.posts || 0} followers={userData.followers || 0} following={userData.following || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}