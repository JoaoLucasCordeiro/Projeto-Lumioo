import About from "@/components/shared/About";
import Hero from "@/components/shared/Hero";
import Header from "@/components/shared/Header";
import { motion } from "framer-motion";
import { useMemo } from "react";
import Objectives from "@/components/shared/Objectives";
import Team from "@/components/shared/Team";
import Contact from "@/components/shared/Contact";
import Footer from "@/components/shared/Footer";

const LandingPage = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        size: Math.random() * 4 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 5,
      })),
    []
  );

  return (
    <section className="relative bg-slate-900 overflow-hidden min-h-screen">

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-slate-900"></div>

        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-red-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-red-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: "mirror",
              delay: p.delay,
            }}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
          />
        ))}
      </div>

      <Header />

      {/* Conteúdo principal com padding responsivo */}
      <main className="relative z-20 pt-20 pb-10"> 

        <section id="inicio" className="min-h-[90vh] md:min-h-screen flex items-center py-10 px-4 sm:px-6">
          <Hero />
        </section>

        <section id="sobre" className="min-h-[90vh] md:min-h-screen flex items-center py-20 px-4 sm:px-6">
          <About />
        </section>

        <section id="objetivos" className="min-h-[90vh] md:min-h-screen flex items-center py-20 px-4 sm:px-6">
          <Objectives />
        </section>

        <section id="equipe" className="min-h-[90vh] md:min-h-screen flex items-center py-20 px-4 sm:px-6">
          <Team />
        </section>

        <section id="contato" className="min-h-[90vh] md:min-h-screen flex items-center py-20 px-4 sm:px-6">
          <Contact />
        </section>

        <section className="w-full">
          <Footer />
        </section>
      </main>

      <style>{`
        html {
          scroll-behavior: smooth;
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
};

export default LandingPage;