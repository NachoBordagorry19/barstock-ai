import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://barstock-ai.vercel.app"),
  title: {
    default: "Barstock AI — Gestión de stock para bares y control de inventario de bebidas",
    template: "%s | Barstock AI",
  },
  description:
    "Barstock AI automatiza la gestión de stock para bares con visión artificial. Control de inventario de bebidas en tiempo real, optimización de compras y reducción de mermas operativas.",
  keywords: [
    "gestión de stock para bares",
    "control de inventario de bebidas",
    "reducción de mermas",
    "inventario de bar",
    "conteo de botellas",
    "software para bares",
    "visión artificial inventario",
  ],
  authors: [{ name: "Barstock AI" }],
  openGraph: {
    title: "Barstock AI — Gestión inteligente de inventario para bares",
    description:
      "Control de inventario de bebidas en tiempo real con IA. Reducí mermas y optimizá tus compras.",
    type: "website",
    locale: "es_AR",
    siteName: "Barstock AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barstock AI",
    description: "Gestión de stock para bares con visión artificial.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0a0c12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
