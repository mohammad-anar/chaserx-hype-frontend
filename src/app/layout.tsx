import type { Metadata } from "next";
import { Inter, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { CartProvider } from "@/providers/CartProvider";
import SocketNotificationListener from "@/components/SocketNotificationListener";
import MaintenanceGuard from "@/components/MaintenanceGuard";

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-sans",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-serif",
});

const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    style: ["normal", "italic"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: "--font-italic",
});

export const metadata: Metadata = {
    title: {
        template: "%s | Bean Fien Admin",
        default: "Bean Fien Admin Panel",
    },
    description: "Bean Fien Coffee Shop Admin & Dashboard Panel",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.variable} ${montserrat.variable} ${playfairDisplay.variable} font-sans antialiased bg-background text-foreground`}>
                <ReduxProvider>
                    <CartProvider>
                        <MaintenanceGuard>
                            <SocketNotificationListener />
                            {children}
                        </MaintenanceGuard>
                    </CartProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}
