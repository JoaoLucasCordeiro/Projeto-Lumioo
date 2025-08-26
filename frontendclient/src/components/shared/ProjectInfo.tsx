import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface ProjectInfoItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ProjectInfoProps {
  items: ProjectInfoItem[];
}

export default function ProjectInfo({ items }: ProjectInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
    >
      {items.map((info, index) => {
        const Icon = info.icon;
        return (
          <Card key={index} className="bg-white/5 backdrop-blur-lg border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <Icon className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">{info.title}</h3>
              <p className="text-slate-400">{info.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </motion.div>
  );
}