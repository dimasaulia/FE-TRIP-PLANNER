import { rootMetadata, rootViewport } from "@/features/seo/metadata";
import { RootProviders } from "@/layouts/RootProviders";
import { themeBootScript } from "@/modules/preferences/theme-script";
import { brandMono, brandSans } from "@/styles/fonts";
import "./globals.css";

export const metadata = rootMetadata();
export const viewport = rootViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${brandSans.variable} ${brandMono.variable} h-full antialiased`}
      lang="id"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
