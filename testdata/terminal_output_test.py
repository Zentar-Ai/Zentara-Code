import os
import time

print("Hello DAP from terminal_output_test.py")
os.system("echo 'Hello Terminal from terminal_output_test.py'")
print("Script print after terminal command.")
# Add a small delay to ensure terminal output has a chance to be processed
time.sleep(0.5) 
print("terminal_output_test.py finished.")