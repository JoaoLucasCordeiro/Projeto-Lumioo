import { motion } from "framer-motion";
import { Users, Lightbulb, Target } from "lucide-react";


export default function About() {
  return (
    <section className="relative w-full py-24 md:py-32 z-10">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
         <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <span className="inline-block mb-4 px-3 py-1 rounded-full bg-red-900/20 border border-red-700/50 text-red-400 font-semibold">
            Sobre a Lumioo
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-6 leading-tight">
            Conecte-se, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">inspire-se</span> e transforme ideias
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mx-auto mb-6" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-300 leading-relaxed"
          >
            A Lumioo é a ponte entre mentes brilhantes e oportunidades. 
            Seja para divulgar sua pesquisa, encontrar parceiros de projeto 
            ou simplesmente aprender algo novo, estamos aqui para impulsionar 
            seu crescimento acadêmico.
          </motion.p>
        </motion.div>
        </div>

        {/* Cards de valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 text-center hover:scale-105 transition-transform"
          >
            <Users className="mx-auto text-red-500 mb-4 h-12 w-12" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Conexões Reais
            </h3>
            <p className="text-slate-400 text-sm">
              Encontre e colabore com pessoas que compartilham os mesmos interesses acadêmicos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 text-center hover:scale-105 transition-transform"
          >
            <Lightbulb className="mx-auto text-yellow-400 mb-4 h-12 w-12" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Ideias Iluminadas
            </h3>
            <p className="text-slate-400 text-sm">
              Compartilhe descobertas e encontre inspiração para novos projetos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 text-center hover:scale-105 transition-transform"
          >
            <Target className="mx-auto text-green-400 mb-4 h-12 w-12" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Objetivos Alcançados
            </h3>
            <p className="text-slate-400 text-sm">
              Transforme suas metas acadêmicas em conquistas concretas.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
