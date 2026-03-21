// src/components/post-details/PostImage.tsx
interface PostImageProps {
  image: string;
  caption: string;
}

export function PostImage({ image, caption }: PostImageProps) {
  return (
    <div className="md:w-1/2 flex-shrink-0 bg-slate-950 overflow-hidden">
      {/* aspect-square on mobile; fills the flex height on desktop */}
      <div className="aspect-square md:aspect-auto md:h-full">
        <img
          src={image}
          alt={caption}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
