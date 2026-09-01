from __future__ import annotations

import re
import tempfile
from pathlib import Path

from .process import (
    COMPILE_TIMEOUT,
    RUN_TIMEOUT,
    RunResult,
    format_streams,
    missing_binary,
    run_command,
)

CLASS_RE = re.compile(r"\bclass\s+([A-Za-z_]\w*)")


def _prepare_source(code: str) -> tuple[str, str]:
    match = CLASS_RE.search(code)
    if match:
        return match.group(1), code
    wrapped = (
        "public class Main {\n"
        "    public static void main(String[] args) {\n"
        f"{code}\n"
        "    }\n"
        "}\n"
    )
    return "Main", wrapped


def run_java(code: str, stdin: str = "") -> RunResult:
    missing = missing_binary("javac") or missing_binary("java")
    if missing:
        return missing

    class_name, source = _prepare_source(code)
    with tempfile.TemporaryDirectory(prefix="codeon_java_") as tmp:
        tmp_path = Path(tmp)
        source_file = tmp_path / f"{class_name}.java"
        source_file.write_text(source, encoding="utf-8")

        compiled = run_command(
            ["javac", str(source_file)],
            cwd=tmp_path,
            timeout=COMPILE_TIMEOUT,
        )
        if isinstance(compiled, RunResult):
            return compiled
        if compiled.returncode != 0:
            return RunResult(ok=False, output=f"Compilation Error:\n{compiled.stderr}")

        executed = run_command(
            ["java", "-classpath", str(tmp_path), class_name],
            stdin=stdin or None,
            cwd=tmp_path,
            timeout=RUN_TIMEOUT,
        )
        if isinstance(executed, RunResult):
            return executed
        return RunResult(ok=executed.returncode == 0, output=format_streams(executed))
