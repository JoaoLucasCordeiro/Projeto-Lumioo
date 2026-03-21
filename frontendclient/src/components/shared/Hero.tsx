import { ArrowRight, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden z-10">
      <div className="container mx-auto h-full flex items-center justify-center px-6 relative">
        <div className="flex flex-col items-center text-center max-w-4xl w-full">
          {/* Badge pill */}
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
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight text-slate-100"
          >
            Revolucione sua{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
              carreira acadêmica.
            </span>
          </motion.h1>

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl"
          >
            Conecte-se com pesquisadores, compartilhe trabalhos e cresça.
          </motion.p>

          {/* Botões */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link to="/login">
              <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-red-500/25 transition-all flex items-center gap-2">
                Criar Conta Gratuita
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>

            <Link to="/explorar-projetos">
              <button className="border border-white/20 text-slate-300 hover:border-white/40 hover:text-white px-8 py-3 rounded-full transition-colors">
                Explorar Projetos →
              </button>
            </Link>
          </motion.div>

          {/* Strip de valores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-lg"
          >
            <div className="border-t border-white/10 pt-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-white">Pesquise</span>
                  <span className="text-xs text-slate-500">suas ideias</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-white">Colabore</span>
                  <span className="text-xs text-slate-500">com outros</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-white">Publique</span>
                  <span className="text-xs text-slate-500">seus trabalhos</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
