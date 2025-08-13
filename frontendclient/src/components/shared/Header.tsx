import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Início", href: "#inicio" },
    { label: "Sobre o Lumioo", href: "#sobre" },
    { label: "Objetivos", href: "#objetivos" },
    { label: "Equipe", href: "#equipe" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-900/50 backdrop-blur-lg border-b border-white/10 h-20">
      <div className="container mx-auto px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="#inicio" className="flex items-center space-x-2">
          <img src="/lumioo-header.png" alt="Lumioo" className="h-40 w-auto" />
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative text-slate-300 font-medium transition-colors hover:text-white after:content-[''] after:block after:h-[2px] after:w-0 after:bg-red-500 after:mt-1 after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}

          <Button
            asChild
            variant="outline"
            className="bg-transparent text-white hover:bg-red-600 hover:scale-105 hover:text-white transition-all duration-300"
          >
            <Link to="/cadastro">Cadastre-se</Link>
          </Button>
          <Button
            asChild
            className="bg-red-500 hover:bg-red-600 hover:scale-105 shadow-md shadow-red-500/30 transition-all duration-300 text-white"
          >
            <Link to="/login">Entrar</Link>
          </Button>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-100 hover:bg-white/10"
              >
                <Menu className="h-6 w-6 text-red-600" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-slate-900/95 border-white/10 p-6 space-y-6 text-red-600"
            >
              {/* Logo dentro do menu mobile */}
              <SheetHeader className="pb-4 border-b border-white/10">
                <SheetTitle className="flex items-center space-x-2">
                  <span className="text-slate-100 font-semibold text-lg">Menu</span>
                </SheetTitle>
              </SheetHeader>

              {/* Links mobile */}
              <nav className="flex flex-col space-y-4 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-slate-300 hover:text-white transition-colors font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                <Button
                  asChild
                  variant="outline"
                  className="bg-transparent text-white hover:bg-red-600 hover:text-white  hover:scale-105 transition-all duration-300 mt-4"
                >
                  <Link to="/cadastro">Cadastre-se</Link>
                </Button>
                <Button
                  asChild
                  className="bg-red-500 hover:bg-red-600 hover:scale-105 shadow-md shadow-red-500/30 transition-all duration-300 text-white mt-2"
                >
                  <Link to="/login">Entrar</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
