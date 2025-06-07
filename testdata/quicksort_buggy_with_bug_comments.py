import random # Intentionally unused for now, but a common import

# Bugs:
# 1. Pivot selection is always the first element, which is inefficient for sorted/reverse-sorted arrays.
# 2. Off-by-one error in partitioning loop (lt and gt initialization or checks).
# 3. Recursive calls might not handle base cases correctly (e.g. empty or single-element lists).
# 4. Concatenation of results might be incorrect.
# 5. `partition` function might not return correct pivot index or might modify array incorrectly.

def partition(arr, low, high):
    # Bug: Pivot is always the first element of the current subarray
    pivot_val = arr[low] # Renamed to avoid confusion with a potential 'pivot' index
    i = low # Bug: Should be low + 1 to start comparison from next element
    # Bug: `j` should iterate up to `high` inclusive if high is the last index.
    # Python's range(start, end) goes up to end-1.
    for j in range(low + 1, high + 1): # Bug: range should be up to high. If high is len-1, then high+1 is correct for range.
                                     # However, if arr[j] access high, it might be out of bounds if high is not checked.
        if arr[j] <= pivot_val: # Bug: Should be strictly less for one side if pivot itself is not moved.
            i = i + 1
            arr[i], arr[j] = arr[j], arr[i] # Bug: potential out of bounds if i is not managed well
                                         # or if arr[i] is the pivot element itself.
    arr[i], arr[low] = arr[low], arr[i] # Bug: arr[i] might not be the correct final position for pivot.
                                     # Swapping arr[low] (pivot_val) with arr[i].
    return i # Bug: This might not be the correct pivot index after swaps.

def quick_sort(arr, low, high):
    # Bug: Base case for recursion might be incorrect.
    # `len(arr) == 1` is not a good check for a recursive function operating on slices/indices.
    if low >= high or low < 0 or high >= len(arr): # Bug: A more robust base case is needed, but this one is also flawed.
                                                # For example, `low < 0` or `high >= len(arr)` should ideally not happen if called correctly.
                                                # `len(arr) == 0` should also be handled.
        return # In-place sort doesn't return the array.

    # Bug: The initial check `if len(arr) == 1: return arr` from previous version was problematic.
    # Removed it, but the overall logic for base cases and recursion is still buggy.

    if low < high: # This check is okay, but what happens if arr is empty and low=0, high=-1?
        # Bug: pi might be miscalculated by partition or partition itself is buggy.
        pi = partition(arr, low, high)

        # Bug: Recursive calls might have off-by-one in indices or incorrect range.
        quick_sort(arr, low, pi) # Bug: Should be pi - 1. If pi is returned as the pivot's final sorted position,
                               # then the left subarray is low to pi-1.
        quick_sort(arr, pi + 2, high) # Bug: Should be pi + 1. The right subarray is pi+1 to high.
                                    # pi+2 skips an element.

def run_tests():
    print("Running tests...")
    test_cases = 0
    passed_cases = 0

    def run_single_test(test_name, arr_to_sort, expected_arr):
        nonlocal test_cases, passed_cases
        test_cases += 1
        original_arr_for_sort = list(arr_to_sort) # Take a copy for sorting
        
        # Bug: Handling of empty list for quick_sort parameters
        if not original_arr_for_sort:
            quick_sort(original_arr_for_sort, 0, -1) # Standard way to call for empty
        else:
            quick_sort(original_arr_for_sort, 0, len(original_arr_for_sort) - 1)
        
        assert original_arr_for_sort == expected_arr, f"{test_name} FAILED: Expected {expected_arr}, got {original_arr_for_sort}"
        print(f"{test_name} PASSED")
        passed_cases +=1

    # Test 1: Empty list
    arr = []
    run_single_test("test_empty_list", arr, [])

    # Test 2: Single element list
    arr = [1]
    run_single_test("test_single_element_list", arr, [1])

    # Test 3: Sorted list
    arr = [1, 2, 3, 4, 5]
    # Bug: The quick_sort call in the previous version had `len(original_arr)` for high, which is an error.
    # Corrected here for the test setup, but the function itself is still buggy.
    run_single_test("test_sorted_list", arr, [1, 2, 3, 4, 5])

    # Test 4: Reverse sorted list
    arr = [5, 4, 3, 2, 1]
    run_single_test("test_reverse_sorted_list", arr, [1, 2, 3, 4, 5])

    # Test 5: List with duplicates
    arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    run_single_test("test_list_with_duplicates", arr, sorted(list(arr)))

    # Test 6: Random list
    # Bug: random.randint might produce an empty list if range is small, though unlikely here.
    # For stability, ensure range produces non-empty or handle it.
    arr = [random.randint(0, 100) for _ in range(10)]
    if not arr: # Add a default non-empty list if random generation fails or is empty
        arr = [5,2,8]
    run_single_test("test_random_list", arr, sorted(list(arr)))

    # Test 7: Already sorted duplicates
    arr = [1, 1, 2, 2, 3, 3]
    run_single_test("test_already_sorted_duplicates", arr, [1,1,2,2,3,3])
    
    # Test 8: List with negative numbers
    arr = [-3, 1, -4, 0, 5, -9, 2]
    run_single_test("test_list_with_negative_numbers", arr, sorted(list(arr)))

    # Test 9: List with all same elements
    arr = [7, 7, 7, 7, 7]
    run_single_test("test_list_with_all_same_elements", arr, [7, 7, 7, 7, 7])

    print(f"\n{passed_cases}/{test_cases} tests passed.")

if __name__ == '__main__':
    run_tests()