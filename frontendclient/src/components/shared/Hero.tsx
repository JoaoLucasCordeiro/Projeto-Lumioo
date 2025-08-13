import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden z-10" >
      {/* Conteúdo Principal */}
      <div className="container mx-auto h-full flex items-center px-6 relative">
        {/* Lado Esquerdo: Texto e CTA */}
        <div className="w-full lg:w-1/2">
          <div className="max-w-2xl text-center lg:text-left">
            {/* Tag de destaque */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff3131]/10 border border-[#ff3131]/30 rounded-full mb-8"
            >
              <GraduationCap className="h-4 w-4 text-[#ff3131]" />
              <span className="text-sm font-medium text-[#ff3131]">
                Rede Social Acadêmica
              </span>
            </motion.div>

            {/* Título */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-slate-100"
            >
              Revolucione sua{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
                carreira acadêmica
              </span>
            </motion.h1>

            {/* Descrição */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-300 mb-10 leading-relaxed"
            >
              Conecte-se com pesquisadores, compartilhe trabalhos e acelere sua
              produção científica na maior plataforma acadêmica do Brasil.
            </motion.p>

            {/* Botões */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button className="bg-[#ff3131] hover:bg-red-600 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            <Button
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-900/20 hover:text-red-300 font-medium px-8 py-6 text-lg transition-all"
                asChild
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explorar Pesquisas
                </motion.button>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Lado Direito: Logo */}
        <div className="hidden lg:flex w-1/2 h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "backOut" }}
            className="relative flex items-center justify-center w-full"
          >
            {/* Ícone de fundo suave */}
            <GraduationCap className="absolute text-red-500/10 text-[25rem] opacity-50" />

            {/* Logo e slogan */}
            <div className="relative text-center z-10">
              <img
                src="/lumioo-logo.png"
                alt="Lumioo Logo"
                className="w-full max-w-[500px] md:max-w-[650px] lg:max-w-[800px] mx-auto mb-4 h-auto"
              />
            
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
