// src/components/shared/ProfileHeader.tsx
import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Edit, Camera, MessageCircle, User, X, Info,
  GraduationCap, Building2, UserCheck, Mail, Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfileData } from "@/api/profile";

// ─── helpers ─────────────────────────────────────────────────────────────────

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
  });

const ACADEMIC_LEVEL_MAP: Record<string, string> = {
  UNDERGRADUATE: "Graduação",
  MASTER: "Mestrado",
  PHD: "Doutorado",
  PROFESSOR: "Professor / Pesquisador",
};

function translateLevel(level: string) {
  return ACADEMIC_LEVEL_MAP[level] ?? level;
}

function formatDate(dateString: string, style: "long" | "short" = "short"): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    month: style === "long" ? "long" : "short",
    year: "numeric",
    ...(style === "long" && { day: "2-digit" }),
  });
}

// ─── Info modal ───────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/[0.05] last:border-b-0">
      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm text-slate-100 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function InfoModal({ userData, isOwner, onClose }: {
  userData: UserProfileData;
  isOwner: boolean;
  onClose: () => void;
}) {
  const rows = [
    userData.academicLevel && {
      icon: GraduationCap,
      label: "Nível acadêmico",
      value: translateLevel(userData.academicLevel),
    },
    userData.institution && {
      icon: Building2,
      label: "Instituição",
      value: userData.institution,
    },
    userData.joinDate && {
      icon: UserCheck,
      label: "Membro desde",
      value: formatDate(userData.joinDate),
    },
    isOwner && userData.email && {
      icon: Mail,
      label: "Email",
      value: userData.email,
    },
    isOwner && userData.birthDate && {
      icon: Calendar,
      label: "Data de nascimento",
      value: formatDate(userData.birthDate, "long"),
    },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="bg-slate-900 border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-100">Informações do perfil</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 pb-2">
          {rows.map((row) => (
            <InfoRow key={row.label} {...row} />
          ))}
        </div>
        <div className="h-3" />
      </motion.div>
    </motion.div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

type EditableData = Pick<UserProfileData, "fullName" | "username" | "bio" | "avatar" | "coverPhoto">;

function EditModal({ initialData, onSave, onClose, isSaving }: {
  initialData: EditableData;
  onSave: (data: EditableData) => void;
  onClose: () => void;
  isSaving?: boolean;
}) {
  const [draft, setDraft] = useState<EditableData>({ ...initialData });
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof EditableData>(key: K, value: EditableData[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) set("avatar", await fileToBase64(file));
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) set("coverPhoto", await fileToBase64(file));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="bg-slate-900 border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <h2 className="text-sm font-semibold text-slate-100">Editar perfil</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Photos */}
        <div className="relative mt-4 mb-10">
          <div className="relative h-28 bg-slate-800 overflow-hidden">
            {draft.coverPhoto ? (
              <img src={draft.coverPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium border border-white/20 hover:bg-black/80 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                Alterar capa
              </button>
            </div>
            <input type="file" ref={coverInputRef} onChange={handleCoverFile} accept="image/*" className="hidden" />
          </div>

          <div className="absolute left-5 -bottom-8">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-slate-900 shadow-xl">
                <AvatarImage src={draft.avatar || undefined} alt={draft.fullName} />
                <AvatarFallback className="bg-slate-700 text-white text-xl font-bold">
                  {draft.fullName?.charAt(0) || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera className="h-4 w-4 text-white" />
              </button>
              <input type="file" ref={avatarInputRef} onChange={handleAvatarFile} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="px-5 space-y-5 pb-5">
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Nome completo</label>
            <input
              type="text"
              value={draft.fullName || ""}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-transparent border-b border-white/[0.10] text-slate-100 text-sm py-2.5
                         placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Nome de usuário</label>
            <div className="flex items-center border-b border-white/[0.10] focus-within:border-red-500/50 transition-colors">
              <span className="text-slate-600 text-sm pb-2.5 pr-0.5">@</span>
              <input
                type="text"
                value={draft.username || ""}
                onChange={(e) => set("username", e.target.value)}
                placeholder="nome.usuario"
                className="flex-1 bg-transparent text-slate-100 text-sm py-2.5
                           placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Biografia</label>
            <textarea
              value={draft.bio || ""}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Fale um pouco sobre você…"
              rows={3}
              maxLength={200}
              className="w-full bg-transparent border-b border-white/[0.10] text-slate-100 text-sm py-2.5
                         placeholder:text-slate-600 resize-none focus:outline-none
                         focus:border-red-500/50 transition-colors leading-relaxed"
            />
            <p className="text-right text-xs text-slate-600 mt-1">{(draft.bio || "").length}/200</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/[0.12] text-slate-300
                       hover:border-white/[0.25] hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-red-500 hover:bg-red-600 text-white
                       disabled:opacity-50 transition-colors shadow-lg shadow-red-500/20"
          >
            {isSaving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProfileHeaderProps {
  userData: UserProfileData;
  isOwner: boolean;
  onSave: (data: Partial<UserProfileData>) => void;
  isSaving?: boolean;
  onSendMessage: () => void;
}

export function ProfileHeader({ userData, isOwner, onSave, isSaving, onSendMessage }: ProfileHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div>
        {/* Cover */}
        <div className="relative h-36 md:h-48 overflow-hidden bg-slate-800">
          {userData.coverPhoto ? (
            <img src={userData.coverPhoto} alt="Capa" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
          )}
        </div>

        <div className="px-4 md:px-8">
          {/* Avatar + action buttons */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <Avatar className="h-24 w-24 ring-4 ring-slate-900 shadow-xl">
              <AvatarImage src={userData.avatar || undefined} alt={userData.fullName} />
              <AvatarFallback className="bg-slate-700 text-white text-2xl font-bold">
                {userData.fullName?.charAt(0) || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2 mb-1">
              {isOwner ? (
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                             bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/20"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Editar Perfil
                </button>
              ) : (
                <button
                  onClick={onSendMessage}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                             bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/20"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Mensagem
                </button>
              )}
            </div>
          </div>

          {/* Name + info button */}
          <div className="mb-1">
            <h1 className="text-xl font-black tracking-tight text-slate-100">{userData.fullName}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm text-slate-500">@{userData.username}</p>
              <button
                onClick={() => setInfoOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                <Info className="h-3 w-3" />
                <span className="text-xs">Informações</span>
              </button>
            </div>
          </div>

          {/* Bio */}
          {userData.bio && (
            <p className="text-sm text-slate-400 leading-relaxed mt-2 mb-4 max-w-lg">{userData.bio}</p>
          )}

          {/* Stats — no bottom border */}
          <div className="flex items-center gap-5 py-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-slate-100">{userData.posts ?? 0}</span>
              <span className="text-xs text-slate-500">publicações</span>
            </div>
            {userData.followers !== undefined && (
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-100">{userData.followers}</span>
                <span className="text-xs text-slate-500">seguidores</span>
              </div>
            )}
            {userData.following !== undefined && (
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-100">{userData.following}</span>
                <span className="text-xs text-slate-500">seguindo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editOpen && (
          <EditModal
            initialData={{
              fullName: userData.fullName,
              username: userData.username,
              bio: userData.bio,
              avatar: userData.avatar,
              coverPhoto: userData.coverPhoto,
            }}
            onSave={(data) => { onSave(data); setEditOpen(false); }}
            onClose={() => setEditOpen(false)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {infoOpen && (
          <InfoModal
            userData={userData}
            isOwner={isOwner}
            onClose={() => setInfoOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
