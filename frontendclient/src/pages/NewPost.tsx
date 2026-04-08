import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ImagePlus, MapPin, Hash, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FeedLayout } from "@/components/shared/feed/FeedLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth.context";
import { createPost } from "@/api/posts";

const MAX_CHARS = 2000;

export function NewPostPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createPost({
        caption,
        ...(image ? { image } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
        ...(hashtags.length > 0 ? { hashtags } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      navigate("/feed");
    },
  });

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => setImage(event.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleAddHashtag = () => {
    const tag = newHashtag.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setNewHashtag("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setFormError("Escreva algo para publicar.");
      return;
    }
    if (caption.length > MAX_CHARS) {
      setFormError(`O texto não pode ultrapassar ${MAX_CHARS} caracteres.`);
      return;
    }
    setFormError(null);
    mutation.mutate();
  };

  const charsLeft = MAX_CHARS - caption.length;
  const isOverLimit = charsLeft < 0;
  const isNearLimit = charsLeft <= 100 && charsLeft >= 0;
  const canPublish = caption.trim().length > 0 && !isOverLimit && !mutation.isPending;
  const error = formError || (mutation.isError ? (mutation.error as Error).message : null);

  return (
    <FeedLayout mobileSidebarOpen={false} setMobileSidebarOpen={() => {}}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/feed")}
            className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <h1 className="text-base font-semibold text-slate-100">Novo post</h1>

          <button
            form="new-post-form"
            type="submit"
            disabled={!canPublish}
            className="px-5 py-1.5 rounded-full text-sm font-bold bg-[#ff3131] text-white shadow-md shadow-[#ff3131]/20 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {mutation.isPending ? "Publicando…" : "Publicar"}
          </button>
        </div>

        {/* Composer card */}
        <form
          id="new-post-form"
          onSubmit={handleSubmit}
          className="bg-slate-900/60 border border-white/[0.07] rounded-2xl overflow-hidden"
        >
          {/* Compose area */}
          <div className="flex gap-3 p-4 pb-2">
            {/* Avatar */}
            <Avatar className="h-10 w-10 shrink-0 ring-1 ring-white/[0.08] mt-0.5">
              <AvatarImage src={user?.avatar ?? undefined} alt={user?.username} />
              <AvatarFallback className="bg-slate-800 text-slate-300 text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>

            {/* Text area */}
            <div className="flex-1 min-w-0">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="O que você quer compartilhar?"
                rows={4}
                className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-base leading-relaxed resize-none outline-none"
              />

              {/* Hashtag badges */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {hashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-red-900/20 border-red-700/40 text-red-400 text-xs gap-1"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setHashtags(hashtags.filter((t) => t !== tag))}
                        className="hover:text-red-200 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Location badge */}
              {location.trim() && (
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                  <MapPin className="h-3 w-3 text-red-400" />
                  <span>{location.trim()}</span>
                  <button
                    type="button"
                    onClick={() => { setLocation(""); setShowLocation(false); }}
                    className="ml-1 hover:text-slate-200 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Image preview */}
          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative mx-4 mb-3 rounded-xl overflow-hidden border border-white/[0.08]"
              >
                <img
                  src={image}
                  alt="Preview"
                  className="w-full max-h-80 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expandable: Location input */}
          <AnimatePresence>
            {showLocation && !location.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-3"
              >
                <div className="flex items-center gap-2 bg-slate-800/50 border border-white/[0.07] rounded-xl px-3 py-2">
                  <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Adicionar localização…"
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); setShowLocation(false); }
                      if (e.key === "Escape") { setLocation(""); setShowLocation(false); }
                    }}
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expandable: Hashtag input */}
          <AnimatePresence>
            {showHashtags && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-3"
              >
                <div className="flex items-center gap-2 bg-slate-800/50 border border-white/[0.07] rounded-xl px-3 py-2">
                  <Hash className="h-4 w-4 text-red-400 shrink-0" />
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value.replace(/\s/g, ""))}
                    placeholder="Adicionar hashtag e pressionar Enter…"
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddHashtag(); }
                      if (e.key === "Escape") setShowHashtags(false);
                    }}
                    autoFocus
                  />
                  {newHashtag.trim() && (
                    <button
                      type="button"
                      onClick={handleAddHashtag}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors shrink-0"
                    >
                      Adicionar
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-4 mb-3 flex items-center gap-2 p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1">
              {/* Imagem */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Adicionar imagem"
                className={`p-2 rounded-full transition-colors ${
                  image
                    ? "text-red-400 bg-red-900/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                }`}
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Localização */}
              <button
                type="button"
                onClick={() => { setShowLocation((v) => !v); setShowHashtags(false); }}
                title="Adicionar localização"
                className={`p-2 rounded-full transition-colors ${
                  location.trim()
                    ? "text-red-400 bg-red-900/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                }`}
              >
                <MapPin className="h-5 w-5" />
              </button>

              {/* Hashtags */}
              <button
                type="button"
                onClick={() => { setShowHashtags((v) => !v); setShowLocation(false); }}
                title="Adicionar hashtag"
                className={`p-2 rounded-full transition-colors ${
                  hashtags.length > 0
                    ? "text-red-400 bg-red-900/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                }`}
              >
                <Hash className="h-5 w-5" />
              </button>
            </div>

            {/* Contador de caracteres */}
            <span
              className={`text-xs tabular-nums font-medium transition-colors ${
                isOverLimit
                  ? "text-red-500"
                  : isNearLimit
                  ? "text-amber-400"
                  : "text-slate-500"
              }`}
            >
              {charsLeft}
            </span>
          </div>
        </form>

        {/* Dica */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Posts podem conter apenas texto, imagem, ou ambos.
        </p>
      </motion.div>
    </FeedLayout>
  );
}
