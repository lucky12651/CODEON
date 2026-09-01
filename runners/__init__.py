from codeon.runners.c_runner import run_c
from codeon.runners.cpp_runner import run_cpp
from codeon.runners.java_runner import run_java
from codeon.runners.process import RunResult
from codeon.runners.python_runner import run_python

_RUNNERS = {
    "python": run_python,
    "java": run_java,
    "cpp": run_cpp,
    "c": run_c,
}

SUPPORTED_LANGUAGES = tuple(_RUNNERS)


def run_code(language: str, code: str, stdin: str = "") -> RunResult:
    runner = _RUNNERS[language]
    return runner(code, stdin)
