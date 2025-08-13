import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { AnchorLink } from "./AnchorLink"; // Importe o componente AnchorLink

export default function Footer() {
  return (
    <footer className="relative w-full z-20">
      {/* Efeito de partículas sutis no footer */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-red-500 rounded-full filter blur-3xl mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-red-500 rounded-full filter blur-3xl mix-blend-screen"></div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Conteúdo do Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo e descrição */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <AnchorLink to="#inicio" className="flex items-center">
              <img
                src="/lumioo-header.png"
                alt="Logo Lumioo"
                className="h-12 sm:h-24 md:h-20 lg:h-28 xl:h-32 w-auto max-w-full object-contain"
                style={{ maxWidth: "100%" }}
              />
            </AnchorLink>
            <p className="text-slate-400">
              Conectando pesquisadores e potencializando a produção científica no Brasil.
            </p>
            <div className="flex space-x-4">
              {['linkedin', 'github'].map((platform) => (
                <motion.a
                  key={platform}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-red-400 transition-colors"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {platform === 'linkedin' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77a5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                  )}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-slate-200">Links Rápidos</h3>
            <ul className="space-y-3">
              {[
                { name: 'Início', href: '#inicio' },
                { name: 'Sobre', href: '#sobre' },
                { name: 'Objetivos', href: '#objetivos' },
                { name: 'Equipe', href: '#equipe' },
                { name: 'Contato', href: '#contato' },
              ].map((link, index) => (
                <li key={index}>
                  <motion.div whileHover={{ x: 5 }}>
                    <AnchorLink
                      to={link.href}
                      className="text-slate-400 hover:text-red-400 transition-colors flex items-center"
                    >
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {link.name}
                    </AnchorLink>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contato */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-slate-200">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">contato@lumioo.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">+55 (81) 98765-4321</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">UPE Garanhuns, PE, Brasil</span>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-slate-200">Newsletter</h3>
            <p className="text-slate-400">
              Inscreva-se para receber atualizações sobre o projeto Lumioo.
            </p>
            <form className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90"
                >
                  Inscrever-se
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-800 my-12"></div>

        {/* Rodapé inferior */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm text-slate-500 text-center md:text-left"
          >
            © {new Date().getFullYear()} Lumioo. Todos os direitos reservados.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <AnchorLink 
              to="/politica-de-privacidade" 
              className="text-sm text-slate-500 hover:text-red-400 transition-colors"
            >
              Política de Privacidade
            </AnchorLink>
            <AnchorLink 
              to="/termos-de-uso" 
              className="text-sm text-slate-500 hover:text-red-400 transition-colors"
            >
              Termos de Uso
            </AnchorLink>
            <AnchorLink 
              to="/faq" 
              className="text-sm text-slate-500 hover:text-red-400 transition-colors"
            >
              FAQ
            </AnchorLink>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}