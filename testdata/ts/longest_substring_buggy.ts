function longestSubstringWithKDistinctBuggy(s: string, k: number): number {
	if (!s || k <= 0) {
		return 0
	}

	const charCount = new Map<string, number>()
	let maxLength = 0
	let windowStart = 0

	for (let windowEnd = 0; windowEnd < s.length; windowEnd++) {
		const rightChar = s[windowEnd]
		charCount.set(rightChar, (charCount.get(rightChar) || 0) + 1)

		// Shrink window while we have more than k distinct characters
		while (charCount.size > k) {
			const leftChar = s[windowStart]
			charCount.set(leftChar, (charCount.get(leftChar) as number) - 1)
			// Bug: Character is not removed from the map when its count reaches 0
			// if (charCount.get(leftChar) === 0) {
			//     charCount.delete(leftChar);
			// }
			windowStart += 1
		}

		// Update max_length
		maxLength = Math.max(maxLength, windowEnd - windowStart + 1)
	}

	return maxLength
}

// Example usage:
const testString = "araaci"
const kValue = 2
const result = longestSubstringWithKDistinctBuggy(testString, kValue)
console.log(`Input string: "${testString}", k: ${kValue}`)
console.log(`Longest substring length: ${result}`) // Expected: 4 ("araa")

const testString2 = "aaabaabaaa"
const kValue2 = 2
const result2 = longestSubstringWithKDistinctBuggy(testString2, kValue2)
console.log(`Input string: "${testString2}", k: ${kValue2}`)
console.log(`Longest substring length: ${result2}`) // Expected: 7 ("aaabaaa")

export { longestSubstringWithKDistinctBuggy } // Export for potential testing
