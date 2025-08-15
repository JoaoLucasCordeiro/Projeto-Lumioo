import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WorksHeaderProps {
  isMobile: boolean;
}

export function WorksHeader({ isMobile }: WorksHeaderProps) {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/submeter-trabalho');
  };

  if (isMobile) {
    return (
      <div className="flex items-center justify-between mb-8 pt-12">
        <h2 className="text-2xl font-bold text-slate-100">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
            Trabalhos Acadêmicos
          </span>
        </h2>
        <Button
          variant="outline"
          className="border-red-500 text-red-400 hover:bg-red-900/20"
          onClick={handleUploadClick}
        >
          <FileText className="h-4 w-4 mr-2" />
          Submeter
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
            Repositório Acadêmico
          </span>
        </h2>
        <p className="text-slate-400 mt-2">TCCs, artigos, dissertações e teses da nossa universidade</p>
      </div>
      <Button
        className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300 flex items-center px-4 py-2"
        onClick={handleUploadClick}
      >
        <FileText className="h-4 w-4 mr-2" />
        Submeter Trabalho
      </Button>
    </div>
  );
}