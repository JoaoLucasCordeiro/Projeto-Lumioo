import { Sidebar } from "../components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, User, Lock, Bell, Eye, EyeOff, Globe, HelpCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SettingsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState("pt-br");
  const [theme, setTheme] = useState("dark");

  // Dados do usuário
  const userData = {
    name: "Ana Silva Oliveira",
    username: "ana_pesquisadora",
    email: "ana.silva@academico.ufpe.br",
    avatar: "/user-avatar.jpg"
  };

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      {/* Sidebar Desktop */}
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      
      {/* Botão do Menu Mobile */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-slate-900/95 backdrop-blur-sm border-slate-800 p-0 w-[280px]">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Conteúdo principal */}
      <main className="overflow-y-auto py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-red-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Configurações</h1>
            </div>
          </div>

          {/* Seções de configurações */}
          <div className="space-y-8">
            {/* Seção 1: Conta */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-5 w-5 text-red-400" />
                <h2 className="text-xl font-bold text-slate-100">Conta</h2>
              </div>
              
              <div className="space-y-6">
                {/* Foto de perfil */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userData.avatar} />
                    <AvatarFallback className="bg-slate-700 text-red-400">
                      {userData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20">
                      Alterar foto
                    </Button>
                    <p className="text-xs text-slate-400">JPG, GIF ou PNG. Tamanho máximo de 5MB.</p>
                  </div>
                </div>

                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Nome completo</Label>
                  <Input
                    id="name"
                    defaultValue={userData.name}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>

                {/* Nome de usuário */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-300">Nome de usuário</Label>
                  <Input
                    id="username"
                    defaultValue={userData.username}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={userData.email}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>

                <Button className="bg-red-600 hover:bg-red-700 mt-4">
                  Salvar alterações
                </Button>
              </div>
            </div>

            {/* Seção 2: Segurança */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="h-5 w-5 text-red-400" />
                <h2 className="text-xl font-bold text-slate-100">Segurança</h2>
              </div>
              
              <div className="space-y-6">
                {/* Senha atual */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">Senha atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Digite sua senha atual"
                      className="bg-slate-800 border-slate-700 text-slate-200 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Nova senha */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      className="bg-slate-800 border-slate-700 text-slate-200 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button className="bg-red-600 hover:bg-red-700">
                  Alterar senha
                </Button>
              </div>
            </div>

            {/* Seção 3: Notificações */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="h-5 w-5 text-red-400" />
                <h2 className="text-xl font-bold text-slate-100">Notificações</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="text-slate-300">Notificações no app</Label>
                    <p className="text-sm text-slate-400">Receber notificações dentro do Lumioo</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-slate-300">Notificações por email</Label>
                    <p className="text-sm text-slate-400">Receber notificações no seu email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Preferências */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-5 w-5 text-red-400" />
                <h2 className="text-xl font-bold text-slate-100">Preferências</h2>
              </div>
              
              <div className="space-y-6">
                {/* Idioma */}
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-slate-300">Idioma</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Selecione um idioma" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tema */}
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-slate-300">Tema</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Selecione um tema" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Seção 5: Ajuda */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <HelpCircle className="h-5 w-5 text-red-400" />
                <h2 className="text-xl font-bold text-slate-100">Ajuda</h2>
              </div>
              
              <div className="space-y-4">
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700/50">
                  Central de Ajuda
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700/50">
                  Termos de Serviço
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700/50">
                  Política de Privacidade
                </Button>
              </div>
            </div>

            {/* Seção 6: Sair */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <LogOut className="h-5 w-5 text-red-400" />
                <h2 className="text-xl font-bold text-slate-100">Sair</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-400">Deseja sair da sua conta?</p>
                <Button variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-900/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}