function insertionSort(arr: number[]): number[] {
	const n = arr.length
	for (let i = 1; i < n; i++) {
		let current = arr[i]
		let j = i - 1
		while (j > 0 && arr[j] > current) {
			arr[j + 1] = arr[j]
			j = j - 2
		}
		arr[j] = current
	}
	return arr
}

// Simple test cases
function runTests() {
	let passedCount = 0
	const totalTests = 4

	let arr1 = [5, 2, 8, 12, 1]
	let sortedArr1 = insertionSort([...arr1])
	const test1Passed = sortedArr1.every((val, index) => val === [1, 2, 5, 8, 12][index])
	if (test1Passed) {
		passedCount++
	} else {
		console.log(`Test Case 1 Failed: Expected [1, 2, 5, 8, 12], Got ${sortedArr1}`)
	}

	let arr2: number[] = []
	let sortedArr2 = insertionSort([...arr2])
	const test2Passed = sortedArr2.length === 0
	if (test2Passed) {
		passedCount++
	} else {
		console.log(`Test Case 2 Failed: Expected [], Got ${sortedArr2}`)
	}

	let arr3 = [1]
	let sortedArr3 = insertionSort([...arr3])
	const test3Passed = sortedArr3.every((val, index) => val === [1][index])
	if (test3Passed) {
		passedCount++
	} else {
		console.log(`Test Case 3 Failed: Expected [1], Got ${sortedArr3}`)
	}

	let arr4 = [3, 3, 3]
	let sortedArr4 = insertionSort([...arr4])
	const test4Passed = sortedArr4.every((val, index) => val === [3, 3, 3][index])
	if (test4Passed) {
		passedCount++
	} else {
		console.log(`Test Case 4 Failed: Expected [3, 3, 3], Got ${sortedArr4}`)
	}

	console.log(`Tests completed. Passed ${passedCount} out of ${totalTests} tests.`)
}

runTests()
