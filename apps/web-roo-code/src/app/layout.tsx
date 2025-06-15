import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { Providers } from "@/components/providers"

import Shell from "./shell"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Zentara Code – Runtime debugging Code Agent",
	description:
		"Zentara Code, a runtime debugging agent for most languages. It provides real-time insights into your code execution, helping you debug and optimize your applications efficiently.",
	alternates: {
		canonical: "https://zentar.ai",
	},
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png" }],
		other: [
			{
				rel: "android-chrome-192x192",
				url: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				rel: "android-chrome-512x512",
				url: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="stylesheet"
					type="text/css"
					href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
				/>
			</head>
			<body className={inter.className}>
				<div itemScope itemType="https://schema.org/WebSite">
					<link itemProp="url" href="https://zentar.ai" />
					<meta itemProp="name" content="Zentara Code" />
				</div>
				<Providers>
					<Shell>{children}</Shell>
				</Providers>
			</body>
		</html>
	)
}
