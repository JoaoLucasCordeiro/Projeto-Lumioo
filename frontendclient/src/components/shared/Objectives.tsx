import { BookOpen, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export default function Objectives() {
  const objectives = [
    {
      title: "Conectar Pesquisadores",
      description:
        "Facilitar a interação entre estudantes, professores e pesquisadores para estimular colaborações e networking acadêmico.",
      icon: <Users className="h-6 w-6 text-red-400" />,
    },
    {
      title: "Compartilhar Trabalhos",
      description:
        "Permitir que usuários publiquem e descubram projetos e pesquisas, promovendo visibilidade e feedback construtivo.",
      icon: <BookOpen className="h-6 w-6 text-red-400" />,
    },
    {
      title: "Expandir Conhecimento",
      description:
        "Criar uma base de dados centralizada de pesquisas acadêmicas acessível para toda a comunidade universitária.",
      icon: <Globe className="h-6 w-6 text-red-400" />,
    },
  ];

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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-4 leading-tight">
            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Objetivos</span>
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
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8 hover:border-red-500/50 transition-all h-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-center w-14 h-14 bg-red-900/20 rounded-full mb-6 border border-red-500/20">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {obj.icon}
                  </motion.div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-slate-100 mb-3">{obj.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{obj.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex justify-center lg:justify-start"
        >
          <Button 
            className="bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90 text-white font-medium px-8 py-6 text-lg transition-all"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Comece a Explorar
            </motion.button>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}