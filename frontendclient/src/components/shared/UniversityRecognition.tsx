import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { University, Award } from "lucide-react";

interface UniversityRecognitionProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export default function UniversityRecognition({ 
  title, 
  description, 
  buttonText, 
  onButtonClick 
}: UniversityRecognitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="text-center bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 md:p-12"
    >
      <div className="flex justify-center mb-6">
        <University className="h-12 w-12 text-red-400" />
      </div>
      <h3 className="text-2xl font-bold text-slate-100 mb-4">{title}</h3>
      <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
        {description}
      </p>
      <Button 
        variant="outline" 
        className="text-white border-none hover:text-white bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90"
        onClick={onButtonClick}
      >
        <Award className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    </motion.div>
  );
}