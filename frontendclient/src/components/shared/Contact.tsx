import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <section id="contato" className="relative w-full py-24 md:py-32 z-20">
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
            Fale Conosco
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-4 leading-tight">
            Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">contato</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mx-auto mb-6" />
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Tem dúvidas, sugestões ou quer colaborar com o projeto? Preencha o formulário abaixo ou utilize nossos outros canais de comunicação.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Formulário de Contato */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Seu Nome
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    className="bg-slate-800 border-slate-700 text-slate-200 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Seu Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-slate-800 border-slate-700 text-slate-200 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                  Assunto
                </label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Sobre o que deseja falar?"
                  className="bg-slate-800 border-slate-700 text-slate-200 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Escreva sua mensagem aqui..."
                  className="bg-slate-800 border-slate-700 text-slate-200 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90 text-white font-medium py-6 text-lg transition-all"
                >
                  Enviar Mensagem
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* Informações de Contato */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 flex flex-col justify-center"
          >
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 h-full">
              <h3 className="text-2xl font-bold text-slate-100 mb-6">Outros Canais</h3>
              
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-900/20 rounded-lg text-red-400">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200">Email</h4>
                    <p className="text-slate-400">contato@lumioo.com</p>
                    <a 
                      href="mailto:contato@lumioo.com" 
                      className="text-red-400 hover:text-red-300 text-sm mt-1 inline-block transition-colors"
                    >
                      Enviar email diretamente
                    </a>
                  </div>
                </div>

              
                {/* Localização */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-900/20 rounded-lg text-red-400">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200">Localização</h4>
                    <p className="text-slate-400">Universidade de Pernambuco - UPE</p>
                    <p className="text-slate-400">Campus Garanhuns</p>
                    <a 
                      href="https://maps.google.com?q=UPE+Garanhuns" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300 text-sm mt-1 inline-block transition-colors"
                    >
                      Ver no mapa
                    </a>
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="mt-10">
                <h4 className="text-lg font-semibold text-slate-200 mb-4">Siga-nos</h4>
                <div className="flex gap-4">
                  {['linkedin', 'github'].map((platform) => (
                    <motion.a
                      key={platform}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg text-slate-300 hover:text-white transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}