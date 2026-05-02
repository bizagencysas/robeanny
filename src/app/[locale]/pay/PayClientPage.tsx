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
/*  Formula to gross up so Robeanny receives 100% of intended amount:  */
/*    chargeAmount = (intended + 0.30) / (1 - 0.029)                  */
/* ------------------------------------------------------------------ */
const STRIPE_PCT = 0.029;
const STRIPE_FIXED = 0.30;

function calcFees(intendedUSD: number): {
  fee: number;
  total: number;
} {
  if (!intendedUSD || intendedUSD <= 0) return { fee: 0, total: 0 };
  const total = (intendedUSD + STRIPE_FIXED) / (1 - STRIPE_PCT);
  const fee = total - intendedUSD;
  return { fee: Math.round(fee * 100) / 100, total: Math.round(total * 100) / 100 };
}

function fmt(n: number) {
  return n.toFixed(2);
}

/* ------------------------------------------------------------------ */
/*  Inner form — must be inside <Elements>                             */
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
      setErrorMsg(error.message ?? "Ocurrió un error.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="pay-element-wrapper">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { applePay: "auto", googlePay: "auto" },
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
            Procesando…
          </span>
        ) : (
          `Donar $${totalAmount} USD`
        )}
      </button>

      <p className="text-center text-[0.5rem] uppercase tracking-[0.3em] text-[#e8dcc8]/25">
        Pago seguro procesado por Stripe · TLS 256-bit
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */
const PRESETS = ["5", "10", "25", "50", "100"];

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
  const [preset, setPreset] = useState("10");
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // The "intended" donation amount (what Robeanny will receive)
  const intendedRaw = customAmount || preset;
  const intended = parseFloat(intendedRaw) || 0;

  // Live fee breakdown
  const { fee, total } = useMemo(() => calcFees(intended), [intended]);

  // Send the TOTAL (intended + fee) to the API — Robeanny nets the full intended
  const fetchIntent = useCallback(async (totalUSD: number) => {
    setClientSecret(null);
    setApiError("");
    if (!totalUSD || totalUSD < 1.01) return;
    setLoading(true);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We pass the total (including fee) — Stripe charges this amount
        body: JSON.stringify({ amount: fmt(totalUSD) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClientSecret(data.clientSecret);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Error al cargar Stripe");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch whenever fee/total changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (total >= 1.01) fetchIntent(total);
    }, 650);
    return () => clearTimeout(timer);
  }, [total, fetchIntent]);

  /* Stripe Elements appearance */
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
        <p className="label-kicker mb-4">Confirmado</p>
        <h1 className="brand-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.9] text-[#e8dcc8]">
          ¡Gracias!
        </h1>
        {paidAmount && (
          <p className="mt-3 text-[#c79a59] brand-display text-2xl">
            ${paidAmount} USD
          </p>
        )}
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#e8dcc8]/50">
          Tu apoyo significa mucho. Recibirás un correo de confirmación de
          Stripe en breve.
        </p>
        <a href="/" className="luxury-button mt-10">
          Volver al inicio
        </a>
      </div>
    );
  }

  /* ---- Main page ---- */
  return (
    <div className="min-h-screen bg-black pb-24 pt-24 md:pt-32">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 opacity-30"
        style={{
          width: "600px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(199,154,89,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="page-shell">
        {/* Header */}
        <div>
          <p className="label-kicker mb-5">Support</p>
          <h1 className="brand-display text-[clamp(2.4rem,7vw,6rem)] leading-[0.88] tracking-[0.05em] text-[#e8dcc8]">
            Apoya mi
            <br />
            <em>trabajo</em>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#e8dcc8]/45">
            Cada contribución me ayuda a seguir creando contenido, proyectos
            editoriales y sesiones independientes. Gracias por estar aquí.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">

          {/* ---- Left panel: amount + fee breakdown ---- */}
          <aside className="luxury-panel h-fit p-6 md:p-8">
            <h2 className="brand-display text-[clamp(1.4rem,3vw,2.2rem)] leading-[0.9] text-[#e8dcc8]">
              Elige un monto
            </h2>

            {/* Preset amounts */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPreset(p); setCustomAmount(""); }}
                  className={`pay-preset-btn ${
                    intendedRaw === p && !customAmount
                      ? "pay-preset-btn--active"
                      : ""
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mt-4">
              <label className="flex flex-col gap-2">
                <span className="text-[0.52rem] uppercase tracking-[0.3em] text-[#e8dcc8]/30">
                  Monto personalizado (USD)
                </span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#e8dcc8]/40">
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
                    placeholder="0.00"
                    className="w-full border border-[#e8dcc8]/10 bg-[#0a0a0a] py-3 pl-8 pr-4 text-sm text-[#e8dcc8] outline-none transition-colors focus:border-[#c79a59]/50 placeholder:text-[#e8dcc8]/20"
                  />
                </div>
              </label>
            </div>

            {/* Fee breakdown — live */}
            {intended > 0 && (
              <div className="mt-6 space-y-0 border border-[#e8dcc8]/8">
                {/* Row: Donation */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8dcc8]/6">
                  <span className="text-[0.52rem] uppercase tracking-[0.3em] text-[#e8dcc8]/40">
                    Tu donación
                  </span>
                  <span className="text-sm text-[#e8dcc8]/70">
                    ${fmt(intended)}
                  </span>
                </div>
                {/* Row: Processing fee */}
                <div className="flex items-start justify-between px-4 py-3 border-b border-[#e8dcc8]/6">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[0.52rem] uppercase tracking-[0.3em] text-[#e8dcc8]/40">
                      Fee de procesamiento
                    </span>
                    <span className="text-[0.46rem] text-[#e8dcc8]/25 tracking-wider">
                      Tarjeta · Apple Pay · Google Pay · ACH
                    </span>
                  </div>
                  <span className="text-sm text-[#e8dcc8]/50 tabular-nums">
                    +${fmt(fee)}
                  </span>
                </div>
                {/* Row: Total charged */}
                <div className="flex items-center justify-between bg-[#c79a59]/6 px-4 py-4">
                  <span className="text-[0.52rem] uppercase tracking-[0.3em] text-[#e8dcc8]/50">
                    Total a cobrar
                  </span>
                  <span className="brand-display text-2xl text-[#c79a59]">
                    ${fmt(total)} USD
                  </span>
                </div>
              </div>
            )}

            {intended <= 0 && (
              <div className="mt-6 border border-[#e8dcc8]/6 bg-[#c79a59]/4 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[0.52rem] uppercase tracking-[0.3em] text-[#e8dcc8]/40">
                    Total
                  </span>
                  <span className="brand-display text-2xl text-[#c79a59]/40">
                    $0.00 USD
                  </span>
                </div>
              </div>
            )}

            {/* What you're supporting */}
            <div className="mt-7 border-t border-[#e8dcc8]/8 pt-6 space-y-3">
              <p className="text-[0.52rem] uppercase tracking-[0.3em] text-[#e8dcc8]/30">
                Tu apoyo incluye
              </p>
              {[
                "Sesiones fotográficas independientes",
                "Contenido editorial exclusivo",
                "Proyectos artísticos personales",
                "Desarrollo de marca y contenido",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 h-1 w-3 flex-shrink-0 bg-[#c79a59]/50" />
                  <span className="text-xs text-[#e8dcc8]/55 leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* ---- Right panel: Stripe Payment Element ---- */}
          <section className="luxury-panel p-6 md:p-8">
            <h2 className="brand-display text-[clamp(1.4rem,3vw,2.2rem)] leading-[0.9] text-[#e8dcc8] mb-6">
              Método de pago
            </h2>

            {apiError && (
              <div className="mb-4 border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 uppercase tracking-[0.2em]">
                {apiError}
              </div>
            )}

            {loading && (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="pay-spinner-lg" />
              </div>
            )}

            {!loading && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance, locale: "es" }}
                key={clientSecret} // remount when secret changes (new amount)
              >
                <DonationForm
                  intendedAmount={fmt(intended)}
                  totalAmount={fmt(total)}
                />
              </Elements>
            )}

            {!loading && !clientSecret && !apiError && (
              <div className="flex min-h-[320px] items-center justify-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[#e8dcc8]/25">
                  Selecciona un monto para continuar
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
