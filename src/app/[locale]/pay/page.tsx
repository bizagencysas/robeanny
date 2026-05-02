import { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import PayClientPage from "./PayClientPage";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; amount?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    title: "Support Robeanny",
    description:
      "Support Robeanny's creative work. Independent editorial projects, photo sessions, and content creation. Secure donations powered by Stripe.",
    robots: { index: false, follow: false },
  };
}

export default async function PayPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { success, amount } = await searchParams;

  unstable_setRequestLocale(locale);

  return (
    <PayClientPage
      success={success === "true"}
      paidAmount={amount}
    />
  );
}
