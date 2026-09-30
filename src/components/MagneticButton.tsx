import { useRef, type ReactNode, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";

type CommonProps = {
  strength?: number;
  children: ReactNode;
};

// pass `href` to render a link (e.g. a mailto:) instead of a button, so the
// element keeps the right semantics and actually does something when clicked
type MagneticButtonProps =
  | (CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
  | (CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string });

export default function MagneticButton({
  strength = 0.3,
  className,
  children,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  };

  const shared = {
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    className,
    style: { transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)" },
  };

  if (rest.href !== undefined) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} {...shared} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      {...shared}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
