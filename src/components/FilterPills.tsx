type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (id: T) => void;
  /** "md" for the primary (wardrobe) tier, "sm" for the secondary (category) tier */
  size?: "md" | "sm";
  className?: string;
};

const SIZE = {
  md: "px-5 py-2.5 text-[12px] tracking-[0.1em]",
  sm: "px-4 py-2 text-[11px] tracking-[0.08em]",
};

const ACTIVE = {
  md: "border-accent bg-accent text-surface",
  sm: "border-ink bg-ink text-surface",
};

/**
 * A row of mutually exclusive filter pills. Exposed as a labelled group of
 * toggle buttons (aria-pressed) rather than ARIA tabs: the filters narrow a
 * single grid instead of switching between tab panels, so the tabs pattern
 * (tabpanels, roving tabindex, arrow keys) would promise behaviour that
 * doesn't exist.
 */
export default function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: Props<T>) {
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={`rounded-full border font-sans font-medium uppercase backdrop-blur-md transition-colors ${SIZE[size]} ${
              active
                ? ACTIVE[size]
                : "border-white/50 bg-surface/30 text-ink-dim hover:border-accent/50 hover:text-accent-deep"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
