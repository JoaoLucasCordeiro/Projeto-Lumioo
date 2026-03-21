import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Mail, MapPin } from "lucide-react";

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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 mb-4 leading-tight">
            Entre em{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
              contato
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mx-auto mb-6" />
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Tem dúvidas, sugestões ou quer colaborar com o projeto? Preencha o formulário abaixo.
          </p>
        </motion.div>

        {/* Formulário centralizado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
                  Seu Nome
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  className="bg-transparent border-0 border-b border-slate-700 rounded-none focus-visible:ring-0 focus:border-red-500 px-0 py-3 text-slate-200 placeholder:text-slate-600"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
                  Seu Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="bg-transparent border-0 border-b border-slate-700 rounded-none focus-visible:ring-0 focus:border-red-500 px-0 py-3 text-slate-200 placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
                Assunto
              </label>
              <Input
                id="subject"
                type="text"
                placeholder="Sobre o que deseja falar?"
                className="bg-transparent border-0 border-b border-slate-700 rounded-none focus-visible:ring-0 focus:border-red-500 px-0 py-3 text-slate-200 placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">
                Mensagem
              </label>
              <Textarea
                id="message"
                rows={5}
                placeholder="Escreva sua mensagem aqui..."
                className="bg-transparent border-0 border-b border-slate-700 rounded-none focus-visible:ring-0 focus:border-red-500 px-0 py-3 text-slate-200 placeholder:text-slate-600 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-full font-semibold mt-6 transition-colors"
            >
              Enviar Mensagem
            </Button>
          </form>

          {/* Info chips */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex gap-8 justify-center flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 text-red-400" />
                <span>contato@lumioo.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-red-400" />
                <span>UPE Garanhuns</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
