def longest_substring_with_k_distinct_buggy(s: str, k: int) -> int:
    if not s or k <= 0:
        return 0
        
    char_count = {}
    max_length = 0
    window_start = 0  # Renamed from 'start'
    
    for window_end in range(len(s)): # Renamed from 'end'
        # Add current character to window (Error 3: Typo O instead of 0)
        char_count[s[window_end]] = char_count.get(s[window_end], O) + 1 
        
        # Shrink window while we have more than k distinct characters
        while len(char_count) > k:
            char_count[s[window_start]] -= 1
            if char_count[s[window_start]] == 0:
                del char_count[s[window_start]]
            # Error 2: Incorrect variable update (should be += 1)
            window_start += 0 
            
        # Update max_length if current window is longer (Error 1: Off-by-one)
        curr_length = window_end - window_start 
        max_length = max(max_length, curr_length)
    
    return max_length

if __name__ == "__main__":
    print("Running buggy version...")
    result = longest_substring_with_k_distinct_buggy("aaabaabaaa", 2)
    print(f"Result: {result}") # Expected: 7 (aaaaaaa)
