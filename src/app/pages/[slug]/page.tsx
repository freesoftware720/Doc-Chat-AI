
import { getAppSettings } from "@/app/actions/settings";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const settings = await getAppSettings();
    const pages = (settings.landing_page_content as any)?.legal_pages || {};
    const pageContent = pages[params.slug];

    if (!pageContent) {
        return { title: 'Page Not Found' };
    }

    return {
        title: `${pageContent.title} | Doc-Chat AI`,
    };
}


export default async function Page({ params }: { params: { slug: string } }) {
    const settings = await getAppSettings();
    const pages = (settings.landing_page_content as any)?.legal_pages || {};
    const pageContent = pages[params.slug];

    if (!pageContent) {
        notFound();
    }

    return (
        <article className="prose dark:prose-invert max-w-4xl mx-auto bg-card/60 p-8 md:p-12 rounded-2xl border border-white/10 shadow-lg">
            <h1>{pageContent.title}</h1>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {pageContent.content}
            </ReactMarkdown>
        </article>
    )
}
