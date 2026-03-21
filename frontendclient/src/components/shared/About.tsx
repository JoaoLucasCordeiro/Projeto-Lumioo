import { motion } from "framer-motion";

const cards = [
  {
    number: "01",
    title: "Conexões Reais",
    description:
      "Encontre e colabore com pessoas que compartilham os mesmos interesses acadêmicos.",
  },
  {
    number: "02",
    title: "Ideias Iluminadas",
    description:
      "Compartilhe descobertas e encontre inspiração para novos projetos.",
  },
  {
    number: "03",
    title: "Objetivos Alcançados",
    description:
      "Transforme suas metas acadêmicas em conquistas concretas.",
  },
];

export default function About() {
  return (
    <section className="relative w-full py-24 md:py-32 z-10">
      <div className="container mx-auto px-6">
        {/* Cabeçalho: texto à esquerda, logo à direita */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-red-900/20 border border-red-700/50 text-red-400 font-semibold text-sm">
              Sobre a Lumioo
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 mb-6 leading-tight">
              Conecte-se,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
                inspire-se
              </span>{" "}
              e transforme ideias
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mb-6" />
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

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:w-1/2 flex items-center justify-center"
          >
            <img
              src="/lumioo-logo.png"
              alt="Lumioo"
              className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Cards numerados editoriais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative overflow-hidden bg-slate-900/40 border border-white/[0.06] rounded-2xl p-8 hover:border-red-500/30 hover:bg-slate-800/40 transition-all duration-300"
            >
              <span className="block text-8xl font-black text-white/[0.04] leading-none mb-4 select-none">
                {card.number}
              </span>
              <div className="w-8 h-0.5 bg-red-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                {card.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
