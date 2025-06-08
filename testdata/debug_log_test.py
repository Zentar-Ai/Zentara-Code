import logging
import sys

# Configure logging. By default, this goes to stderr.
# The debug adapter should route this to the DEBUG CONSOLE.
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def function_one():
    print("Output from function_one (should appear in TERMINAL)")
    sys.stderr.write("Direct stderr write from function_one (should be in DEBUG CONSOLE)\n")
    logging.debug("Debug message from function_one")
    logging.info("Info message from function_one")
    return "Result from function_one"

def function_two(param):
    print(f"Output from function_two with param: {param} (should appear in TERMINAL)")
    sys.stderr.write(f"Direct stderr write from function_two with param: {param} (should be in DEBUG CONSOLE)\n")
    logging.warning(f"Warning message from function_two with param: {param}")
    return f"Result from function_two with {param}"

def main():
    print("Starting main function (should appear in TERMINAL)")
    sys.stderr.write("Direct stderr write from main (start) (should be in DEBUG CONSOLE)\n")
    logging.info("Main function started")

    result1 = function_one()
    logging.debug(f"Result1: {result1}")

    result2 = function_two("test_param")
    logging.debug(f"Result2: {result2}")

    print("Main function finished (should appear in TERMINAL)")
    sys.stderr.write("Direct stderr write from main (end) (should be in DEBUG CONSOLE)\n")
    logging.info("Main function finished")

if __name__ == "__main__":
    main()