import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Make Donation",
  description: "Make Donation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="min-h-screen bg-gray-100">
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar />
          <div className="min-h-screen bg-gray-100">{children}</div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
