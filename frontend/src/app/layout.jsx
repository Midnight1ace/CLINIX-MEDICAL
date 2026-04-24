import "../styles/globals.css";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import LoggerInitializer from "@/components/LoggerInitializer";

const heading = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "CLINIX",
  description: "Multi-agent clinical workflow engine"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable}`}>
        <LoggerInitializer />
        {children}
      </body>
    </html>
  );
}
