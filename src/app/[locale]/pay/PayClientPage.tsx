"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
/*  Fee calculation — Stripe card rate: 2.9% + $0.30                  */
/*  gross = (intended + 0.30) / (1 - 0.029)                           */
/* ------------------------------------------------------------------ */
const STRIPE_PCT = 0.029;
const STRIPE_FIXED = 0.3;

function calcFees(intended: number): { fee: number; total: number } {
  if (!intended || intended <= 0) return { fee: 0, total: 0 };
  const total = (intended + STRIPE_FIXED) / (1 - STRIPE_PCT);
  const fee = total - intended;
  return {
    fee: Math.round(fee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

const fmt = (n: number) => n.toFixed(2);

/* ------------------------------------------------------------------ */
/*  Inner form                                                         */
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
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setStatus("processing");
    setErrorMsg("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pay?success=true&amount=${intendedAmount}`,
      },
    });

    if (error) {
      setErrorMsg(error.message ?? "An unexpected error occurred.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="pay-element-wrapper">
        <PaymentElement
          options={{
            layout: {
              type: "accordion",
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: true,
            },
            wallets: {
              applePay: "always",
              googlePay: "always",
            },
          }}
        />
      </div>

      {errorMsg && (
        <p className="text-xs uppercase tracking-[0.2em] text-red-400">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || status === "processing"}
        className="luxury-button w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "processing" ? (
          <span className="flex items-center justify-center gap-3">
            <span className="pay-spinner" />
            Processing…
          </span>
        ) : (
          `Donate $${totalAmount} USD`
        )}
      </button>

      <p className="text-center text-[0.48rem] uppercase tracking-[0.3em] text-[#e8dcc8]/22">
        Secured by Stripe · 256-bit TLS encryption
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */
const PRESETS = ["50", "100", "250", "500", "1000"];

/* ------------------------------------------------------------------ */
/*  Stripe appearance                                                  */
/* ------------------------------------------------------------------ */
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
      outline: "none",
      padding: "12px 16px",
    },
    ".Input:focus": {
      border: "1px solid rgba(199,154,89,0.5)",
      boxShadow: "0 0 0 1px rgba(199,154,89,0.15)",
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
  const [preset, setPreset] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const intendedRaw = customAmount || preset;
  const intended = parseFloat(intendedRaw) || 0;
  const { fee, total } = useMemo(() => calcFees(intended), [intended]);

  const fetchIntent = useCallback(async (totalUSD: number) => {
    setClientSecret(null);
    setApiError("");
    if (!totalUSD || totalUSD < 1.01) return;
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
      setApiError(e instanceof Error ? e.message : "Failed to load Stripe");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (total >= 1.01) fetchIntent(total);
    }, 650);
    return () => clearTimeout(timer);
  }, [total, fetchIntent]);

  /* ---- Success screen ---- */
  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <div className="relative mb-8">
          <div className="glow-accent absolute -inset-12 opacity-60" />
          <svg
            className="relative z-10 h-16 w-16 text-[#c79a59]"
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
          <p className="mt-3 brand-display text-2xl text-[#c79a59]">
            ${paidAmount} USD
          </p>
        )}
        <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#e8dcc8]/50">
          Your support means everything. A confirmation email from Stripe is on
          its way.
        </p>
        <a href="/" className="luxury-button mt-10">
          Back to home
        </a>
      </div>
    );
  }

  /* ---- Main page ---- */
  return (
    <div className="min-h-screen bg-black pb-24 pt-20 md:pt-32">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 opacity-25"
        style={{
          width: "600px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(199,154,89,0.14) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="page-shell">
        {/* ---- Header ---- */}
        <div className="mb-10 md:mb-12">
          <p className="label-kicker mb-4">Support</p>
          <h1 className="brand-display text-[clamp(2.6rem,8vw,6rem)] leading-[0.88] tracking-[0.04em] text-[#e8dcc8]">
            Back my
            <br />
            <em>work</em>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#e8dcc8]/40">
            Every contribution helps me keep creating independent editorial
            projects, photo sessions, and content. Thank you for being here.
          </p>
        </div>

        {/* ---- Two-column on desktop, stacked on mobile ---- */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">

          {/* ===== LEFT / TOP: Amount selector ===== */}
          <aside className="luxury-panel p-5 md:p-8">

            {/* Custom amount — MOST PROMINENT */}
            <label className="block">
              <span className="text-[0.52rem] uppercase tracking-[0.35em] text-[#e8dcc8]/40">
                Custom amount (USD)
              </span>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 brand-display text-2xl text-[#c79a59]/60">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setPreset("");
                  }}
                  placeholder="0"
                  className="w-full border border-[#e8dcc8]/12 bg-[#0a0a0a] py-4 pl-10 pr-4 brand-display text-3xl text-[#e8dcc8] outline-none transition-colors focus:border-[#c79a59]/60 placeholder:text-[#e8dcc8]/15"
                  autoFocus
                />
              </div>
            </label>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e8dcc8]/8" />
              <span className="text-[0.46rem] uppercase tracking-[0.35em] text-[#e8dcc8]/25">
                or choose
              </span>
              <div className="h-px flex-1 bg-[#e8dcc8]/8" />
            </div>

            {/* Preset chips */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPreset(p);
                    setCustomAmount("");
                  }}
                  className={`pay-preset-btn ${
                    preset === p && !customAmount
                      ? "pay-preset-btn--active"
                      : ""
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>

            {/* Fee breakdown — shown only when amount is set */}
            {intended > 0 && (
              <div className="mt-6 border border-[#e8dcc8]/8">
                <div className="flex items-center justify-between border-b border-[#e8dcc8]/6 px-4 py-3">
                  <span className="text-[0.5rem] uppercase tracking-[0.3em] text-[#e8dcc8]/38">
                    Your donation
                  </span>
                  <span className="tabular-nums text-sm text-[#e8dcc8]/65">
                    ${fmt(intended)}
                  </span>
                </div>
                <div className="flex items-start justify-between border-b border-[#e8dcc8]/6 px-4 py-3">
                  <div>
                    <p className="text-[0.5rem] uppercase tracking-[0.3em] text-[#e8dcc8]/38">
                      Processing fee
                    </p>
                    <p className="mt-0.5 text-[0.44rem] tracking-wider text-[#e8dcc8]/22">
                      Card · Apple Pay · Google Pay · ACH
                    </p>
                  </div>
                  <span className="tabular-nums text-sm text-[#e8dcc8]/45">
                    +${fmt(fee)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#c79a59]/6 px-4 py-4">
                  <span className="text-[0.5rem] uppercase tracking-[0.3em] text-[#e8dcc8]/45">
                    Total charged
                  </span>
                  <span className="brand-display text-2xl text-[#c79a59]">
                    ${fmt(total)} USD
                  </span>
                </div>
              </div>
            )}

            {/* What you support */}
            <div className="mt-6 space-y-2.5 border-t border-[#e8dcc8]/8 pt-5">
              <p className="mb-3 text-[0.5rem] uppercase tracking-[0.35em] text-[#e8dcc8]/28">
                Your support fuels
              </p>
              {[
                "Independent photo sessions",
                "Exclusive editorial content",
                "Personal art projects",
                "Brand & content development",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="h-px w-3 flex-shrink-0 bg-[#c79a59]/45" />
                  <span className="text-xs leading-relaxed text-[#e8dcc8]/48">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* ===== RIGHT / BOTTOM: Stripe Payment Element ===== */}
          <section className="luxury-panel p-5 md:p-8">
            <h2 className="brand-display mb-6 text-[clamp(1.4rem,3vw,2.2rem)] leading-[0.9] text-[#e8dcc8]">
              Payment method
            </h2>

            {apiError && (
              <div className="mb-4 border border-red-500/20 bg-red-500/5 p-4 text-xs uppercase tracking-[0.2em] text-red-400">
                {apiError}
              </div>
            )}

            {loading && (
              <div className="flex min-h-[300px] items-center justify-center">
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
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
                <svg
                  className="h-8 w-8 text-[#c79a59]/25"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-xs uppercase tracking-[0.3em] text-[#e8dcc8]/22">
                  Enter an amount to continue
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
