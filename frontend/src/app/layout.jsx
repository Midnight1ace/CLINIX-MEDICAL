import "../styles/globals.css";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";

const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "CLINIX",
  description: "Multi-agent clinical workflow engine"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable}`}>
        {children}
      </body>
    </html>
  );
}
