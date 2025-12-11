import AuthHydrator from "@/components/AuthHydrator";
import Loading from "@/components/Loading";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/server";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter, Space_Grotesk } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Overflow",
  description:
    "A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more.",
  icons: {
    icon: "/images/site-logo.svg",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Suspense fallback={<Loading />}>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

async function LayoutContent({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <AnchoredToastProvider>
          <QueryProvider>
            <NextTopLoader
              initialPosition={0.08}
              crawlSpeed={200}
              height={6}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              zIndex={1600}
              template='<div id="top-loader" class="bar" role="bar"><div class="peg"></div></div> 
  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
              showAtBottom={false}
            />
            {children}
            <AuthHydrator user={user} />
          </QueryProvider>
        </AnchoredToastProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
