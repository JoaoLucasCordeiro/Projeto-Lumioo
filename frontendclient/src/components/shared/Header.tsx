import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: "Início", href: "/", type: "route" },
    { label: "Sobre o Lumioo", href: "#sobre", type: "anchor" },
    { label: "Objetivos", href: "#objetivos", type: "anchor" },
    { label: "Equipe", href: "#equipe", type: "anchor" },
    { label: "Contato", href: "#contato", type: "anchor" },
  ];

  const renderLink = (link: typeof navLinks[0]) => {
    if (link.type === "route") {
      return (
        <Link
          key={link.href}
          to={link.href}
          className="relative text-slate-300 font-medium transition-colors hover:text-white after:content-[''] after:block after:h-[2px] after:w-0 after:bg-red-500 after:mt-1 after:transition-all hover:after:w-full"
        >
          {link.label}
        </Link>
      );
    }

    return (
      <a
        key={link.href}
        href={link.href}
        className="relative text-slate-300 font-medium transition-colors hover:text-white after:content-[''] after:block after:h-[2px] after:w-0 after:bg-red-500 after:mt-1 after:transition-all hover:after:w-full"
      >
        {link.label}
      </a>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 h-20 border-b transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/lumioo-header.png" alt="Lumioo" className="h-40 w-auto" />
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map(renderLink)}

          <Link to="/cadastro">
            <button className="border border-white/20 text-slate-300 hover:border-white/40 hover:text-white px-6 py-2 rounded-full text-sm transition-colors duration-300">
              Cadastre-se
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg shadow-red-500/25 transition-all duration-300">
              Entrar
            </button>
          </Link>
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
                  <span className="text-slate-100 font-semibold text-lg">
                    Menu
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Links mobile */}
              <nav className="flex flex-col space-y-4 mt-4">
                {navLinks.map((link) =>
                  link.type === "route" ? (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-slate-300 hover:text-white transition-colors font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-colors font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </a>
                  )
                )}

                <Link to="/cadastro" onClick={() => setOpen(false)}>
                  <button className="w-full border border-white/20 text-slate-300 hover:border-white/40 hover:text-white px-6 py-2.5 rounded-full text-sm transition-colors mt-4">
                    Cadastre-se
                  </button>
                </Link>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-red-500/25 transition-all mt-2">
                    Entrar
                  </button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
