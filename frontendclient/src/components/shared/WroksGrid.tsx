import { motion } from "framer-motion";
import { WorkCard } from "./WorksCard";

interface WorksGridProps {
  works: Array<{
    id: string;
    title: string;
    author: string;
    type: string;
    year: string;
    abstract: string;
    keywords: string[];
    downloads: number;
    fileUrl: string;
    image: string;
  }>;
}

export function WorksGrid({ works }: WorksGridProps) {
  if (works.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {works.map((work, index) => (
        <motion.div
          key={work.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <WorkCard work={work} />
        </motion.div>
      ))}
    </div>
  );
}
