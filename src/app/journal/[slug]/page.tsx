import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { journalPosts } from "@/lib/data";
import type { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return journalPosts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = journalPosts.find(p => p.slug === slug);
    if (!post) return { title: "Post Not Found" };

    return {
        title: post.title,
        description: post.excerpt,
    };
}

export default async function JournalPostPage({ params }: Props) {
    const { slug } = await params;
    const post = journalPosts.find(p => p.slug === slug);

    if (!post) notFound();

    // Find prev/next
    const currentIndex = journalPosts.findIndex(p => p.slug === slug);
    const prevPost = currentIndex > 0 ? journalPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < journalPosts.length - 1 ? journalPosts[currentIndex + 1] : null;

    return (
        <div className="w-full bg-black text-white min-h-screen pt-24 md:pt-32 pb-24">
            <article className="max-w-[800px] mx-auto px-6 md:px-12">
                {/* Meta */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/30">{post.category}</span>
                    <span className="text-white/10">·</span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/30">{post.date}</span>
                    <span className="text-white/10">·</span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/30">{post.readTime}</span>
                </div>

                {/* Title */}
                <h1 className="font-serif text-4xl md:text-6xl font-light leading-[0.9] mb-12">
                    {post.title}
                </h1>

                {/* Cover Image */}
                <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden mb-16">
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-8">
                    {post.content.map((paragraph, i) => (
                        <div key={i}>
                            <p className="editorial-body text-lg md:text-xl text-white/75 leading-relaxed">
                                {paragraph}
                            </p>
                            {/* Insert a photo every 2 paragraphs */}
                            {i > 0 && i % 2 === 1 && post.images[Math.floor(i / 2)] && (
                                <div className="relative w-full h-[40vh] overflow-hidden my-12">
                                    <Image
                                        src={post.images[Math.floor(i / 2)]}
                                        alt={`${post.title} - Image`}
                                        fill
                                        className="object-cover"
                                        sizes="100vw"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/10 my-16" />

                {/* Prev / Next Navigation */}
                <div className="flex justify-between items-center">
                    {prevPost ? (
                        <Link href={`/journal/${prevPost.slug}`} className="group flex flex-col">
                            <span className="font-sans text-[9px] tracking-widest uppercase text-white/30 mb-2">← Previous</span>
                            <span className="font-serif text-lg text-white/60 group-hover:text-white transition-colors">{prevPost.title}</span>
                        </Link>
                    ) : <div />}
                    {nextPost ? (
                        <Link href={`/journal/${nextPost.slug}`} className="group flex flex-col items-end text-right">
                            <span className="font-sans text-[9px] tracking-widest uppercase text-white/30 mb-2">Next →</span>
                            <span className="font-serif text-lg text-white/60 group-hover:text-white transition-colors">{nextPost.title}</span>
                        </Link>
                    ) : <div />}
                </div>
            </article>
        </div>
    );
}
