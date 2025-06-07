var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function insertionSort(arr) {
    var n = arr.length;
    for (var i = 1; i < n; i++) {
        var current = arr[i];
        var j = i - 1;
        while (j >= 0 && arr[j] > current) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = current;
    }
    return arr;
}
// Simple test cases
function runTests() {
    var passedCount = 0;
    var totalTests = 4;
    var arr1 = [5, 2, 8, 12, 1];
    var sortedArr1 = insertionSort(__spreadArray([], arr1, true));
    var test1Passed = sortedArr1.every(function (val, index) { return val === [1, 2, 5, 8, 12][index]; });
    if (test1Passed) {
        passedCount++;
    }
    else {
        console.log("Test Case 1 Failed: Expected [1, 2, 5, 8, 12], Got ".concat(sortedArr1));
    }
    var arr2 = [];
    var sortedArr2 = insertionSort(__spreadArray([], arr2, true));
    var test2Passed = sortedArr2.length === 0;
    if (test2Passed) {
        passedCount++;
    }
    else {
        console.log("Test Case 2 Failed: Expected [], Got ".concat(sortedArr2));
    }
    var arr3 = [1];
    var sortedArr3 = insertionSort(__spreadArray([], arr3, true));
    var test3Passed = sortedArr3.every(function (val, index) { return val === [1][index]; });
    if (test3Passed) {
        passedCount++;
    }
    else {
        console.log("Test Case 3 Failed: Expected [1], Got ".concat(sortedArr3));
    }
    var arr4 = [3, 3, 3];
    var sortedArr4 = insertionSort(__spreadArray([], arr4, true));
    var test4Passed = sortedArr4.every(function (val, index) { return val === [3, 3, 3][index]; });
    if (test4Passed) {
        passedCount++;
    }
    else {
        console.log("Test Case 4 Failed: Expected [3, 3, 3], Got ".concat(sortedArr4));
    }
    console.log("Tests completed. Passed ".concat(passedCount, " out of ").concat(totalTests, " tests."));
}
runTests();
