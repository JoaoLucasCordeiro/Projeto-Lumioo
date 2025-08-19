import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Lock } from "lucide-react";
import { ProfileStats } from "./ProfileStats";

interface ProfileHeaderProps {
  userData: {
    fullName: string;
    username: string;
    bio: string;
    avatar: string;
    coverPhoto: string;
  };
  isOwner: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function ProfileHeader({ userData, isOwner, isEditing, onEditToggle }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Foto de capa */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden">
        <img
          src={userData.coverPhoto}
          alt="Capa do perfil"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Área de informações do perfil */}
      <div className="px-4 md:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-slate-900">
              <AvatarImage src={userData.avatar} alt={userData.fullName} />
              <AvatarFallback className="bg-slate-700 text-red-400 text-4xl font-bold">
                {userData.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/80"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Nome e ações */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{userData.fullName}</h1>
                <p className="text-slate-400">@{userData.username}</p>
              </div>

              {isOwner && (
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                        onClick={onEditToggle}
                      >
                        Cancelar
                      </Button>

                      <Button className="bg-red-600 hover:bg-red-700">
                        Salvar Alterações
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="flex items-center gap-2 bg-[#ff3131] text-white font-bold border border-[#ff3131] shadow-lg shadow-[#ff3131]/20 hover:bg-red-600 hover:shadow-[#ff3131]/40 transition-all duration-300"
                        onClick={onEditToggle}
                      >
                        <Edit className="h-4 w-4" />
                        Editar Perfil
                      </Button>

                      <Button
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Privacidade
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {isEditing ? (
              <textarea
                defaultValue={userData.bio}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-red-500 focus:border-red-500"
                rows={3}
              />
            ) : (
              <p className="text-slate-300">{userData.bio}</p>
            )}

            {/* Estatísticas */}
            <ProfileStats posts={28} followers={342} following={156} />
          </div>
        </div>
      </div>
    </div>
  );
}