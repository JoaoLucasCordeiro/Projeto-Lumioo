// src/components/shared/ProfileInfo.tsx
import { useState } from "react";
import { Info, X, GraduationCap, Building2, Calendar, Mail, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACADEMIC_LEVEL_MAP: Record<string, string> = {
  UNDERGRADUATE: "Graduação",
  MASTER: "Mestrado",
  PHD: "Doutorado",
  PROFESSOR: "Professor / Pesquisador",
};

function translateLevel(level: string): string {
  return ACADEMIC_LEVEL_MAP[level] ?? level;
}

function formatDate(dateString: string, style: "long" | "short" = "long"): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    month: style === "long" ? "long" : "short",
    year: "numeric",
    ...(style === "long" && { day: "2-digit" }),
  });
}

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function ModalInfoRow({ icon: Icon, label, value }: InfoRowProps) {
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

interface ProfileInfoProps {
  userData: {
    email?: string;
    institution?: string;
    academicLevel?: string;
    birthDate?: string;
    joinDate?: string;
  };
  isOwner: boolean;
  isEditing?: boolean;
}

export function ProfileInfo({ userData, isOwner }: ProfileInfoProps) {
  const [open, setOpen] = useState(false);

  const rows: InfoRowProps[] = [
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
      value: formatDate(userData.joinDate, "short"),
    },
    isOwner && userData.email && {
      icon: Mail,
      label: "Email",
      value: userData.email,
    },
    isOwner && userData.birthDate && {
      icon: Calendar,
      label: "Data de nascimento",
      value: formatDate(userData.birthDate),
    },
  ].filter(Boolean) as InfoRowProps[];

  if (rows.length === 0) return null;

  return (
    <>
      {/* Trigger button */}
      <div className="px-4 md:px-8 pb-5">
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] text-slate-400 text-sm font-medium
                     hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
        >
          <Info className="h-3.5 w-3.5" />
          Informações do perfil
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-slate-900 border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-slate-100">Informações do perfil</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Rows */}
              <div className="px-5 pb-2">
                {rows.map((row) => (
                  <ModalInfoRow key={row.label} {...row} />
                ))}
              </div>

              {/* Footer spacer */}
              <div className="h-3" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
