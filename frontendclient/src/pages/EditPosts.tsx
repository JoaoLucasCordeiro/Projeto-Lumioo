import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Image, MapPin, Smile, Hash, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FeedLayout } from "@/components/shared/feed/FeedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPostById, updatePost } from "@/api/posts";
import { queryKeys } from "@/api/queryKeys";

export function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: queryKeys.posts.detail(id!),
    queryFn: () => fetchPostById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (post && !initialized) {
      setCaption(post.caption);
      setImage(post.image);
      setLocation((post as any).location || "");
      setHashtags((post as any).hashtags || []);
      setInitialized(true);
    }
  }, [post, initialized]);

  const mutation = useMutation({
    mutationFn: () => updatePost(id!, { caption, image, location, hashtags }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      navigate('/feed');
    },
  });

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
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
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <FeedLayout mobileSidebarOpen={false} setMobileSidebarOpen={() => {}}>
        <div className="text-white text-center p-10">Carregando dados do post...</div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout mobileSidebarOpen={false} setMobileSidebarOpen={() => {}}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8 pt-12 md:pt-0">
          <h2 className="text-2xl font-bold text-slate-100">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
              Editar Post
            </span>
          </h2>
          <Button
            type="submit"
            form="edit-post-form"
            disabled={!image || mutation.isPending}
            className="bg-[#ff3131] hover:bg-red-600 text-white font-bold"
          >
            {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <form id="edit-post-form" onSubmit={handleSubmit}>
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50">
              <Label
                htmlFor="post-image"
                className="text-lg font-semibold text-slate-100 mb-3 block"
              >
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
            <div className="p-6 space-y-6">
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
              <div>
                <Label
                  htmlFor="location"
                  className="text-lg font-semibold text-slate-100 mb-3 block"
                >
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
              <div>
                <Label className="text-lg font-semibold text-slate-100 mb-3 block">Hashtags</Label>
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHashtag();
                        }
                      }}
                    />
                    <div className="absolute left-3 top-3">
                      <Hash className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddHashtag}
                    disabled={!newHashtag.trim()}
                    className="bg-[#ff3131] hover:bg-red-600 text-white transition-colors"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
              {mutation.isError && (
                <div className="flex items-center p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg">
                  <AlertCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                  <div>{(mutation.error as Error).message}</div>
                </div>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </FeedLayout>
  );
}
