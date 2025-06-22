"use client"

import { useTheme } from "next-themes"

export function useLogoSrc(): string {
	const { resolvedTheme } = useTheme()
	return resolvedTheme === "light" ? "/zentara-code-Logo-Horiz-blk.svg" : "/zentara-code-Logo-Horiz-white.svg"
}
