from __future__ import annotations

import sys
import tempfile
from pathlib import Path

from codeon.runners.process import RUN_TIMEOUT, RunResult, format_streams, run_command


def run_python(code: str, stdin: str = "") -> RunResult:
    try:
        compile(code, "<python>", "exec")
    except SyntaxError as exc:
        return RunResult(ok=False, output="", error=f"Compilation Error: {exc}")

    with tempfile.TemporaryDirectory(prefix="codeon_py_") as tmp:
        source = Path(tmp) / "main.py"
        source.write_text(code, encoding="utf-8")
        proc = run_command(
            [sys.executable, str(source)],
            stdin=stdin or None,
            cwd=tmp,
            timeout=RUN_TIMEOUT,
        )
        if isinstance(proc, RunResult):
            return proc
        output = format_streams(proc)
        return RunResult(ok=proc.returncode == 0, output=output)
