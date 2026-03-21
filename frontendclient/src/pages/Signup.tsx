import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, GraduationCap, Calendar, Lock, AlertCircle, Check, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const STEPS = [
  { number: 1, label: "Pessoal" },
  { number: 2, label: "Acesso" },
  { number: 3, label: "Formação" },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = avançar, -1 = voltar

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
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.fullName || !formData.dateOfBirth || !formData.username) {
        setError("Preencha todos os campos antes de continuar.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.academicEmail || !formData.password || !formData.confirmPassword) {
        setError("Preencha todos os campos antes de continuar.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem.");
        return false;
      }
      if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.institution || !formData.academicLevel) {
        setError("Preencha todos os campos antes de continuar.");
        return false;
      }
      if (!terms) {
        setError("Você precisa aceitar os Termos de Serviço para continuar.");
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(null);
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok) throw new Error(data.error || "Ocorreu um erro ao criar a conta.");

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
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
              className="mx-auto h-20 w-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step > s.number
                        ? "bg-red-500 text-white"
                        : step === s.number
                        ? "bg-red-500 text-white ring-4 ring-red-500/20"
                        : "bg-slate-700 text-slate-500"
                    }`}
                  >
                    {step > s.number ? <Check className="h-4 w-4" /> : s.number}
                  </div>
                  <span
                    className={`text-xs transition-colors duration-300 ${
                      step >= s.number ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-px mx-2 mb-5 transition-colors duration-300 ${
                      step > s.number ? "bg-red-500/60" : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); goNext(); }}>
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  {step === 1 && (
                    <>
                      <div className="mb-2">
                        <h2 className="text-xl font-black tracking-tight text-slate-100">Dados Pessoais</h2>
                        <p className="text-sm text-slate-500 mt-1">Vamos começar com o básico.</p>
                      </div>

                      <div>
                        <label htmlFor="fullName" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                          Nome Completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Seu nome completo"
                            className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-10 focus:border-red-500/60 focus:ring-0 rounded-xl"
                            value={formData.fullName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="username" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                          Nome de Usuário
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">@</span>
                          <Input
                            id="username"
                            type="text"
                            placeholder="nome.de.usuario"
                            className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-8 focus:border-red-500/60 focus:ring-0 rounded-xl"
                            value={formData.username}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="dateOfBirth" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                          Data de Nascimento
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            id="dateOfBirth"
                            type="date"
                            className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-10 focus:border-red-500/60 focus:ring-0 rounded-xl [&::-webkit-calendar-picker-indicator]:invert-[0.5]"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="mb-2">
                        <h2 className="text-xl font-black tracking-tight text-slate-100">Dados de Acesso</h2>
                        <p className="text-sm text-slate-500 mt-1">Crie suas credenciais de entrada.</p>
                      </div>

                      <div>
                        <label htmlFor="academicEmail" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                          Email Acadêmico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            id="academicEmail"
                            type="email"
                            placeholder="seu@email.academico"
                            className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-10 focus:border-red-500/60 focus:ring-0 rounded-xl"
                            value={formData.academicEmail}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                          Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-10 pr-10 focus:border-red-500/60 focus:ring-0 rounded-xl"
                            value={formData.password}
                            onChange={handleChange}
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

                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                          Confirmar Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repita a senha"
                            className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-10 pr-10 focus:border-red-500/60 focus:ring-0 rounded-xl"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="mb-2">
                        <h2 className="text-xl font-black tracking-tight text-slate-100">Formação Acadêmica</h2>
                        <p className="text-sm text-slate-500 mt-1">Conte-nos sobre sua vida acadêmica.</p>
                      </div>

                      <div>
                        <label htmlFor="institution" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                          Faculdade / Instituição
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            id="institution"
                            type="text"
                            placeholder="Sua instituição de ensino"
                            className="bg-slate-900/60 border-white/[0.08] text-slate-200 pl-10 focus:border-red-500/60 focus:ring-0 rounded-xl"
                            value={formData.institution}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                          Nível Acadêmico
                        </label>
                        <Select
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, academicLevel: value }))
                          }
                          value={formData.academicLevel}
                        >
                          <SelectTrigger className="w-full bg-slate-900/60 border-white/[0.08] text-slate-200 rounded-xl focus:ring-0 focus:border-red-500/60 h-10">
                            <SelectValue placeholder="Selecione seu nível" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/[0.08] text-slate-200">
                            <SelectItem value="UNDERGRADUATE" className="focus:bg-slate-700">Estudante de Graduação</SelectItem>
                            <SelectItem value="MASTER" className="focus:bg-slate-700">Estudante de Mestrado</SelectItem>
                            <SelectItem value="PHD" className="focus:bg-slate-700">Estudante de Doutorado</SelectItem>
                            <SelectItem value="PROFESSOR" className="focus:bg-slate-700">Professor / Pesquisador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Termos */}
                      <label className="flex items-start gap-3 cursor-pointer group mt-2">
                        <div className="relative mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={terms}
                            onChange={(e) => setTerms(e.target.checked)}
                          />
                          <div className={`h-4 w-4 rounded border transition-colors ${terms ? "bg-red-500 border-red-500" : "bg-slate-900/60 border-white/20 group-hover:border-white/40"}`}>
                            {terms && <Check className="h-3 w-3 text-white m-auto mt-0.5" />}
                          </div>
                        </div>
                        <span className="text-sm text-slate-400 leading-relaxed">
                          Li e concordo com os{" "}
                          <Link to="/termos" className="text-red-400 hover:text-red-300 transition-colors">
                            Termos de Serviço
                          </Link>{" "}
                          e a{" "}
                          <Link to="/privacidade" className="text-red-400 hover:text-red-300 transition-colors">
                            Política de Privacidade
                          </Link>
                        </span>
                      </label>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 mt-5 text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Navegação */}
            <div className={`flex gap-3 mt-8 ${step > 1 ? "justify-between" : "justify-end"}`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="border border-white/20 text-slate-300 hover:border-white/40 hover:text-white px-6 py-2.5 rounded-full text-sm transition-colors"
                >
                  ← Voltar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-8 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-red-500/25 transition-all"
              >
                {step < 3 ? "Próximo →" : loading ? "Criando conta…" : "Criar Conta"}
              </button>
            </div>
          </form>
        </div>

        {/* Link para login */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-red-400 hover:text-red-300 transition-colors font-medium">
            Faça login
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
