import { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import PayClientPage from "./PayClientPage";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; amount?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  void locale; // locale-independent — page is always in English

  const title = "Spoil Robeanny 🤍";
  const description =
    "Support Robeanny's independent creative work — editorial shoots, photo sessions, and meaningful content. Every contribution makes a difference.";
  const ogImage =
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417060/C331D4C7-A330-46C8-AB87-E451F1B4C119_il9n9f.jpg";
  const url = "https://robeanny.com/pay";

  return {
    title,
    description,
    robots: { index: false, follow: false },

    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Robeanny",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 1500,
          alt: "Robeanny — Support her creative work",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@robeannybl",
    },
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
