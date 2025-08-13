import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
    return (
        <section className="relative w-full min-h-screen bg-slate-900 overflow-hidden flex items-center justify-center p-4">
            {/* Efeitos de fundo consistentes com o restante do site */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-slate-900"></div>
                <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-64 md:h-64 bg-red-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Partículas sutis */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{
                            duration: Math.random() * 10 + 5,
                            repeat: Infinity,
                            repeatType: "mirror",
                            delay: Math.random() * 5,
                        }}
                        style={{
                            width: `${Math.random() * 4 + 1}px`,
                            height: `${Math.random() * 4 + 1}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            {/* Card de Login */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-xl"
            >
                {/* Cabeçalho */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-4">
                        <img
                            src="/lumioo-logo.png"
                            alt="Logo Lumioo"
                            className="mx-auto h-36 w-36 md:h-40 md:w-40 lg:h-48 lg:w-48 transition-all"
                            style={{ maxWidth: "540px" }}
                        />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-100 mb-2">Acesse sua conta</h1>
                    <p className="text-slate-400">Entre para gerenciar seus projetos de pesquisa</p>
                </div>

                {/* Formulário */}
                <form className="space-y-6">
                    {/* Campo Email/Usuário */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                            Email ou Nome de Usuário
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                                id="email"
                                type="text"
                                placeholder="seu@email.com ou nome.usuario"
                                className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Campo Senha */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Lembrar de mim e Esqueci a senha */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-red-500 focus:ring-red-500 border-slate-700 rounded bg-slate-800"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                                Lembrar de mim
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                to="/recuperar-senha"
                                className="font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>
                    </div>

                    {/* Botão de Login */}
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90 text-white font-medium py-6 text-lg transition-all"
                        >
                            Entrar
                        </Button>
                    </motion.div>
                </form>

                {/* Divisor */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-800 text-slate-400">ou</span>
                    </div>
                </div>

                {/* Link para Cadastro */}
                <div className="text-center">
                    <p className="text-sm text-slate-400">
                        Não tem uma conta?{" "}
                        <Link
                            to="/cadastro"
                            className="font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </motion.div>
        </section>
    );
}