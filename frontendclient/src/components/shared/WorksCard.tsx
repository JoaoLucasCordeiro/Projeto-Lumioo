import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface WorkCardProps {
  work: {
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
  };
}

export function WorkCard({ work }: WorkCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="bg-slate-800/50 border-slate-700 hover:border-red-500/30 transition-colors h-full flex flex-col cursor-pointer"
      onClick={() => navigate(`/trabalhos/${work.id}`)}
    >
      <CardHeader className="p-0">
        <div className="h-48 overflow-hidden rounded-t-lg">
          <img
            src={work.image}
            alt={work.title}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">
            {work.type}
          </Badge>
          <span className="text-sm text-slate-400">{work.year}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2">{work.title}</h3>
        <p className="text-sm text-slate-300 mb-3">{work.author}</p>
        <p className="text-sm text-slate-400 line-clamp-3 mb-4">{work.abstract}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {work.keywords.map(keyword => (
            <Badge
              key={keyword}
              variant="outline"
              className="bg-slate-700/50 border-slate-600 text-slate-300"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
        <span className="text-sm text-slate-400 flex items-center">
          <Download className="h-4 w-4 mr-1" />
          {work.downloads.toLocaleString()}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-400 hover:bg-red-900/20"
          onClick={(e) => {
            e.stopPropagation();
            window.open(work.fileUrl, '_blank');
          }}
        >
          Baixar
        </Button>
      </CardFooter>
    </Card>
  );
}