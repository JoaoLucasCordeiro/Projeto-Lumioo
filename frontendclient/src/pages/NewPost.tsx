import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Image, MapPin, Smile, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FeedLayout } from "@/components/shared/FeedLayout";

export function NewPostPage() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAddHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag)) {
      setHashtags([...hashtags, newHashtag]);
      setNewHashtag("");
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navegar de volta após postar
    navigate('/feed');
  };

  return (
    <FeedLayout 
      mobileSidebarOpen={false} 
      setMobileSidebarOpen={() => {}}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Cabeçalho Mobile */}
        <div className="md:hidden flex items-center justify-between mb-8 pt-12">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/feed')}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <h2 className="text-xl font-bold text-slate-100">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Novo Post</span>
          </h2>
        </div>

        {/* Cabeçalho Desktop */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/feed')}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <X className="h-4 w-4 mr-2" />
            Voltar para o feed
          </Button>
          
          <Button
            type="submit"
            form="new-post-form"
            disabled={!image || isLoading}
            className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
          >
            {isLoading ? "Publicando..." : "Publicar Post"}
          </Button>
        </div>

        <form id="new-post-form" onSubmit={handleSubmit}>
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
            {/* Área de upload de imagem */}
            <div className="p-6 border-b border-slate-700/50">
              <Label htmlFor="post-image" className="text-lg font-semibold text-slate-100 mb-3 block">
                Imagem do Post
              </Label>
              
              {image ? (
                <div className="relative group">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="rounded-lg object-cover w-full h-64 md:h-80 border border-slate-700"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setImage(null)}
                    className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800/90 text-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center gap-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors h-64 cursor-pointer">
                  <Image className="h-12 w-12 text-slate-500" />
                  <Label htmlFor="post-image" className="text-center">
                    <div className="text-slate-300 font-medium text-lg">Selecione uma imagem</div>
                    <div className="text-slate-500 text-sm mt-1">Ou arraste e solte aqui</div>
                  </Label>
                  <Input
                    id="post-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Formulário */}
            <div className="p-6 space-y-6">
              {/* Campo de legenda */}
              <div>
                <Label htmlFor="caption" className="text-lg font-semibold text-slate-100 mb-3 block">
                  Legenda
                </Label>
                <div className="relative">
                  <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Compartilhe seus pensamentos..."
                    className="min-h-[120px] bg-slate-800/30 border-slate-700 text-slate-100 focus-visible:ring-red-500"
                  />
                  <div className="absolute right-3 bottom-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:bg-slate-700/50"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div>
                <Label htmlFor="location" className="text-lg font-semibold text-slate-100 mb-3 block">
                  Localização (opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Onde você está?"
                    className="bg-slate-800/30 border-slate-700 text-slate-100 focus-visible:ring-red-500 pl-10"
                  />
                  <div className="absolute left-3 top-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <Label className="text-lg font-semibold text-slate-100 mb-3 block">
                  Hashtags
                </Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {hashtags.map((tag) => (
                    <Badge 
                      key={tag}
                      variant="outline"
                      className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 group"
                    >
                      #{tag}
                      <button 
                        type="button"
                        onClick={() => handleRemoveHashtag(tag)}
                        className="ml-1.5 text-slate-400 hover:text-slate-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value.replace(/\s/g, ''))}
                      placeholder="Adicionar hashtag"
                      className="bg-slate-800/30 border-slate-700 text-slate-100 focus-visible:ring-red-500 pl-9"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                    />
                    <div className="absolute left-3 top-3">
                      <Hash className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddHashtag}
                    disabled={!newHashtag.trim()}
                    className="border-slate-700 text-slate-300 hover:bg-slate-700/50"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Botão de publicar (mobile) */}
              <div className="md:hidden pt-4">
                <Button
                  type="submit"
                  disabled={!image || isLoading}
                  className="w-full bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
                >
                  {isLoading ? "Publicando..." : "Publicar Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </FeedLayout>
  );
}