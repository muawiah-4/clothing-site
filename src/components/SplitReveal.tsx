import { useRef, type ElementType } from "react";
import { m, useScroll, useTransform, type MotionValue } from "motion/react";
import { useExperienceStore } from "../store/experience";

function Word({
  word,
  progress,
  index,
  total,
}: {
  word: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  const y = useTransform(progress, [start, end], [16, 0]);

  return (
    <m.span style={{ opacity, y, display: "inline-block" }} className="mr-[0.28em] last:mr-0">
      {word}
    </m.span>
  );
}

/**
 * Words light up one by one as the heading itself scrolls through the
 * viewport, rather than a single block fading in once whileInView fires —
 * genuinely tied to scroll position, not just triggered-then-staggered.
 */
export default function SplitReveal({
  text,
  className,
  as = "p",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  });
  const words = text.split(" ");
  const Tag = as as ElementType;

  if (reducedMotion) {
    return (
      <Tag ref={ref} className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={`${word}-${i}`} word={word} progress={scrollYProgress} index={i} total={words.length} />
      ))}
    </Tag>
  );
}
