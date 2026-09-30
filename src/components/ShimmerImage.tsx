import { useState, type ImgHTMLAttributes } from "react";

interface ShimmerImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

type Status = "loading" | "loaded" | "error";

/**
 * A drop-in <img> replacement that shows an animated shimmer placeholder
 * instead of flat, static color while product photography loads — turns
 * the loading gap into a deliberate moment rather than a blank flash.
 *
 * If the image fails, the shimmer stops and a neutral surface-dim panel
 * takes its place, carrying the alt text so the content is still conveyed
 * (previously a failed image shimmered forever).
 */
export default function ShimmerImage({
  src,
  alt,
  className = "",
  onLoad,
  onError,
  decoding = "async",
  // every ShimmerImage today is third-party (images.unsplash.com); don't
  // tell the CDN which page the visitor is on. Overridable per use.
  referrerPolicy = "no-referrer",
  ...rest
}: ShimmerImageProps) {
  // status is tracked per src, so a new src starts from "loading" again
  // without an effect to reset it
  const [state, setState] = useState<{ src: string; status: Status }>({ src, status: "loading" });
  const status: Status = state.src === src ? state.status : "loading";

  if (status === "error") {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className="flex h-full w-full items-center justify-center bg-surface-dim p-4 text-center"
      >
        {alt && (
          <span aria-hidden="true" className="font-sans text-[12px] leading-snug text-ink-dim">
            {alt}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {status === "loading" && (
        <div
          className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-[length:200%_100%]"
          style={{
            backgroundImage:
              "linear-gradient(110deg, var(--color-surface-soft) 8%, var(--color-surface-dim) 18%, var(--color-surface-soft) 33%)",
          }}
        />
      )}
      <img
        {...rest}
        src={src}
        alt={alt}
        decoding={decoding}
        referrerPolicy={referrerPolicy}
        onLoad={(e) => {
          setState({ src, status: "loaded" });
          onLoad?.(e);
        }}
        onError={(e) => {
          setState({ src, status: "error" });
          onError?.(e);
        }}
        className={`${className} transition-opacity duration-500 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
