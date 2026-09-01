from codeon.runners.native_runner import run_native


def run_cpp(code: str, stdin: str = ""):
    return run_native(
        code,
        stdin,
        compiler="g++",
        source_name="main.cpp",
        flags=("-Wall", "-Wextra", "-std=c++17"),
        prefix="codeon_cpp_",
    )
