import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

const objectives = [
  {
    number: "01",
    title: "Conectar Pesquisadores",
    description:
      "Facilitar a interação entre estudantes, professores e pesquisadores para estimular colaborações e networking acadêmico.",
  },
  {
    number: "02",
    title: "Compartilhar Trabalhos",
    description:
      "Permitir que usuários publiquem e descubram projetos e pesquisas, promovendo visibilidade e feedback construtivo.",
  },
  {
    number: "03",
    title: "Expandir Conhecimento",
    description:
      "Criar uma base de dados centralizada de pesquisas acadêmicas acessível para toda a comunidade universitária.",
  },
];

export default function Objectives() {
  return (
    <section className="relative w-full py-24 md:py-32 z-20">
      <div className="container mx-auto px-6">
        {/* Título da Seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left mb-16"
        >
          <Badge variant="outline" className="mb-4 bg-red-900/20 border-red-700/50 text-red-400">
            Missão Lumioo
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 mb-4 leading-tight">
            Nossos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
              Objetivos
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mx-auto lg:mx-0 mb-6" />
        </motion.div>

        {/* Grid de Objetivos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {objectives.map((obj, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative overflow-hidden bg-slate-900/40 border border-white/[0.06] rounded-2xl p-8 hover:border-red-500/30 hover:bg-slate-800/40 transition-all duration-300"
            >
              <span className="block text-8xl font-black leading-none mb-4 select-none text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131] opacity-40">
                {obj.number}
              </span>
              <div className="w-8 h-0.5 bg-red-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-100 mb-3">{obj.title}</h3>
              <p className="text-slate-400 leading-relaxed">{obj.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
