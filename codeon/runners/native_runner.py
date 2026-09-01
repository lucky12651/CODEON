from __future__ import annotations

import tempfile
from pathlib import Path

from codeon.runners.process import (
    COMPILE_TIMEOUT,
    RUN_TIMEOUT,
    RunResult,
    compiled_binary,
    format_streams,
    missing_binary,
    run_command,
)


def run_native(
    code: str,
    stdin: str = "",
    *,
    compiler: str,
    source_name: str,
    flags: tuple[str, ...],
    prefix: str,
) -> RunResult:
    missing = missing_binary(compiler)
    if missing:
        return missing

    with tempfile.TemporaryDirectory(prefix=prefix) as tmp:
        tmp_path = Path(tmp)
        source = tmp_path / source_name
        binary = compiled_binary(tmp_path)
        source.write_text(code, encoding="utf-8")

        compiled = run_command(
            [compiler, str(source), "-o", str(binary), *flags],
            cwd=tmp_path,
            timeout=COMPILE_TIMEOUT,
        )
        if isinstance(compiled, RunResult):
            return compiled
        if compiled.returncode != 0:
            return RunResult(ok=False, output=f"Compilation Error:\n{compiled.stderr}")

        executed = run_command(
            [str(binary)],
            stdin=stdin or None,
            cwd=tmp_path,
            timeout=RUN_TIMEOUT,
        )
        if isinstance(executed, RunResult):
            return executed
        return RunResult(ok=executed.returncode == 0, output=format_streams(executed))
