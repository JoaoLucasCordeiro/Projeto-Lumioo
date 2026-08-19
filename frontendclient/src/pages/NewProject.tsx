import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Image, User, Mail, Phone, Plus, Trash2, AlertCircle, Tag, MapPin, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedLayout } from "@/components/shared/feed/FeedLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "@/api/projects";
import { BRAZILIAN_UF_CODES, COUNTRY_OPTIONS } from "@/api/works";

const STATUS_MAP = {
  "em_andamento": "IN_PROGRESS",
  "concluido": "COMPLETED",
  "aberto_inscricoes": "OPEN_FOR_APPLICATIONS"
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo: string | null;
};

export function NewProjectPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as string | null,
    status: "em_andamento" as "em_andamento" | "concluido" | "aberto_inscricoes",
    contactEmail: "",
    contactPhone: "",
    campus: "",
    city: "",
    state: "",
    country: "Brasil",
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: crypto.randomUUID(), name: "", role: "", photo: null }
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...formData,
        status: STATUS_MAP[formData.status],
        teamMembers: teamMembers.map(({ id: _id, ...member }) => member)
      };
      return createProject(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projetos');
    },
  });

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, image: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleMemberPhotoChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === id ? { ...member, photo: event.target?.result as string } : member
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const addTeamMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", role: "", photo: null }
    ]);
  };

  const removeTeamMember = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers((prev) => prev.filter((member) => member.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: 'name' | 'role', value: string) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city.trim()) {
      setFormError("A cidade é obrigatória.");
      return;
    }
    if (formData.country === "Brasil" && !formData.state) {
      setFormError("Selecione o estado (UF) para projetos no Brasil.");
      return;
    }
    setFormError(null);
    mutation.mutate();
  };

  const error = formError || (mutation.isError ? (mutation.error as Error).message : null);

  return (
    <FeedLayout mobileSidebarOpen={false} setMobileSidebarOpen={() => {}}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="hidden md:flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/projetos')}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <X className="h-4 w-4 mr-2" />
            Voltar para projetos
          </Button>
          <Button
            type="submit"
            form="new-project-form"
            disabled={mutation.isPending}
            className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
          >
            {mutation.isPending ? "Publicando..." : "Criar Projeto"}
          </Button>
        </div>

        <form id="new-project-form" onSubmit={handleSubmit}>
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Informações Básicas</h3>
              <div className="mb-4">
                <Label htmlFor="title" className="text-slate-300 mb-2 block">
                  Título do Projeto *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título do projeto"
                  className="bg-slate-800/30 border-slate-700 text-slate-100"
                  required
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="category" className="text-slate-300 mb-2 block">
                  Categoria *
                </Label>
                <div className="relative">
                  <Input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Software, Biotecnologia, IA"
                    className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                    required
                  />
                  <div className="absolute left-3 top-3">
                    <Tag className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="campus" className="text-slate-300 mb-2 block">
                  Campus (opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="campus"
                    type="text"
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                    placeholder="Nome do campus"
                    className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                  />
                  <div className="absolute left-3 top-3">
                    <Building2 className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="text-slate-300 mb-2 block">
                    Cidade *
                  </Label>
                  <div className="relative">
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Cidade"
                      className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                      required
                    />
                    <div className="absolute left-3 top-3">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="country" className="text-slate-300 mb-2 block">
                    País *
                  </Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                    required
                  >
                    <SelectTrigger className="bg-slate-800/30 border-slate-700 text-slate-100">
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                      {COUNTRY_OPTIONS.map((country) => (
                        <SelectItem
                          key={country}
                          value={country}
                          className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                        >
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.country === "Brasil" && (
                  <div>
                    <Label htmlFor="state" className="text-slate-300 mb-2 block">
                      Estado (UF) *
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-800/30 border-slate-700 text-slate-100">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                        {BRAZILIAN_UF_CODES.map((uf) => (
                          <SelectItem
                            key={uf}
                            value={uf}
                            className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                          >
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <Label className="text-slate-300 mb-2 block">Imagem do Projeto (opcional)</Label>
                {formData.image ? (
                  <div className="relative group">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="rounded-lg object-cover w-full h-48 border border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormData({ ...formData, image: null })}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-800/90 text-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-slate-800/30 hover:bg-slate-800/50 transition-colors h-32 cursor-pointer">
                    <Image className="h-8 w-8 text-slate-500" />
                    <Label htmlFor="project-image" className="text-center">
                      <div className="text-slate-300 font-medium">Adicionar imagem do projeto</div>
                      <div className="text-slate-500 text-xs mt-1">Recomendado: 1200x630px</div>
                    </Label>
                    <Input
                      id="project-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-slate-300 mb-2 block">
                  Descrição *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o projeto com detalhes (objetivos, metodologia, etc.)"
                  className="min-h-[180px] bg-slate-800/30 border-slate-700 text-slate-100"
                  required
                />
              </div>
            </div>
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Situação do Projeto</h3>
              <div className="mb-4">
                <Label htmlFor="status" className="text-slate-300 mb-2 block">
                  Status *
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: typeof formData.status) =>
                    setFormData({ ...formData, status: value })
                  }
                  required
                >
                  <SelectTrigger className="bg-slate-800/30 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectItem
                      value="em_andamento"
                      className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                    >
                      Em andamento
                    </SelectItem>
                    <SelectItem
                      value="concluido"
                      className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                    >
                      Concluído
                    </SelectItem>
                    <SelectItem
                      value="aberto_inscricoes"
                      className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                    >
                      Aberto para inscrições
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.status === "aberto_inscricoes" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactEmail" className="text-slate-300 mb-2 block">
                      E-mail para contato *
                    </Label>
                    <div className="relative">
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, contactEmail: e.target.value })
                        }
                        placeholder="contato@projeto.com"
                        className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                        required
                      />
                      <div className="absolute left-3 top-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contactPhone" className="text-slate-300 mb-2 block">
                      Telefone para contato *
                    </Label>
                    <div className="relative">
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, contactPhone: e.target.value })
                        }
                        placeholder="(99) 99999-9999"
                        className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                        required
                      />
                      <div className="absolute left-3 top-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-100">Equipe do Projeto</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTeamMember}
                  className="bg-red-600 text-white hover:bg-red-700 hover:text-white border-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar membro
                </Button>
              </div>
              <div className="space-y-6">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
                  >
                    <div className="flex items-start gap-4">
                      <Label
                        htmlFor={`member-photo-${member.id}`}
                        className="cursor-pointer"
                      >
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={`Foto de ${member.name}`}
                            className="w-12 h-12 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-700/50 border border-slate-700 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <Input
                          id={`member-photo-${member.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMemberPhotoChange(e, member.id)}
                          className="hidden"
                        />
                      </Label>
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label
                            htmlFor={`member-name-${member.id}`}
                            className="text-slate-300 text-sm"
                          >
                            Nome *
                          </Label>
                          <Input
                            id={`member-name-${member.id}`}
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              updateTeamMember(member.id, 'name', e.target.value)
                            }
                            placeholder="Nome completo"
                            className="bg-slate-800 border-slate-700 text-slate-100 mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`member-role-${member.id}`}
                            className="text-slate-300 text-sm"
                          >
                            Cargo/Função *
                          </Label>
                          <Input
                            id={`member-role-${member.id}`}
                            type="text"
                            value={member.role}
                            onChange={(e) =>
                              updateTeamMember(member.id, 'role', e.target.value)
                            }
                            placeholder="Ex: Pesquisador Principal"
                            className="bg-slate-800 border-slate-700 text-slate-100 mt-1"
                            required
                          />
                        </div>
                      </div>
                      {teamMembers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMember(member.id)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {error && (
              <div className="p-6">
                <div className="flex items-center p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg">
                  <AlertCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                  <div>{error}</div>
                </div>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </FeedLayout>
  );
}
