import { useState, type ImgHTMLAttributes } from "react";

interface ShimmerImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * A drop-in <img> replacement that shows an animated shimmer placeholder
 * instead of flat, static color while product photography loads — turns
 * the loading gap into a deliberate moment rather than a blank flash.
 */
export default function ShimmerImage({ src, alt, className = "", ...rest }: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div
          className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-[length:200%_100%]"
          style={{
            backgroundImage:
              "linear-gradient(110deg, var(--color-surface-soft) 8%, var(--color-surface-dim) 18%, var(--color-surface-soft) 33%)",
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        {...rest}
      />
    </div>
  );
}
