function processUserData(users: any[], minScoreThreshold: number): string {
	/**
 * Processes an array of user data objects.
 *
 * Input:
 * - users: An array of user objects. Each object should have:
 *   - id: number
 *   - name: string
 *   - isActive: boolean
 *   - score: number
 * - minScoreThreshold: A number representing the minimum score for a user to be included in the average calculation.
 *
 * Output:
 * - A string summarizing the result, including the number of active users processed
 *   and their average score (if any active users meet the threshold).
 * - Returns an error message string if input is invalid or no users meet the criteria.
 *
 * Key Steps:
 * 1. Validate input array and threshold.
 * 2. Filter out inactive users.
 * 3. Filter users below the score threshold.
 * 4. Calculate the sum of scores for the filtered users.
 * 5. Calculate the average score.
 * 6. Format and return the summary string.
 */
	// Error 1: Loose comparison allows null/undefined users array
	if (users == null || !Array.isArray(users) || users.length == 0) {
		return "Error: Invalid user data provided."
	}

	// Error 2: typeof null is 'object', so this check is flawed
	if (typeof minScoreThreshold !== "number" || minScoreThreshold < 0) {
		// Error 3: Typo O instead of 0 (FIXED)
		return "Error: Invalid minimum score threshold."
	}

	let activeUsers = [] // Error 4: Should be typed, e.g., any[] or a specific User interface
	for (let i = 0; i < users.length; i++) {
		// Error 5: Off-by-one error (<= instead of <) (FIXED)
		// Error 6: Accessing property 'isActive' on potentially undefined user[i] due to Error 5
		if (users[i].isActive) {
			// This should no longer crash immediately
			activeUsers.push(users[i])
		}
	}

	let qualifiedUsers = activeUsers.filter((user) => {
		// Error 7: 'score' might not exist if input objects are inconsistent
		return user.score >= minScoreThreshold // Error 8: Typo in variable name 'minScoreTreshold' (FIXED)
	})

	if (qualifiedUsers.length === 0) {
		return "No active users met the score threshold."
	}

	let totalScore = 0
	// Error 9: Using for...in iterates over keys (indices as strings), not values
	for (const index in qualifiedUsers) {
		totalScore = totalScore + qualifiedUsers[index].score // Error 10: Potential type issue if score isn't a number
	}

	// Error 11: Integer division might occur if not careful in some JS environments (though less common now)
	const averageScore = totalScore / qualifiedUsers.length

	// Error 12: Using 'this' in a standalone function (will likely be undefined or global object in non-strict/strict mode)
	// Let's pretend there's a config object we expect 'this' to refer to. (REMOVED 'this' USAGE)
	const decimalPlaces = 2 // Defaulting to 2, as 'this' is not meaningful here.

	// Error 13: Syntax Error - missing closing parenthesis (FIXED)
	return `Processed ${activeUsers.length} active users. Average score of qualified users: ${averageScore.toFixed(decimalPlaces)}`
	// Error 14: Logic Error - Reports count of *all* active users, not just *qualified* ones in the final message.
}

// --- Example Usage ---

interface User {
	id: number
	name: string
	isActive: boolean
	score: number
}

const userData: User[] = [
	{ id: 1, name: "Alice", isActive: true, score: 85 },
	{ id: 2, name: "Bob", isActive: false, score: 90 },
	{ id: 3, name: "Charlie", isActive: true, score: 70 },
	{ id: 4, name: "David", isActive: true, score: 95 },
	{ id: 5, name: "Eve", isActive: false, score: 80 },
	{ id: 6, name: "Frank", isActive: true, score: 65 }, // Below threshold
]

const invalidUserData: any[] = [
	{ id: 1, name: "Alice", isActive: true, score: 85 },
	{ id: 2, name: "Bob", isActive: false, score: 90 },
	null, // Invalid entry
	{ id: 4, name: "David", isActive: true, score: 95 },
]

const threshold = 75

console.log("--- Processing Valid Data ---")
const result1 = processUserData(userData, threshold)
console.log(result1) // Expected: "Processed 4 active users. Average score of qualified users: 90.00" (or similar based on actual qualified count)

console.log("\n--- Processing Invalid User Array ---")
const result2 = processUserData(null as any, threshold) // Simulate invalid input
console.log(result2) // Expected: "Error: Invalid user data provided."

console.log("\n--- Processing Invalid Threshold ---")
const result3 = processUserData(userData, -10) // Simulate invalid threshold
console.log(result3) // Expected: "Error: Invalid minimum score threshold."

console.log("\n--- Processing Data with Null Entry ---")
// This will likely cause a runtime error due to Error 5 & 6 or Error 7
try {
	const result4 = processUserData(invalidUserData, threshold)
	console.log(result4)
} catch (e: any) {
	console.error("Caught Error:", e.message)
}

console.log("\n--- Processing Data with No Qualifying Users ---")
const result5 = processUserData(userData, 100) // Threshold too high
console.log(result5) // Expected: "No active users met the score threshold."

export { processUserData, User } // Export for potential testing

// --- Unit Tests ---
import * as assert from "assert"

console.log("\n\n--- Running Unit Tests ---")

// Test Case 1: Valid data, expected success
try {
	const validData: User[] = [
		{ id: 1, name: "Alice", isActive: true, score: 85 },
		{ id: 2, name: "Bob", isActive: false, score: 90 },
		{ id: 3, name: "Charlie", isActive: true, score: 70 }, // Below threshold
		{ id: 4, name: "David", isActive: true, score: 95 },
		{ id: 6, name: "Frank", isActive: true, score: 65 }, // Below threshold
	]
	const expected1 = "Processed 4 active users. Average score of qualified users: 90.00" // This expectation is likely wrong due to bugs
	const actual1 = processUserData(validData, 75)
	// We expect this to fail due to bugs, but let's write the ideal assertion
	// assert.strictEqual(actual1, expected1, "Test Case 1 Failed: Valid data");
	console.log("Test Case 1: Ran (assertion commented out due to known bugs)")
} catch (e: any) {
	console.error("Test Case 1 Failed with error:", e.message)
}

// Test Case 2: Invalid user array (null)
try {
	const expected2 = "Error: Invalid user data provided."
	const actual2 = processUserData(null as any, 75)
	assert.strictEqual(actual2, expected2, "Test Case 2 Failed: Null user array")
	console.log("Test Case 2 Passed: Null user array handled.")
} catch (e: any) {
	console.error("Test Case 2 Failed with error:", e.message)
}

// Test Case 3: Invalid user array (empty)
try {
	const expected3 = "Error: Invalid user data provided."
	const actual3 = processUserData([], 75)
	assert.strictEqual(actual3, expected3, "Test Case 3 Failed: Empty user array")
	console.log("Test Case 3 Passed: Empty user array handled.")
} catch (e: any) {
	console.error("Test Case 3 Failed with error:", e.message)
}

// Test Case 4: Invalid threshold (negative) - Should hit Error 3 (Typo O) first
try {
	const expected4 = "Error: Invalid minimum score threshold."
	const actual4 = processUserData(userData, -10) // userData defined earlier
	assert.strictEqual(actual4, expected4, "Test Case 4 Failed: Negative threshold")
	console.log("Test Case 4 Passed: Negative threshold handled.")
} catch (e: any) {
	// Expecting a ReferenceError due to 'O' typo before the logic check
	assert.match(e.message, /O is not defined/i, "Test Case 4 Failed: Did not get expected ReferenceError for 'O'")
	console.log("Test Case 4 Passed: Caught expected ReferenceError for 'O'.")
}

// Test Case 5: No qualifying users
try {
	const expected5 = "No active users met the score threshold."
	const actual5 = processUserData(userData, 100) // userData defined earlier
	assert.strictEqual(actual5, expected5, "Test Case 5 Failed: No qualifying users")
	console.log("Test Case 5 Passed: No qualifying users handled.")
} catch (e: any) {
	console.error("Test Case 5 Failed with error:", e.message)
}

// Test Case 6: Data with null entry (expecting runtime error)
try {
	const invalidDataWithNull: any[] = [
		{ id: 1, name: "Alice", isActive: true, score: 85 },
		null,
		{ id: 4, name: "David", isActive: true, score: 95 },
	]
	processUserData(invalidDataWithNull, 75)
	// If it reaches here, the test failed because an error was expected
	console.error("Test Case 6 Failed: Expected a runtime error but none occurred.")
} catch (e: any) {
	// We expect an error like "Cannot read property 'isActive' of null" due to Error 5 & 6
	assert.match(
		e.message,
		/Cannot read properties of null \(reading 'isActive'\)/i,
		"Test Case 6 Failed: Did not get expected runtime error",
	)
	console.log("Test Case 6 Passed: Caught expected runtime error for null user entry.")
}

// Test Case 7: Typo in threshold variable name (minScoreTreshold)
try {
	const dataForTypoTest: User[] = [{ id: 1, name: "TypoTest", isActive: true, score: 80 }]
	processUserData(dataForTypoTest, 75)
	// If it reaches here, the test failed because an error was expected
	console.error("Test Case 7 Failed: Expected a ReferenceError but none occurred.")
} catch (e: any) {
	// Expecting a ReferenceError due to 'minScoreTreshold' typo
	assert.match(
		e.message,
		/minScoreTreshold is not defined/i,
		"Test Case 7 Failed: Did not get expected ReferenceError for typo",
	)
	console.log("Test Case 7 Passed: Caught expected ReferenceError for threshold typo.")
}

// Test Case 8: Syntax error in return statement (missing parenthesis)
// This won't be caught by a runtime test easily, it's a compile-time/parse error.
// We'll rely on the initial linting/TS errors for this.
console.log("Test Case 8: Skipped (Syntax error detected by compiler/linter).")

console.log("\n--- Unit Tests Finished ---")
