// src/components/post-details/PostImage.tsx
interface PostImageProps {
  image: string;
  caption: string;
}

export function PostImage({ image, caption }: PostImageProps) {
  return (
    <div className="md:w-2/3 bg-black relative">
      <img src={image} alt={caption} className="w-full h-full object-contain" />
    </div>
  );
}