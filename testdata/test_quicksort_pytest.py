import pytest
import random
from quicksort_buggy_debug import quick_sort, partition # Assuming quicksort_buggy_debug.py is in the same directory or accessible via python path

# Helper function to make a copy and sort, similar to the original script's test setup
def sort_and_test(arr_to_sort):
    if not arr_to_sort:
        # For an empty list, quick_sort is called with (arr, 0, -1)
        # which is a standard way to indicate an empty range.
        quick_sort(arr_to_sort, 0, -1)
    else:
        quick_sort(arr_to_sort, 0, len(arr_to_sort) - 1)
    return arr_to_sort

def test_empty_list():
    arr = []
    assert sort_and_test(list(arr)) == []

def test_single_element_list():
    arr = [1]
    assert sort_and_test(list(arr)) == [1]

def test_sorted_list():
    arr = [1, 2, 3, 4, 5]
    assert sort_and_test(list(arr)) == [1, 2, 3, 4, 5]

def test_reverse_sorted_list():
    arr = [5, 4, 3, 2, 1]
    # raise RuntimeError("Test explicit error")
    assert sort_and_test(list(arr)) == [1, 2, 3, 4, 5]

def test_list_with_duplicates():
    arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    expected = sorted(list(arr))
    assert sort_and_test(list(arr)) == expected

def test_random_list():
    arr = [random.randint(0, 100) for _ in range(10)]
    if not arr: # Ensure list is not empty for consistency if random yields empty
        arr = [5,2,8,1,9,3,7,4,6,0] # Default non-empty list
    expected = sorted(list(arr))
    # Create a copy for sorting, as quick_sort modifies in-place
    arr_copy = list(arr)
    assert sort_and_test(arr_copy) == expected

def test_already_sorted_duplicates():
    arr = [1, 1, 2, 2, 3, 3]
    assert sort_and_test(list(arr)) == [1, 1, 2, 2, 3, 3]

def test_list_with_negative_numbers():
    arr = [-3, 1, -4, 0, 5, -9, 2]
    expected = sorted(list(arr))
    assert sort_and_test(list(arr)) == expected

def test_list_with_all_same_elements():
    arr = [7, 7, 7, 7, 7]
    assert sort_and_test(list(arr)) == [7, 7, 7, 7, 7]

# It might also be useful to test the partition function directly,
# though the primary focus is on quick_sort via pytest.
# Example for partition (optional, can be expanded):
def test_partition_basic():
    arr = [3, 1, 2, 5, 4]
    # pivot_val = arr[0] = 3
    # After partition, elements <= 3 should be to the left of pivot, >3 to the right.
    # Expected: [2, 1, 3, 5, 4] (or similar, pivot 3 ends up at index 2)
    # The partition function returns the index of the pivot after partitioning.
    # We need to call it correctly.
    # Let's make a copy to avoid modifying the original list during assertion setup
    arr_copy = list(arr)
    pivot_index = partition(arr_copy, 0, len(arr_copy) - 1)
    
    # Assert that the pivot element is in its correct sorted position
    # All elements to the left of pivot_index are <= arr_copy[pivot_index]
    # All elements to the right of pivot_index are >= arr_copy[pivot_index]
    pivot_val = arr_copy[pivot_index]
    for i in range(0, pivot_index):
        assert arr_copy[i] <= pivot_val
    for i in range(pivot_index + 1, len(arr_copy)):
        assert arr_copy[i] >= pivot_val
    # This test is a bit more complex due to the nature of partition.
    # For simplicity in the demo, focusing on quick_sort results might be better.
    # For now, let's ensure it runs without error and returns a valid index.
    assert 0 <= pivot_index < len(arr_copy)