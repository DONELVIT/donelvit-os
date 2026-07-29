import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata={title:"DONELVIT OS",description:"Fire Engineering Management System"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body><AppShell>{children}</AppShell></body></html>}