import { Home, Bookmark, FileText, Folder, Settings, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Feed', path: '/feed' },
    { icon: <FileText className="h-5 w-5" />, label: 'Posts', path: '/posts' },
    { icon: <Folder className="h-5 w-5" />, label: 'Trabalhos', path: '/trabalhos' },
    { icon: <Bookmark className="h-5 w-5" />, label: 'Projetos', path: '/projetos' },
    { icon: <User className="h-5 w-5" />, label: 'Perfil', path: '/perfil' },
    { icon: <Settings className="h-5 w-5" />, label: 'Configurações', path: '/configuracoes' },
  ];

  const handleLogout = async () => {
    try {
      navigate('/'); // Redireciona para a página inicial
      if (onNavigate) onNavigate(); // Fecha o sidebar mobile se estiver aberto
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 w-full">
      {/* Logo */}
      <Link
        to="/"
        className="mb-10"
        onClick={onNavigate}
      >
        <div className="flex items-center justify-center space-x-3">
          <img src="/logo-lumioo-logged.svg" alt="Lumioo logo" className="h-24 w-auto" />
        </div>
      </Link>

      {/* Avatar do Usuário */}
      <div className="flex items-center space-x-3 mb-8 p-3 rounded-lg bg-slate-800/50">
        <Avatar className="h-10 w-10 border-2 border-red-500/30">
          <AvatarImage src="/user1.jpg" alt="Usuário" />
          <AvatarFallback className="bg-slate-700 text-red-400 font-bold">U</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-slate-100">Pesquisador</p>
          <p className="text-xs text-slate-400">@pesquisador_upe</p>
        </div>
      </div>

      {/* Itens de Navegação */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <motion.div
            key={item.path}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={item.path}
              className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
              onClick={onNavigate}
            >
              <div className="text-red-400">{item.icon}</div>
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}

        {/* Botão de Sair com tratamento especial */}
        <motion.div
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => setLogoutDialogOpen(true)}
            className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:text-red-400 hover:bg-slate-800/50 transition-colors w-full"
          >
            <div className="text-red-400"><LogOut className="h-5 w-5" /></div>
            <span className="font-medium">Sair</span>
          </button>
        </motion.div>
      </nav>

      {/* Rodapé */}
      <div className="mt-auto pt-6 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Lumioo. Todos os direitos reservados.
        </p>
      </div>

      {/* Modal de confirmação de logout */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Tem certeza que deseja sair?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado da sua conta e redirecionado para a página inicial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-200 hover:bg-slate-700/50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}