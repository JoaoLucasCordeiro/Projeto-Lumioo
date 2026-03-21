import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { AnchorLink } from "./AnchorLink";

const navLinks = [
  { name: "Início", href: "#inicio" },
  { name: "Sobre", href: "#sobre" },
  { name: "Objetivos", href: "#objetivos" },
  { name: "Equipe", href: "#equipe" },
  { name: "Contato", href: "#contato" },
];

const contactItems = [
  { icon: Mail, text: "contato@lumioo.com" },
  { icon: MapPin, text: "UPE Garanhuns, PE" },
  { icon: Phone, text: "+55 (81) 98765-4321" },
];

const legalLinks = [
  { name: "Política de Privacidade", href: "/politica-de-privacidade" },
  { name: "Termos de Uso", href: "/termos-de-uso" },
  { name: "FAQ", href: "/faq" },
];

const Divider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
);

export default function Footer() {
  return (
    <footer className="relative w-full z-20 border-t border-white/[0.06]">
      <div className="container mx-auto px-6">

        {/* Bloco de marca — centralizado */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center py-16 gap-6"
        >
          <AnchorLink to="#inicio">
            <img
              src="/lumioo-logo.png"
              alt="Lumioo"
              className="h-48 w-auto object-contain"
            />
          </AnchorLink>

          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            Conectando pesquisadores e potencializando a produção científica no Brasil.
          </p>

          {/* Ícones sociais */}
          <div className="flex gap-5">
            {/* LinkedIn */}
            <motion.a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-red-400 transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </motion.a>
            {/* GitHub */}
            <motion.a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-red-400 transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </motion.a>
          </div>
        </motion.div>

        <Divider />

        {/* Links de navegação — linha horizontal centralizada */}
        <motion.nav
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-3 py-8"
        >
          {navLinks.map((link) => (
            <AnchorLink
              key={link.href}
              to={link.href}
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              {link.name}
            </AnchorLink>
          ))}
        </motion.nav>

        <Divider />

        {/* Informações de contato — chips em linha */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-x-10 gap-y-3 py-8"
        >
          {contactItems.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-slate-500">
              <Icon className="h-3.5 w-3.5 text-red-500/70 shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>

        <Divider />

        {/* Barra inferior */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6"
        >
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Lumioo. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <AnchorLink
                key={link.href}
                to={link.href}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors"
              >
                {link.name}
              </AnchorLink>
            ))}
          </div>
        </motion.div>

      </div>
    </footer>
  );
}
