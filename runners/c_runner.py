from .native_runner import run_native


def run_c(code: str, stdin: str = ""):
    return run_native(
        code,
        stdin,
        compiler="gcc",
        source_name="main.c",
        flags=("-Wall", "-Wextra", "-std=c11"),
        prefix="codeon_c_",
    )
