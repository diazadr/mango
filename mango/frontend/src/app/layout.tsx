import { Inter, Chakra_Petch } from "next/font/google";
import "@/src/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const chakraPetch = Chakra_Petch({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-chakra-petch",
});

/**
 * Root layout — provides the single html/body shell for the entire app.
 * [locale]/layout.tsx provides i18n providers without re-wrapping html/body.
 * not-found.tsx renders inside this shell automatically.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className={`${inter.variable} ${chakraPetch.variable}`}>
            <body className="font-sans antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
