# src/debug_helper/pytest_raise_plugin.py
# This file acts as a pytest plugin, loaded dynamically by the Zentara extension
# when launching pytest in debug mode.

import os
import sys
import pytest

print("_PYTEST_RAISE plugin: File execution started.", file=sys.stderr)
# Check if the environment variable set by the Zentara debugger is active
print(f"_PYTEST_RAISE plugin: Checking _PYTEST_RAISE. Value: {os.getenv('_PYTEST_RAISE', '0')}", file=sys.stderr)
if os.getenv('_PYTEST_RAISE', "0") != "0":
    print("_PYTEST_RAISE plugin: Hooks activated (_PYTEST_RAISE is set).", file=sys.stderr)

    @pytest.hookimpl(tryfirst=True)
    def pytest_exception_interact(node, call, report):
        """Re-raise exceptions from test functions when _PYTEST_RAISE is set."""
        print("_PYTEST_RAISE plugin: Intercepting exception interact hook.", file=sys.stderr)
        if call.excinfo:
            print(f"_PYTEST_RAISE plugin: Re-raising exception: {call.excinfo.type.__name__}", file=sys.stderr)
            raise call.excinfo.value
        return False # Indicate exception was not handled here if no excinfo

    @pytest.hookimpl(tryfirst=True)
    def pytest_internalerror(excinfo):
        """Re-raise internal pytest errors when _PYTEST_RAISE is set."""
        print("_PYTEST_RAISE plugin: Intercepting internal error hook.", file=sys.stderr)
        print(f"_PYTEST_RAISE plugin: Re-raising internal error: {excinfo.type.__name__}", file=sys.stderr)
        raise excinfo.value

    # Optional: Add hook for setup/teardown errors if needed
    # @pytest.hookimpl(tryfirst=True)
    # def pytest_runtest_makereport(item, call):
    #     """
    #     Hook to intercept exceptions during setup/teardown phases.
    #     """
    #     if call.excinfo and (call.when == 'setup' or call.when == 'teardown'):
    #          print(f"_PYTEST_RAISE plugin: Re-raising setup/teardown exception: {call.excinfo.type.__name__}", file=sys.stderr)
    #          raise call.excinfo.value
    #     # Return None to allow other hooks to process the report
    #     return None

else:
    # This branch executes if the plugin is somehow loaded but _PYTEST_RAISE is not set
    print("_PYTEST_RAISE plugin: Loaded but hooks inactive (_PYTEST_RAISE not set).", file=sys.stderr)
