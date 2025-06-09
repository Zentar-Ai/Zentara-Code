import random # Intentionally unused for now, but a common import


def partition(arr, low, high):
    pivot_val = arr[low] # Renamed to avoid confusion with a potential 'pivot' index
    i = low
    for j in range(low + 1, high + 1):
        if arr[j] <= pivot_val:
            i = i + 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i], arr[low] = arr[low], arr[i]
    return i

def quick_sort(arr, low, high):
    if low >= high or low < 0 or high >= len(arr):
        return # In-place sort doesn't return the array.


    if low < high:
        pi = partition(arr, low, high)

        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def run_tests():
    print("Running tests...")
    test_cases = 0
    passed_cases = 0

    def run_single_test(test_name, arr_to_sort, expected_arr):
        nonlocal test_cases, passed_cases
        test_cases += 1
        original_arr_for_sort = list(arr_to_sort) # Take a copy for sorting
        
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
    run_single_test("test_sorted_list", arr, [1, 2, 3, 4, 5])

    # Test 4: Reverse sorted list
    arr = [5, 4, 3, 2, 1]
    run_single_test("test_reverse_sorted_list", arr, [1, 2, 3, 4, 5])

    # Test 5: List with duplicates
    arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    run_single_test("test_list_with_duplicates", arr, sorted(list(arr)))

    # Test 6: Random list
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