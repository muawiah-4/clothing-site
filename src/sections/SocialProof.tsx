import { useState, type FormEvent } from "react";
import { m } from "motion/react";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";
import SplitReveal from "../components/SplitReveal";

interface Testimonial {
  quote: string;
  name: string;
  city: string;
  piece: string;
  date: string;
}

// fictional clients; deliberately uneven in length and register
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Two winters in, the Nocturne still sits on the shoulder the way it did at the final fitting. I sent it back once to be relined; it came home in a week.",
    name: "Élise",
    city: "Lyon",
    piece: "Nocturne Coat",
    date: "March 2026",
  },
  {
    quote: "Good coat. Warm, well made, worth what I paid.",
    name: "Tom",
    city: "Leeds",
    piece: "Colonnade Coat",
    date: "January 2026",
  },
  {
    quote:
      "Théo measured me twice, then asked what I would actually be doing in it. Nobody had asked me that before.",
    name: "Marcus",
    city: "London",
    piece: "Silhouette No. IV",
    date: "June 2026",
  },
  {
    quote:
      "I stopped buying by the season the year I found this house. Everything else began to look temporary.",
    name: "Sofia",
    city: "Amsterdam",
    piece: "Grey Hour Blazer",
    date: "November 2025",
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
          className="font-sans text-label-xs font-semibold uppercase text-accent-deep"
        >
          In Their Words
        </m.p>
        <SplitReveal
          as="h2"
          text="The house, worn."
          className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl"
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <m.figure
              key={`${t.name}-${t.city}`}
              {...fade(reducedMotion, { y: 20, duration: 0.7, delay: i * 0.08 })}
              className="flex h-full flex-col justify-between rounded-soft border border-white/40 bg-surface/40 px-6 py-6 backdrop-blur-md"
            >
              <blockquote className="font-display text-base font-medium leading-snug text-ink">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 font-sans text-label-sm uppercase text-ink-dim">
                <span className="font-semibold text-accent-deep">
                  {t.name}, {t.city}
                </span>
                <span className="mt-1 block text-ink-dim">
                  {t.piece} · {t.date}
                </span>
              </figcaption>
            </m.figure>
          ))}
        </div>

        <m.div
          {...fade(reducedMotion, { y: 16, duration: 0.8, delay: 0.2 })}
          className="mt-16 flex flex-col items-start gap-6 rounded-soft border border-white/40 bg-surface/40 px-6 py-8 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Letters from the atelier.</h3>
            <p className="mt-1 max-w-sm font-sans text-body-sm leading-relaxed text-ink-dim">
              A short note when a new collection is finished. Nothing more, and not very often.
            </p>
          </div>

          {subscribed ? (
            <p
              role="status"
              className="font-sans text-label-sm font-semibold uppercase text-accent-deep"
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
                className="w-full rounded-full border border-white/50 bg-surface/50 px-5 py-3 font-sans text-body-sm text-ink backdrop-blur-xl transition-colors placeholder:text-ink-dim focus:border-accent-deep sm:w-64"
              />
              <button
                type="submit"
                className="w-full shrink-0 rounded-full bg-accent px-6 py-3 font-sans text-label-sm font-semibold uppercase text-surface transition-colors hover:bg-accent-deep sm:w-auto"
              >
                Subscribe
              </button>
              {error && (
                <p
                  id="newsletter-error"
                  role="alert"
                  className="w-full font-sans text-body-sm text-ink sm:text-right"
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
