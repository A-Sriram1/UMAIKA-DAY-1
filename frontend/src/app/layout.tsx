import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ETLProvider } from "@/context/ETLContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Banking ETL Platform",
  description: "Production-ready ETL platform for Digital Banking Adoption & UX Optimization",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <ETLProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </ETLProvider>
      </body>
    </html>
  );
}
