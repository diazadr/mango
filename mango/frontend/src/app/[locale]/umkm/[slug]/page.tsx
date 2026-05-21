import React from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicUmkmProfileView } from "@/src/features/umkm-profile/views/PublicUmkmProfileView";

// This is a server component to help with SEO
async function getUmkmData(slug: string) {
    const backendUrls = [
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
        "http://127.0.0.1:8000"
    ];
    
    const endpointPaths = [
        `/api/v1/public/umkms/${slug}`,
        `/api/v1/public/umkm/${slug}`,
        `/api/v1/public/umkms/${slug}/profile`,
        `/api/v1/public/umkm/${slug}/profile`,
        `/api/public/umkms/${slug}`,
        `/api/public/umkm/${slug}`,
        `/api/v1/umkms/${slug}`,
        `/api/v1/umkm/${slug}`
    ];

    for (const baseUrl of backendUrls) {
        for (const path of endpointPaths) {
            const url = `${baseUrl}${path}`;
            try {
                console.log(`[UMKM Fetch] Trying: ${url}`);
                const res = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    next: { revalidate: 60 }
                });
                
                if (res.ok) {
                    const json = await res.json();
                    const data = json.data || json;
                    if (data && (data.name || data.id)) {
                        console.log(`[UMKM Fetch] Success! Found at: ${url}`);
                        return data;
                    }
                }
            } catch (error) {
                // Ignore individual errors during search
            }
        }
    }
    
    return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const umkm = await getUmkmData(resolvedParams.slug);
    if (!umkm) return { title: "UMKM Not Found" };

    return {
        title: `${umkm.name} — Ekosistem MANGO`,
        description: umkm.description || umkm.profile?.mission || `Profil bisnis ${umkm.name} di platform MANGO.`,
        openGraph: {
            images: [umkm.logo_url || "/images/placeholders/company.png"]
        }
    };
}

export default async function PublicUmkmProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const umkm = await getUmkmData(resolvedParams.slug);
    const t = await getTranslations("UmkmDetail");

    return <PublicUmkmProfileView umkm={umkm} slug={resolvedParams.slug} t={t} />;
}
