// src/pages/SettingsPage.tsx
import { Sidebar } from "../components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, Lock, Bell, Eye, EyeOff, Globe, HelpCircle, LogOut, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/api/profile";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth.context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

function Toast({ message, type, onDismiss }: { message: string, type: 'success' | 'error', onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={`fixed bottom-5 right-5 flex items-center gap-4 rounded-lg px-4 py-3 text-white shadow-lg z-[100] ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
      <p className="font-medium">{message}</p>
    </motion.div>
  );
}

export function SettingsPage() {
  const { logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(passwordData),
    onSuccess: () => {
      showToast("Senha alterada com sucesso!");
      setPasswordData({ currentPassword: '', newPassword: '' });
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const handleChangePassword = () => {
    passwordMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto"><Sidebar /></div>
      <div className="md:hidden fixed top-4 left-4 z-20">
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild><Button variant="outline" size="icon" className="bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/50"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="bg-slate-900/95 backdrop-blur-sm border-slate-800 p-0 w-[280px]"><Sidebar onNavigate={() => setMobileSidebarOpen(false)} /></SheetContent>
        </Sheet>
      </div>

      <main className="overflow-y-auto py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-red-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Configurações</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="h-5 w-5 text-red-400" />
                <h2 className="text-xl font-bold text-slate-100">Segurança</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">Senha atual</Label>
                  <div className="relative">
                    <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} placeholder="Digite sua senha atual" value={passwordData.currentPassword} onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} className="bg-slate-800 border-slate-700 text-slate-200 pr-10" />
                    <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">Nova senha</Label>
                  <div className="relative">
                    <Input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="Digite sua nova senha" value={passwordData.newPassword} onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} className="bg-slate-800 border-slate-700 text-slate-200 pr-10" />
                    <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button onClick={handleChangePassword} className="bg-red-600 hover:bg-red-700">Alterar senha</Button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6"><Bell className="h-5 w-5 text-red-400" /><h2 className="text-xl font-bold text-slate-100">Notificações</h2></div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div><Label htmlFor="notifications" className="text-slate-300">Notificações no app</Label><p className="text-sm text-slate-400">Receber notificações dentro do Lumioo</p></div>
                  <Switch id="notifications" className="data-[state=checked]:bg-red-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label htmlFor="email-notifications" className="text-slate-300">Notificações por email</Label><p className="text-sm text-slate-400">Receber notificações no seu email</p></div>
                  <Switch id="email-notifications" className="data-[state=checked]:bg-red-500" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6"><Globe className="h-5 w-5 text-red-400" /><h2 className="text-xl font-bold text-slate-100">Preferências</h2></div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-slate-300">Idioma</Label>
                  <Select defaultValue="pt-br">
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200"><SelectValue placeholder="Selecione um idioma" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6"><HelpCircle className="h-5 w-5 text-red-400" /><h2 className="text-xl font-bold text-slate-100">Ajuda e Suporte</h2></div>
              <div className="space-y-4">
                <Button onClick={() => setIsTermsOpen(true)} variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700/50">Termos de Serviço</Button>
                <Button onClick={() => setIsPrivacyOpen(true)} variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700/50">Política de Privacidade</Button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6"><LogOut className="h-5 w-5 text-red-400" /><h2 className="text-xl font-bold text-slate-100">Sair</h2></div>
              <div className="space-y-4">
                <p className="text-slate-400">Deseja sair da sua conta?</p>
                <Button
                  onClick={() => setIsLogoutDialogOpen(true)}
                  variant="outline"
                  className="w-full bg-red-600 hover:bg-red-700 border-none hover:text-white  text-white font-semibold" 
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modais */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-200">
          <AlertDialogHeader><AlertDialogTitle className="text-slate-100">Tem certeza que deseja sair?</AlertDialogTitle><AlertDialogDescription>Você será desconectado da sua conta.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={logout} className="bg-red-600 hover:bg-red-700">Sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle className="text-red-400">Termos de Serviço</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4 text-slate-300 space-y-4 text-sm"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p></div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle className="text-red-400">Política de Privacidade</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4 text-slate-300 space-y-4 text-sm"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}