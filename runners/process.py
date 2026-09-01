from __future__ import annotations

import os
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

COMPILE_TIMEOUT = 10
RUN_TIMEOUT = 5
EXE_SUFFIX = ".exe" if os.name == "nt" else ""


@dataclass
class RunResult:
    ok: bool
    output: str
    error: str = ""

    def to_response(self) -> dict:
        if self.error and not self.output:
            return {"output": self.error, "error": self.error}
        payload = {"output": self.output}
        if self.error:
            payload["error"] = self.error
        return payload


def missing_binary(name: str) -> RunResult | None:
    if shutil.which(name) is None:
        return RunResult(
            ok=False,
            output="",
            error=f"{name} was not found on PATH. Install it and restart CODEON.",
        )
    return None


def run_command(
    argv: list[str],
    *,
    stdin: str | None = None,
    cwd: str | Path | None = None,
    timeout: int = RUN_TIMEOUT,
) -> subprocess.CompletedProcess | RunResult:
    try:
        env = os.environ.copy()
        env.setdefault("PYTHONIOENCODING", "utf-8")
        env.setdefault("LANG", "en_US.UTF-8")
        return subprocess.run(
            argv,
            input=stdin if stdin else None,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(cwd) if cwd else None,
            env=env,
        )
    except FileNotFoundError:
        return RunResult(ok=False, output="", error=f"Command not found: {argv[0]}")
    except subprocess.TimeoutExpired:
        return RunResult(ok=False, output="", error=f"Timed out after {timeout}s")


def format_streams(proc: subprocess.CompletedProcess) -> str:
    stdout = (proc.stdout or "").rstrip()
    stderr = (proc.stderr or "").rstrip()
    if stderr:
        return f"{stdout}\n\nError Output:\n{stderr}" if stdout else stderr
    return stdout


def compiled_binary(temp_dir: Path, name: str = "program") -> Path:
    return temp_dir / f"{name}{EXE_SUFFIX}"
