import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import type { Metadata } from "next";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";
import { AuthProvider } from "@/src/components/providers/AuthProvider";
import { Toaster } from "sonner";

import { I18nProvider } from "@/src/components/providers/I18nProvider";

export const metadata: Metadata = {
    title: {
        template: "%s | MANGO",
        default: "MANGO",
    },
    description: "Platform pendampingan ekosistem manufaktur cerdas untuk memberdayakan IKM bertransformasi menuju Industri 4.0.",
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <ThemeProvider>
            <I18nProvider locale={locale} messages={messages as any}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </I18nProvider>
            <Toaster richColors position="top-right" />
        </ThemeProvider>
    );
}