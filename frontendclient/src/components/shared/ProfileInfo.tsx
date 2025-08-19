import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, GraduationCap, Calendar } from "lucide-react";

interface ProfileInfoProps {
  userData: {
    email: string;
    institution: string;
    academicLevel: string;
    birthDate: string;
  };
  isEditing: boolean;
}

export function ProfileInfo({ userData, isEditing }: ProfileInfoProps) {
  return (
    <div className="px-4 md:px-8 lg:px-12 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-100 mb-6">Informações do Perfil</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Informação 1 - Email */}
          <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-slate-700/50">
                <Mail className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Email</h3>
                {isEditing ? (
                  <Input
                    type="email"
                    defaultValue={userData.email}
                    className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                  />
                ) : (
                  <p className="text-slate-200">{userData.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informação 2 - Instituição */}
          <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-slate-700/50">
                <GraduationCap className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Instituição</h3>
                {isEditing ? (
                  <Input
                    type="text"
                    defaultValue={userData.institution}
                    className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                  />
                ) : (
                  <p className="text-slate-200">{userData.institution}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informação 3 - Nível Acadêmico */}
          <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-slate-700/50">
                <GraduationCap className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Nível Acadêmico</h3>
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
                  <p className="text-slate-200">{userData.academicLevel}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informação 4 - Data de Nascimento */}
          <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-slate-700/50">
                <Calendar className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Data de Nascimento</h3>
                {isEditing ? (
                  <Input
                    type="date"
                    defaultValue={userData.birthDate}
                    className="bg-slate-800 border-slate-700 text-slate-200 mt-1 [&::-webkit-calendar-picker-indicator]:invert-[0.7]"
                  />
                ) : (
                  <p className="text-slate-200">
                    {new Date(userData.birthDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Áreas de pesquisa */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Áreas de Pesquisa</h2>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Input
                  type="text"
                  placeholder="Adicione uma área de pesquisa"
                  className="bg-slate-800 border-slate-700 text-slate-200 max-w-xs"
                />
                <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20">
                  Adicionar
                </Button>
              </>
            ) : (
              <>
                <Badge className="bg-slate-800 text-red-400 border-red-500/30 hover:bg-slate-700">
                  Inteligência Artificial
                </Badge>
                <Badge className="bg-slate-800 text-red-400 border-red-500/30 hover:bg-slate-700">
                  Saúde Digital
                </Badge>
                <Badge className="bg-slate-800 text-red-400 border-red-500/30 hover:bg-slate-700">
                  Aprendizado de Máquina
                </Badge>
                <Badge className="bg-slate-800 text-red-400 border-red-500/30 hover:bg-slate-700">
                  Diagnóstico Médico
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}