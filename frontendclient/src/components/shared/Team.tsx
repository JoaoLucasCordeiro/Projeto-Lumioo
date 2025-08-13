import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import type { JSX } from "react";

export default function Team() {
  const teamMembers = [
    {
      name: "João Lucas Soares",
      role: "Aluno - PIBIC",
      image: "/joao-lucas.jpg",
      initials: "JL",
      social: {
        linkedin: "#",
        lattes: "#",
        github: "#"
      }
    },
    {
      name: "Ivaldir Honório de Farias Junior",
      role: "Professor e Orientador",
      image: "/ivaldir.jpg",
      initials: "IH",
      social: {
        linkedin: "#",
        lattes: "#",
        email: "#"
      }
    }
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
            Equipe Lumioo
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-4 leading-tight">
            Conheça nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">equipe</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mx-auto lg:mx-0 mb-6" />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Texto sobre a equipe */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              O Lumioo é fruto do trabalho dedicado de nossa equipe, formada por <strong className="text-red-400">João Lucas Soares</strong>, aluno do PIBIC, e <strong className="text-red-400">Ivaldir Honório de Farias Junior</strong>, professor e orientador. 
            </p>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Este projeto só foi possível graças ao apoio da <strong className="text-red-400">Universidade de Pernambuco (UPE)</strong>, que nos proporciona recursos, orientação e inspiração para transformar ideias em soluções reais. 
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              Juntos, desenvolvemos o Lumioo para conectar pesquisadores, facilitar a divulgação de trabalhos acadêmicos e potencializar a produção científica no Brasil.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Button 
                variant="outline" 
                className="border-red-400 text-red-400 hover:bg-red-900/20 hover:text-red-300 font-medium px-8 py-6 text-lg transition-all"
                asChild
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Saiba Mais Sobre Nós
                </motion.button>
              </Button>
              <Button 
                className="bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90 text-white font-medium px-8 py-6 text-lg transition-all"
                asChild
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contate-nos
                </motion.button>
              </Button>
            </motion.div>
          </motion.div>

          {/* Membros da equipe */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center h-full"
                >
                  <div className="flex flex-col items-center h-full">
                    <Avatar className="h-28 w-28 mb-5 border-2 border-red-500/50">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback className="bg-red-900/30 text-red-400 text-2xl font-bold">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 mb-1 line-clamp-2">{member.name}</h3>
                        <p className="text-slate-400 mb-4 text-sm">{member.role}</p>
                      </div>
                      
                      <div className="flex justify-center gap-3 mt-4">
                        {Object.entries(member.social).map(([platform, url]) => (
                          <TooltipProvider key={platform} delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.a 
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-red-400 transition-colors"
                                  whileHover={{ scale: 1.1 }}
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Logo da UPE - Layout corrigido */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex justify-center"
            >
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-4 w-full max-w-md">
                <p className="text-slate-400 text-sm mb-3 text-center">Apoio institucional</p>
                <div className="flex justify-center">
                  <img 
                    src="/upe-logo.png" 
                    alt="Universidade de Pernambuco" 
                    className="h-10 object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Componente auxiliar para ícones sociais
function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, JSX.Element> = {
    linkedin: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    ),
    github: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
      </svg>
    ),
    lattes: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    email: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    )
  };

  return icons[platform] || <span className="text-xs">{platform}</span>;
}