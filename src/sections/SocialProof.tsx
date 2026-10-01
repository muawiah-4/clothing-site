import { useState, type FormEvent } from "react";
import { m } from "motion/react";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";
import SplitReveal from "../components/SplitReveal";

interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The coat still fits the way it did the day I bought it — which is more than I can say for anything else in my closet.",
    name: "Elena M.",
    detail: "Nocturne Coat, Paris",
  },
  {
    quote:
      "I stopped buying seasonally the year I found this atelier. Everything else started to look temporary by comparison.",
    name: "Sofia R.",
    detail: "Amsterdam",
  },
  {
    quote:
      "It is rare to buy something and feel like you actually understand why it costs what it does.",
    name: "Marcus T.",
    detail: "Tailored Trousers, London",
  },
  {
    quote:
      "No returns, no regrets. Every piece has quietly earned its place in my wardrobe.",
    name: "Camille D.",
    detail: "Brussels",
  },
];

// Deliberately simple: one "@", no whitespace, a dot in the domain. The
// browser's own type="email" check accepts "a@b"; this also requires a TLD.
// It is a UX guard only — there is no backend, and the value is never sent,
// stored, or rendered back into the page.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254; // RFC 5321 path limit

export default function SocialProof() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (value.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(value)) {
      setError(true);
      return;
    }
    setError(false);
    setEmail("");
    setSubscribed(true);
  };

  return (
    <section
      id="voices"
      className="scroll-mt-24 px-6 py-16 md:px-14 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <m.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.25em] text-accent-deep"
        >
          In Their Words
        </m.p>
        <SplitReveal
          as="h2"
          text="The house, worn. Not just by us."
          className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl"
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <m.figure
              key={t.name}
              {...fade(reducedMotion, { y: 20, duration: 0.7, delay: i * 0.08 })}
              className="flex h-full flex-col justify-between rounded-2xl border border-white/40 bg-surface/40 px-6 py-6 backdrop-blur-md"
            >
              <blockquote className="font-display text-[15px] font-medium leading-snug text-ink">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 font-sans text-[12px] uppercase tracking-[0.1em] text-ink-dim">
                <span className="font-semibold text-accent-deep">{t.name}</span>
                {t.detail ? <span className="text-ink-dim"> — {t.detail}</span> : null}
              </figcaption>
            </m.figure>
          ))}
        </div>

        <m.div
          {...fade(reducedMotion, { y: 16, duration: 0.8, delay: 0.2 })}
          className="mt-16 flex flex-col items-start gap-6 rounded-2xl border border-white/40 bg-surface/40 px-6 py-8 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Join the mailing list.</h3>
            <p className="mt-1 max-w-sm font-sans text-[13px] leading-relaxed text-ink-dim">
              A quiet note when a new collection is finished. Nothing more, nothing often.
            </p>
          </div>

          {subscribed ? (
            <p
              role="status"
              className="font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-accent-deep"
            >
              Thank you. This is a demo, so no email was stored or sent.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end"
            >
              <input
                type="email"
                required
                autoComplete="email"
                maxLength={EMAIL_MAX_LENGTH}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="your@email.com"
                aria-label="Email address"
                aria-invalid={error || undefined}
                aria-describedby={error ? "newsletter-error" : undefined}
                className="w-full rounded-full border border-white/50 bg-surface/50 px-5 py-3 font-sans text-[13px] text-ink backdrop-blur-xl transition-colors placeholder:text-ink-dim focus:border-accent-deep sm:w-64"
              />
              <button
                type="submit"
                className="w-full shrink-0 rounded-full bg-accent px-6 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.15em] text-surface transition-colors hover:bg-accent-deep sm:w-auto"
              >
                Sign Up
              </button>
              {error && (
                <p
                  id="newsletter-error"
                  role="alert"
                  className="w-full font-sans text-[12px] text-ink sm:text-right"
                >
                  Please enter a valid email address, like name@example.com.
                </p>
              )}
            </form>
          )}
        </m.div>
      </div>
    </section>
  );
}
