import { Heart } from "lucide-react";
import type { CollectionPiece } from "../data/collection";
import { useExperienceStore } from "../store/experience";

type Props = {
  piece: CollectionPiece;
  /** "card" floats over a collection photo; "panel" sits beside the buy panel's actions */
  variant?: "card" | "panel";
  className?: string;
};

/** Save / unsave a piece. A toggle button, so its state is aria-pressed, not a changing label. */
export default function WishlistButton({ piece, variant = "card", className = "" }: Props) {
  const saved = useExperienceStore((s) => s.wishlist.includes(piece.id));
  const toggleWishlist = useExperienceStore((s) => s.toggleWishlist);
  const base =
    variant === "card"
      ? "h-10 w-10 border-white/50 bg-surface/60 shadow-md"
      : "h-14 w-14 shrink-0 border-ink/15 bg-surface/40";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${piece.name}`}
      title={saved ? "Saved" : "Save"}
      onClick={() => toggleWishlist(piece.id)}
      className={`inline-flex items-center justify-center rounded-full border backdrop-blur-md transition-colors hover:border-accent hover:text-accent-deep ${base} ${
        saved ? "text-accent-deep" : "text-ink-dim"
      } ${className}`}
    >
      <Heart
        aria-hidden="true"
        size={variant === "card" ? 17 : 20}
        strokeWidth={1.6}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
