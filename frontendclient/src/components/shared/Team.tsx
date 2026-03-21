import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import type { JSX } from "react";
import { Link } from "react-router-dom";

export default function Team() {
  const teamMembers = [
    {
      name: "João Lucas Soares",
      role: "Aluno - PIBIC",
      image: "/joaolucas.jpg",
      initials: "JL",
      social: {
        linkedin: "#",
        lattes: "#",
        github: "#",
      },
    },
    {
      name: "Ivaldir Honório",
      role: "Professor e Orientador",
      image: "/ivaldir.jpg",
      initials: "IH",
      social: {
        linkedin: "#",
        lattes: "#",
        email: "#",
      },
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
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 bg-red-900/20 border-red-700/50 text-red-400">
            Equipe Lumioo
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 mb-4 leading-tight">
            Conheça nossa{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
              equipe
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mx-auto mb-6" />
        </motion.div>

        {/* Texto narrativo centralizado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto text-center mb-16 space-y-5"
        >
          <p className="text-lg text-slate-300 leading-relaxed">
            O Lumioo é fruto do trabalho dedicado de nossa equipe, formada por{" "}
            <strong className="text-red-400">João Lucas Soares</strong>, aluno do PIBIC, e{" "}
            <strong className="text-red-400">Ivaldir Honório de Farias Junior</strong>, professor e orientador.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            Este projeto só foi possível graças ao apoio da{" "}
            <strong className="text-red-400">Universidade de Pernambuco (UPE)</strong>, que nos proporciona recursos, orientação e inspiração para transformar ideias em soluções reais.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            Juntos, desenvolvemos o Lumioo para conectar pesquisadores, facilitar a divulgação de trabalhos acadêmicos e potencializar a produção científica no Brasil.
          </p>
        </motion.div>

        {/* Cards dos membros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 + index * 0.15 }}
              className="group relative overflow-hidden bg-slate-900/40 border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center text-center hover:border-red-500/30 hover:bg-slate-800/40 transition-all duration-300"
            >
              <Avatar className="h-28 w-28 mb-5 ring-2 ring-white/[0.06] group-hover:ring-red-500/40 transition-all duration-300">
                <AvatarImage src={member.image} alt={member.name} />
                <AvatarFallback className="bg-red-900/30 text-red-400 text-2xl font-bold">
                  {member.initials}
                </AvatarFallback>
              </Avatar>

              <div className="w-8 h-0.5 bg-red-500 mb-4" />

              <h3 className="text-xl font-black tracking-tight text-slate-100 mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-slate-500 mb-6">{member.role}</p>

              <div className="flex gap-5">
                {Object.entries(member.social).map(([platform, url]) => (
                  <TooltipProvider key={platform} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <SocialIcon platform={platform} />
                        </motion.a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="capitalize">{platform}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Botões centralizados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap gap-4 justify-center"
        >
          <Link to="/nosso-time">
            <button className="border border-white/20 text-slate-300 hover:border-white/40 hover:text-white px-8 py-3 rounded-full transition-colors">
              Saiba Mais Sobre Nós
            </button>
          </Link>
          <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-red-500/25 transition-all">
            Contate-nos
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, JSX.Element> = {
    linkedin: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    ),
    github: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
      </svg>
    ),
    lattes: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    email: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
  };

  return icons[platform] || <span className="text-xs">{platform}</span>;
}
