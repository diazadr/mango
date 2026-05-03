import { BaseErrorView } from "@/src/components/common/BaseErrorView";
import { Inter, Chakra_Petch } from "next/font/google";
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

export default function NotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${chakraPetch.variable}`}>
        <body className="font-sans antialiased">
            <BaseErrorView 
                statusCode={404} 
                title="Page Not Found"
                description="Sorry, the page you are looking for might have been moved, deleted, or never existed in the MANGO system."
                goBackText="Go Back"
                goHomeText="Back to Home"
                useNativeLink={true}
            />
        </body>
    </html>
  );
}