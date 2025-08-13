import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AnchorLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  offset?: number; // Novo prop opcional para offset personalizado
}

export function AnchorLink({ 
  to, 
  children, 
  className, 
  onClick, 
  offset = 80 // Valor padrão de 80px (altura do header)
}: AnchorLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector(to);
    
    if (element) {
      // Calcula a posição considerando o offset do header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Atualiza a URL sem recarregar a página
      window.history.pushState(null, '', to);
    }
    
    if (onClick) onClick();
  };

  return (
    <Link 
      to={to} 
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}