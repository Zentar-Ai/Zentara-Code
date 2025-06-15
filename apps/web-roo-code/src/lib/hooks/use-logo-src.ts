"use client"

import { useTheme } from "next-themes"

export function useLogoSrc(): string {
	const { resolvedTheme } = useTheme()
	return resolvedTheme === "light" ? "/roo-code-Logo-Horiz-blk.svg" : "/roo-code-Logo-Horiz-white.svg"
}
