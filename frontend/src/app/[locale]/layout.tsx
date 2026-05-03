import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { Inter, Chakra_Petch } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";
import { AuthProvider } from "@/src/components/providers/AuthProvider";
import "@/src/app/globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const chakraPetch = Chakra_Petch({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-chakra-petch",
});

export const metadata: Metadata = {
    title: "MANGO | Manufacturing Advisor and Go Up Together",
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
        <html 
            lang={locale} 
            suppressHydrationWarning
        >
            <body className={`${inter.variable} ${chakraPetch.variable} font-sans antialiased`}>
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages}>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}