import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth.context";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(identifier, password);
    } catch (err) {
      console.error("Login failed");
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-slate-900 overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-slate-900" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img
              src="/lumioo-logo.png"
              alt="Lumioo"
              className="mx-auto h-48 w-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-xl font-black tracking-tight text-slate-100">
              Acesse sua conta
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Entre para gerenciar seus projetos de pesquisa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Usuário */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2"
              >
                Email ou Nome de Usuário
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="seu@email.com ou nome.usuario"
                  className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-10 focus:border-red-500/60 focus:ring-0 rounded-xl"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-10 pr-10 focus:border-red-500/60 focus:ring-0 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Lembrar / Esqueci */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="h-4 w-4 rounded border border-white/20 bg-slate-900/60 group-hover:border-white/40 peer-checked:bg-red-500 peer-checked:border-red-500 transition-colors" />
                </div>
                <span className="text-sm text-slate-400">Lembrar de mim</span>
              </label>
              <Link
                to="/recuperar-senha"
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Botão */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-full font-semibold shadow-lg shadow-red-500/25 transition-all"
              >
                {isLoading ? "Entrando…" : "Entrar"}
              </button>
            </div>
          </form>
        </div>

        {/* Link para cadastro */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Não tem uma conta?{" "}
          <Link
            to="/cadastro"
            className="text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
