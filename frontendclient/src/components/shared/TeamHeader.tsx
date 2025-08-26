import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

interface TeamHeaderProps {
  subtitle: string;
  description: string;
  children: ReactNode;
}

export default function TeamHeader({ subtitle, description, children }: TeamHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      <Badge variant="outline" className="mb-4 bg-red-900/20 border-red-700/50 text-red-400">
        {subtitle}
      </Badge>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-6 leading-tight">
        {children}
      </h1>
      <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mx-auto mb-8" />
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}