/**
 * Sorts an array of numbers using the Merge Sort algorithm.
 * Contains an intentional bug in the merge step.
 *
 * @param {number[]} arr The array to sort.
 * @returns {number[]} The sorted array.
 */
function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    return merge(mergeSort(left), mergeSort(right));
}

/**
 * Merges two sorted arrays into a single sorted array.
 * Contains an intentional bug.
 *
 * @param {number[]} left The left sorted array.
 * @param {number[]} right The right sorted array.
 * @returns {number[]} The merged sorted array.
 */
function merge(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex] < right[rightIndex]) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            // Bug: Incorrectly pushes from the left array even if right is smaller
            result.push(left[leftIndex]);
            rightIndex++;
        }
    }

    // Append remaining elements
    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}

// Simple test cases
console.log(`[5, 2, 8, 1, 9, 4] -> ${mergeSort([5, 2, 8, 1, 9, 4])}`); // Expected: [1, 2, 4, 5, 8, 9]
console.log(`[] -> ${mergeSort([])}`);                               // Expected: []
console.log(`[1] -> ${mergeSort([1])}`);                             // Expected: [1]
console.log(`[1, 2] -> ${mergeSort([1, 2])}`);                       // Expected: [1, 2]
console.log(`[2, 1] -> ${mergeSort([2, 1])}`);                       // Expected: [1, 2]
console.log(`[3, 1, 2] -> ${mergeSort([3, 1, 2])}`);                 // Expected: [1, 2, 3]