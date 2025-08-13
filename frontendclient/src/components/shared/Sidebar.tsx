import { Home, Bookmark, FileText, Folder, Settings, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function Sidebar() {
  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Feed', path: '/feed' },
    { icon: <FileText className="h-5 w-5" />, label: 'Posts', path: '/posts' },
    { icon: <Folder className="h-5 w-5" />, label: 'Trabalhos', path: '/trabalhos' },
    { icon: <Bookmark className="h-5 w-5" />, label: 'Projetos', path: '/projetos' },
    { icon: <User className="h-5 w-5" />, label: 'Perfil', path: '/perfil' },
    { icon: <Settings className="h-5 w-5" />, label: 'Configurações', path: '/configuracoes' },
    { icon: <LogOut className="h-5 w-5" />, label: 'Sair', path: '/logout' }
  ];

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6"
    >
      {/* Logo */}
      <Link to="/" className="mb-2">
        <div className="flex items-center space-x-3">
          <img src="/logo-lumioo-logged.svg" alt="Lumioo" className="h-40 w-auto" />

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
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={item.path}
              className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
            >
              <div className="text-red-400">{item.icon}</div>
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="mt-auto pt-6 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Lumioo. Todos os direitos reservados.
        </p>
      </div>
    </motion.div>
  );
}