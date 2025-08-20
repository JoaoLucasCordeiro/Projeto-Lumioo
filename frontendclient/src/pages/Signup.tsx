import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, GraduationCap, Calendar, Lock, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function SignupPage() {
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        fullName: "",
        academicEmail: "",
        username: "",
        password: "",
        confirmPassword: "",
        institution: "",
        academicLevel: "",
        dateOfBirth: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            academicLevel: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); 

        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true); 

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    academicEmail: formData.academicEmail,
                    username: formData.username,
                    password: formData.password,
                    institution: formData.institution,
                    academicLevel: formData.academicLevel,
                    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocorreu um erro ao criar a conta.');
            }

            alert('Conta criada com sucesso! Você será redirecionado para o login.'); 
            navigate('/login');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <section className="relative w-full min-h-screen bg-slate-900 overflow-hidden flex items-center justify-center p-4">
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
                    <h1 className="text-2xl font-bold text-slate-100 mb-2">Crie sua conta</h1>
                    <p className="text-slate-400">Junte-se à comunidade de pesquisa acadêmica</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                            Nome Completo
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Seu nome completo"
                                className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="academicEmail" className="block text-sm font-medium text-slate-300 mb-2">
                            Email Acadêmico
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                                id="academicEmail"
                                type="email"
                                placeholder="seu@email.academico"
                                className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500"
                                value={formData.academicEmail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                            Nome de Usuário
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                                id="username"
                                type="text"
                                placeholder="nome.de.usuario"
                                className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

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
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="institution" className="block text-sm font-medium text-slate-300 mb-2">
                            Faculdade/Instituição
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <GraduationCap className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                                id="institution"
                                type="text"
                                placeholder="Sua instituição de ensino"
                                className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500"
                                value={formData.institution}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="academicLevel" className="block text-sm font-medium text-slate-300">
                            Nível Acadêmico
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <GraduationCap className="h-5 w-5 text-slate-500" />
                            </div>
                            <Select onValueChange={handleSelectChange} required>
                                <SelectTrigger
                                    className="w-full bg-slate-800 border-slate-700 text-slate-200 pl-10 h-10 focus:ring-red-500 focus:border-red-500"
                                >
                                    <SelectValue placeholder="Selecione seu nível" />
                                </SelectTrigger>
                                <SelectContent
                                    className="w-[var(--radix-select-trigger-width)] bg-slate-800 border-slate-700 text-slate-200"
                                    position="popper"
                                    sideOffset={4}
                                >
                                    <SelectItem value="UNDERGRADUATE" className="hover:bg-slate-700 focus:bg-slate-700">
                                        Estudante de Graduação
                                    </SelectItem>
                                    <SelectItem value="MASTER" className="hover:bg-slate-700 focus:bg-slate-700">
                                        Estudante de Mestrado
                                    </SelectItem>
                                    <SelectItem value="PHD" className="hover:bg-slate-700 focus:bg-slate-700">
                                        Estudante de Doutorado
                                    </SelectItem>
                                    <SelectItem value="PROFESSOR" className="hover:bg-slate-700 focus:bg-slate-700">
                                        Professor/Pesquisador
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-300 mb-2">
                            Data de Nascimento
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500 [&::-webkit-calendar-picker-indicator]:invert-[0.7]"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg">
                            <AlertCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                            <div>{error}</div>
                        </div>
                    )}

                    {/* Termos e Condições */}
                    <div className="flex items-start pt-2">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                className="h-4 w-4 text-red-500 focus:ring-red-500 border-slate-700 rounded bg-slate-800"
                                required
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-slate-400">
                                Eu concordo com os{" "}
                                <Link to="/termos" className="text-red-400 hover:text-red-300 transition-colors">
                                    Termos de Serviço
                                </Link>{" "}
                                e{" "}
                                <Link to="/privacidade" className="text-red-400 hover:text-red-300 transition-colors">
                                    Política de Privacidade
                                </Link>
                            </label>
                        </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-4">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90 text-white font-medium py-6 text-lg transition-all disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </Button>
                    </motion.div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-slate-400">
                        Já tem uma conta?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                            Faça login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
