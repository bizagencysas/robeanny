"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

/* ------------------------------------------------------------------ */
/*  Fee passthrough: gross = (intended + 0.30) / (1 - 0.029)          */
/* ------------------------------------------------------------------ */
function calcFees(intended: number) {
  if (!intended || intended <= 0) return { fee: 0, total: 0 };
  const total = (intended + 0.3) / (1 - 0.029);
  const fee = total - intended;
  return {
    fee: Math.round(fee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
const fmt = (n: number) => n.toFixed(2);

/* ------------------------------------------------------------------ */
/*  Photos — curated from Cloudinary                                   */
/* ------------------------------------------------------------------ */
const PHOTOS = [
  "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417059/4A7B7C7A-3996-4840-BA95-3F048815B38E_q0axou.jpg",
  "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417111/IMG_8328_ihc0wa.jpg",
  "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8326_sicido.jpg",
  "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417060/C331D4C7-A330-46C8-AB87-E451F1B4C119_il9n9f.jpg",
];

/* ------------------------------------------------------------------ */
/*  Preset amounts                                                     */
/* ------------------------------------------------------------------ */
const PRESETS = [
  { label: "$50", value: "50" },
  { label: "$100", value: "100" },
  { label: "$250", value: "250" },
  { label: "$500", value: "500" },
  { label: "$1,000", value: "1000" },
];

/* ------------------------------------------------------------------ */
/*  Inner payment form                                                 */
/* ------------------------------------------------------------------ */
function DonationForm({
  intendedAmount,
  totalAmount,
}: {
  intendedAmount: string;
  totalAmount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setErrorMsg("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pay?success=true&amount=${intendedAmount}`,
      },
    });

    if (error) {
      setErrorMsg(error.message ?? "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: {
            type: "accordion",
            defaultCollapsed: false,
            radios: "never",
            spacedAccordionItems: true,
          },
          wallets: { applePay: "always", googlePay: "always" },
        }}
      />

      {errorMsg && (
        <p className="rounded bg-red-500/8 px-3 py-2 text-xs text-red-400">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="luxury-button w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2.5">
            <span className="pay-spinner" />
            Processing…
          </span>
        ) : (
          `Donate $${totalAmount} USD`
        )}
      </button>

      <p className="text-center text-[0.46rem] uppercase tracking-[0.28em] text-[#e8dcc8]/22">
        Secured by Stripe · 256-bit TLS
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function PayClientPage({
  success,
  paidAmount,
}: {
  success: boolean;
  paidAmount?: string;
}) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [preset, setPreset] = useState("");
  const [custom, setCustom] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const intendedRaw = custom || preset;
  const intended = parseFloat(intendedRaw) || 0;
  const { fee, total } = useMemo(() => calcFees(intended), [intended]);

  const fetchIntent = useCallback(async (totalUSD: number) => {
    setClientSecret(null);
    setApiError("");
    if (totalUSD < 1.01) return;
    setLoading(true);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: fmt(totalUSD) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClientSecret(data.clientSecret);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (total >= 1.01) fetchIntent(total);
    }, 600);
    return () => clearTimeout(t);
  }, [total, fetchIntent]);

  // Cycle photos every 4s
  useEffect(() => {
    const t = setInterval(
      () => setActivePhoto((p) => (p + 1) % PHOTOS.length),
      4000
    );
    return () => clearInterval(t);
  }, []);

  const appearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#c79a59",
      colorBackground: "#0d0d0d",
      colorText: "#e8dcc8",
      colorTextSecondary: "rgba(232,220,200,0.45)",
      colorTextPlaceholder: "rgba(232,220,200,0.25)",
      colorIconTab: "#e8dcc8",
      colorIconTabHover: "#c79a59",
      colorIconTabSelected: "#c79a59",
      borderRadius: "0px",
      fontFamily: "Manrope, sans-serif",
      fontSizeSm: "0.75rem",
      spacingUnit: "5px",
    },
    rules: {
      ".Input": {
        border: "1px solid rgba(232,220,200,0.1)",
        backgroundColor: "#0a0a0a",
        color: "#e8dcc8",
        boxShadow: "none",
        padding: "12px 16px",
      },
      ".Input:focus": {
        border: "1px solid rgba(199,154,89,0.5)",
        boxShadow: "0 0 0 1px rgba(199,154,89,0.12)",
      },
      ".Label": {
        fontSize: "0.52rem",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: "rgba(232,220,200,0.35)",
        marginBottom: "8px",
      },
      ".Tab": {
        border: "1px solid rgba(232,220,200,0.08)",
        backgroundColor: "#0d0d0d",
        color: "rgba(232,220,200,0.55)",
      },
      ".Tab:hover": { backgroundColor: "#141414", color: "#e8dcc8" },
      ".Tab--selected": {
        border: "1px solid rgba(199,154,89,0.4)",
        backgroundColor: "rgba(199,154,89,0.08)",
        color: "#c79a59",
        boxShadow: "none",
      },
      ".Block": {
        border: "1px solid rgba(232,220,200,0.06)",
        backgroundColor: "#0d0d0d",
      },
    },
  };

  /* ---- Success ---- */
  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <div className="relative mb-8">
          <div className="glow-accent absolute -inset-12 opacity-60" />
          <svg
            className="relative z-10 h-14 w-14 text-[#c79a59]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="label-kicker mb-4">Confirmed</p>
        <h1 className="brand-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.9] text-[#e8dcc8]">
          Thank you.
        </h1>
        {paidAmount && (
          <p className="mt-2 brand-display text-2xl text-[#c79a59]">
            ${paidAmount} USD
          </p>
        )}
        <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#e8dcc8]/45">
          Your support means everything. A Stripe confirmation email is on its
          way.
        </p>
        <a href="/" className="luxury-button mt-10">
          Back to home
        </a>
      </div>
    );
  }

  /* ---- Main ---- */
  return (
    <div className="min-h-screen bg-black">
      {/* Full-height split layout */}
      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* ===== LEFT — Photo + identity ===== */}
        <div className="relative flex w-full flex-col justify-end overflow-hidden h-[42vh] lg:h-screen lg:aspect-auto lg:sticky lg:top-0 lg:w-[42%]">
          {/* Cycling photo */}
          {PHOTOS.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt="Robeanny"
              fill
              className={`object-cover object-center transition-opacity duration-1000 ${
                i === activePhoto ? "opacity-100" : "opacity-0"
              }`}
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          ))}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Branding overlay */}
          <div className="relative z-10 p-8 md:p-10">
            <p className="label-kicker mb-3 text-[#e8dcc8]/70">Support</p>
            <h1 className="brand-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] text-[#e8dcc8]">
              Robeanny
              <br />
              <em>Bastardo</em>
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-[#e8dcc8]/50 max-w-xs">
              Help me keep creating independent editorial work, photo sessions,
              and meaningful content.
            </p>

            {/* Photo dots */}
            <div className="mt-5 flex gap-1.5">
              {PHOTOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    i === activePhoto
                      ? "w-6 bg-[#c79a59]"
                      : "w-2 bg-[#e8dcc8]/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT — Payment form ===== */}
        <div className="flex flex-1 flex-col justify-center px-6 py-16 md:px-12 lg:px-16 lg:py-0">
          <div className="mx-auto w-full max-w-md">

            {/* Amount input — hero */}
            <div className="mb-8">
              <p className="mb-2 text-[0.52rem] uppercase tracking-[0.35em] text-[#e8dcc8]/35">
                Donation amount
              </p>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 brand-display text-4xl text-[#c79a59]/50">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={custom}
                  onChange={(e) => {
                    setCustom(e.target.value);
                    setPreset("");
                  }}
                  placeholder="0"
                  className="w-full border-b border-[#e8dcc8]/15 bg-transparent pb-2 pl-8 brand-display text-5xl text-[#e8dcc8] outline-none transition-colors focus:border-[#c79a59]/60 placeholder:text-[#e8dcc8]/12"
                  autoFocus
                />
              </div>
            </div>

            {/* Preset chips */}
            <div className="mb-8 flex flex-wrap gap-2">
              {PRESETS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => {
                    setPreset(value);
                    setCustom("");
                  }}
                  className={`pay-preset-btn ${
                    preset === value && !custom ? "pay-preset-btn--active" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Fee line — only when amount set */}
            {intended > 0 && (
              <div className="mb-6 flex items-center justify-between border-b border-[#e8dcc8]/8 pb-4">
                <div>
                  <p className="text-xs text-[#e8dcc8]/60">
                    Processing fee{" "}
                    <span className="text-[#e8dcc8]/30 text-[0.65em]">
                      (covers Stripe)
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#e8dcc8]/45">+${fmt(fee)}</p>
                  <p className="brand-display text-lg text-[#c79a59]">
                    ${fmt(total)} total
                  </p>
                </div>
              </div>
            )}

            {/* Stripe Payment Element */}
            {apiError && (
              <p className="mb-4 rounded bg-red-500/8 px-3 py-2 text-xs text-red-400">
                {apiError}
              </p>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <div className="pay-spinner-lg" />
              </div>
            )}

            {!loading && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance, locale: "en" }}
                key={clientSecret}
              >
                <DonationForm
                  intendedAmount={fmt(intended)}
                  totalAmount={fmt(total)}
                />
              </Elements>
            )}

            {!loading && !clientSecret && !apiError && (
              <div className="py-10 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[#e8dcc8]/20">
                  Enter an amount above
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
