// src/components/shared/ProfileInfo.tsx
import { Input } from "@/components/ui/input";
import { Mail, GraduationCap, Calendar, User, BookOpen } from "lucide-react";

interface ProfileInfoProps {
  userData: {
    email: string;
    institution: string;
    academicLevel: string;
    birthDate: string;
    joinDate: string;
  };
  isEditing: boolean;
}

export function ProfileInfo({ userData, isEditing }: ProfileInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAcademicLevelText = (level: string) => {
    const levels: Record<string, string> = {
      'Graduação': 'Estudante de Graduação',
      'Mestrado': 'Estudante de Mestrado',
      'Doutorado': 'Estudante de Doutorado',
      'Professor': 'Professor/Pesquisador'
    };
    return levels[level] || level;
  };

  return (
    <div className="px-4 md:px-8 lg:px-12 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-100 mb-6 pb-2 border-b border-slate-800">Informações do Perfil</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-600/20 flex-shrink-0">
                <Mail className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-400 mb-1">Email</h3>
                {isEditing ? (
                  <Input
                    type="email"
                    defaultValue={userData.email}
                    className="bg-slate-800 border-slate-700 text-slate-200 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-slate-200 break-all">{userData.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Instituição */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-600/20 flex-shrink-0">
                <BookOpen className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-400 mb-1">Instituição</h3>
                {isEditing ? (
                  <Input
                    type="text"
                    defaultValue={userData.institution}
                    className="bg-slate-800 border-slate-700 text-slate-200 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-slate-200">{userData.institution || "Não informado"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Nível Acadêmico */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-600/20 flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-400 mb-1">Nível Acadêmico</h3>
                {isEditing ? (
                  <select
                    defaultValue={userData.academicLevel}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Graduação">Estudante de Graduação</option>
                    <option value="Mestrado">Estudante de Mestrado</option>
                    <option value="Doutorado">Estudante de Doutorado</option>
                    <option value="Professor">Professor/Pesquisador</option>
                  </select>
                ) : (
                  <p className="text-slate-200">{getAcademicLevelText(userData.academicLevel)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Data de Nascimento */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-600/20 flex-shrink-0">
                <Calendar className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-400 mb-1">Data de Nascimento</h3>
                {isEditing ? (
                  <Input
                    type="date"
                    defaultValue={userData.birthDate}
                    className="bg-slate-800 border-slate-700 text-slate-200 focus:ring-red-500 [&::-webkit-calendar-picker-indicator]:invert-[0.7]"
                  />
                ) : (
                  <p className="text-slate-200">
                    {userData.birthDate ? formatDate(userData.birthDate) : "Não informada"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Data de Entrada */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-600/20 flex-shrink-0">
                <User className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-400 mb-1">Membro desde</h3>
                <p className="text-slate-200">{formatDate(userData.joinDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}