import Head from "next/head";
import { NextSeo } from "next-seo";
import BASE_URL from "@/config";

const SOCIAL_IMAGE_PATH = "/images/seo/medilocate-social-preview.png";

export default function PageSeo({ title, description, path = "/", keywords = "", schemaType = "WebPage" }) {
    const canonicalUrl = `${BASE_URL}${path}`;
    const imageUrl = `${BASE_URL}${SOCIAL_IMAGE_PATH}`;
    const structuredData = {
        "@context": "https://schema.org",
        "@type": schemaType,
        name: title,
        description,
        url: canonicalUrl,
        image: imageUrl,
        isPartOf: {
            "@type": "WebSite",
            name: "MediLocate",
            url: BASE_URL,
        },
    };

    return (
        <>
            <NextSeo
                title={title}
                description={description}
                canonical={canonicalUrl}
                additionalMetaTags={keywords ? [{ name: "keywords", content: keywords }] : []}
                openGraph={{
                    type: "website",
                    locale: "en_BD",
                    siteName: "MediLocate",
                    title,
                    description,
                    url: canonicalUrl,
                    images: [{ url: imageUrl, width: 1733, height: 909, alt: "MediLocate doctor, prescription and medicine services", type: "image/png" }],
                }}
                twitter={{ cardType: "summary_large_image" }}
            />
            <Head>
                <script key={`seo-jsonld-${path}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            </Head>
        </>
    );
}
