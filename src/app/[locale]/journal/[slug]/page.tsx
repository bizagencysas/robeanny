import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n";
import { journalPosts } from "@/lib/data";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const localizedPath = (locale: string, href: string) => {
  if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
  return href;
};

export async function generateStaticParams() {
  return locales.flatMap((locale) => journalPosts.map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = journalPosts.find((item) => item.slug === slug);
  if (!post) return { title: "Post Not Found" };

  const safeLocale: Locale = locale === "en" ? "en" : "es";
  const path = `/journal/${slug}`;
  const canonical = absoluteUrl(safeLocale, path);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { locale, slug } = await params;
  unstable_setRequestLocale(locale);

  const post = journalPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  const currentIndex = journalPosts.findIndex((item) => item.slug === slug);
  const prevPost = currentIndex > 0 ? journalPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < journalPosts.length - 1 ? journalPosts[currentIndex + 1] : null;

  const dateText = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.date));

  return (
    <div className="min-h-screen pb-24 pt-24 md:pt-32">
      <article className="page-shell max-w-[980px]">
        <Link
          href={localizedPath(locale, "/journal")}
          className="inline-flex border border-black/18 px-4 py-2 text-[0.62rem] uppercase tracking-[0.28em] text-[#171513]/66 transition-colors hover:border-black hover:text-[#171513]"
        >
          ← Journal
        </Link>

        <div className="mt-8 border-b border-black/12 pb-8">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/48">
            <span>{post.category}</span>
            <span>•</span>
            <span>{dateText}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="brand-display text-[clamp(2.2rem,6vw,5.2rem)] leading-[0.9] tracking-[0.05em] text-[#171513]">
            {post.title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[#171513]/62 md:text-base">{post.excerpt}</p>
        </div>

        <div className="edge-fade relative mt-8 min-h-[52svh] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        <div className="mt-10 space-y-7">
          {post.content.map((paragraph, i) => (
            <div key={i}>
              <p className="text-[1.03rem] leading-[1.95] text-[#171513]/80 md:text-[1.15rem]">{paragraph}</p>

              {i > 0 && i % 2 === 1 && post.images[Math.floor(i / 2)] && (
                <div className="mt-8 overflow-hidden border border-black/12">
                  <div className="relative h-[380px] w-full md:h-[520px]">
                    <Image
                      src={post.images[Math.floor(i / 2)]}
                      alt={`${post.title} image ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 border-t border-black/12 pt-8 md:grid-cols-2">
          <div>
            {prevPost ? (
              <Link
                href={localizedPath(locale, `/journal/${prevPost.slug}`)}
                className="group block border border-black/14 bg-white/55 p-4 transition-colors hover:border-black/35"
              >
                <p className="text-[0.58rem] uppercase tracking-[0.28em] text-[#171513]/50">← Previous</p>
                <p className="brand-display mt-3 text-[clamp(1.3rem,3.2vw,2rem)] leading-[0.95] text-[#171513] group-hover:text-[#171513]/82">
                  {prevPost.title}
                </p>
              </Link>
            ) : null}
          </div>

          <div>
            {nextPost ? (
              <Link
                href={localizedPath(locale, `/journal/${nextPost.slug}`)}
                className="group block border border-black/14 bg-white/55 p-4 text-right transition-colors hover:border-black/35"
              >
                <p className="text-[0.58rem] uppercase tracking-[0.28em] text-[#171513]/50">Next →</p>
                <p className="brand-display mt-3 text-[clamp(1.3rem,3.2vw,2rem)] leading-[0.95] text-[#171513] group-hover:text-[#171513]/82">
                  {nextPost.title}
                </p>
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}
