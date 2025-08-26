import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface TeamCallToActionProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export default function TeamCallToAction({ 
  title, 
  description, 
  buttonText, 
  onButtonClick 
}: TeamCallToActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="text-center mb-16"
    >
      <h2 className="text-3xl font-bold text-slate-100 mb-6">{title}</h2>
      <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
        {description}
      </p>
      <Button 
        className="bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90 px-8 py-6 text-lg"
        onClick={onButtonClick}
      >
        <Mail className="mr-2 h-5 w-5" />
        {buttonText}
      </Button>
    </motion.div>
  );
}