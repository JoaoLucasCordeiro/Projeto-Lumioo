import { Users, Building2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  year: string;
  image: string;
  members: number;
  institution: string;
  status: string;
}

export function ProjectCard({
  id,
  title,
  description,
  category,
  year,
  image,
  members,
  institution,
  status
}: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer"
      onClick={() => navigate(`/projetos/${id}`)}
    >
      <div className="h-48 bg-slate-700 relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-slate-200">
            {category}
          </Badge>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <span className="text-sm text-slate-400">{year}</span>
        </div>
        
        <p className="text-sm text-slate-300 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center space-x-3 text-sm text-slate-400 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{members} membros</span>
          </div>
          <div className="flex items-center space-x-1">
            <Building2 className="h-4 w-4" />
            <span>{institution}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Badge 
            variant={status === 'Concluído' ? 'default' : 'secondary'} 
            className={status === 'Concluído' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}
          >
            {status}
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-red-500/50 text-red-400 hover:bg-red-900/20"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projetos/${id}`);
            }}
          >
            Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}