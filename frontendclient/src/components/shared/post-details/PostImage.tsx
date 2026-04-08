// src/components/post-details/PostImage.tsx
interface PostImageProps {
  image: string | null;
  caption: string;
}

export function PostImage({ image, caption }: PostImageProps) {
  if (!image) return null;

  return (
    <div className="md:w-1/2 flex-shrink-0 bg-slate-950 overflow-hidden h-56 md:h-full">
      <img
        src={image}
        alt={caption}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
