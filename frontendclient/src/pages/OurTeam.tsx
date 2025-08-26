
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import TeamParticles from '@/components/shared/Particles';
import ProjectInfo from '@/components/shared/ProjectInfo';
import TeamCallToAction from '@/components/shared/TeamCallToAction';
import TeamHeader from '@/components/shared/TeamHeader';
import TeamMemberCard, { type TeamMember } from '@/components/shared/TeamMemberCard';
import UniversityRecognition from '@/components/shared/UniversityRecognition';
import { Calendar, MapPin, Book } from "lucide-react";
import { motion } from "framer-motion";

export default function OurTeam() {
  const teamMembers: TeamMember[] = [
    {
      name: "João Lucas Soares",
      role: "Desenvolvedor Full-Stack",
      image: "/joaolucas.jpg",
      initials: "JL",
      bio: "Desenvolvedor full-stack com expertise em React, Node.js e diversas tecnologias modernas. Responsável por toda a implementação técnica do Lumioo, desde a concepção até o deploy.",
      skills: ["React", "TypeScript", "Node.js", "UI/UX", "DevOps", "Databases"],
      contributions: ["Arquitetura do sistema", "Front-end e Back-end", "Design UI/UX", "Deploy e Infraestrutura"],
      social: {
        linkedin: "#",
        github: "#",
        email: "#"
      }
    },
    {
      name: "Prof. Ivaldir Honório",
      role: "Orientador Acadêmico",
      image: "/ivaldir.jpg",
      initials: "IH",
      bio: "Professor orientador com vasta experiência em orientação de projetos de pesquisa. Fornece a direção acadêmica e suporte institucional necessários para o desenvolvimento do Lumioo.",
      skills: ["Orientação Acadêmica", "Metodologia de Pesquisa", "Acompanhamento Científico"],
      contributions: ["Orientação estratégica", "Validação acadêmica", "Conexões institucionais"],
      social: {
        linkedin: "#",
        lattes: "#",
        email: "#"
      }
    }
  ];

  const projectInfo = [
    {
      icon: Calendar,
      title: "Início do Projeto",
      description: "Desenvolvimento iniciado em 2023 como parte do programa PIBIC"
    },
    {
      icon: MapPin,
      title: "Localização",
      description: "Universidade de Pernambuco - Campus Garanhuns"
    },
    {
      icon: Book,
      title: "Área de Pesquisa",
      description: "Inovação em Tecnologia Educacional e Redes Acadêmicas"
    },
  ];

  const handleContactClick = () => {
    // Lógica para contato
    console.log("Botão de contato clicado");
  };

  const handleUniversityClick = () => {
    window.open("https://upe.br", "_blank");
  };

  return (
    <section className="relative bg-slate-900 overflow-hidden min-h-screen">
      <Header />

      <TeamParticles />

      <div className="relative z-20 py-24 md:py-32">
        <div className="container mx-auto px-6">
          <TeamHeader
            subtitle="Nossa Equipe"
            description="Uma equipe dedicada que combina expertise técnica com visão acadêmica para criar uma plataforma 
  que conecta mentes brilhantes e transforma a colaboração científica."
          >
            Conheça quem <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">desenvolveu</span> o Lumioo
          </TeamHeader>

          <ProjectInfo items={projectInfo} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} index={index} />
            ))}
          </motion.div>

          <TeamCallToAction
            title="Junte-se à Nossa Missão"
            description="O Lumioo está em constante evolução. Se você se identifica com nossa missão e quer contribuir 
            para transformar a colaboração acadêmica, entre em contato conosco."
            buttonText="Entrar em Contato"
            onButtonClick={handleContactClick}
          />

          <UniversityRecognition
            title="Apoio Institucional"
            description="Desenvolvido na Universidade de Pernambuco (UPE) através do Programa Institucional de 
            Bolsas de Iniciação Científica (PIBIC). Este projeto representa o compromisso da UPE com 
            a inovação e excelência acadêmica."
            buttonText="Conheça a UPE"
            onButtonClick={handleUniversityClick}
          />
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @media (max-width: 640px) {
          .animate-blob {
            animation: none;
            opacity: 0.1;
          }
        }
      `}</style>
    </section>
  );
}