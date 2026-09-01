from flask import Blueprint, jsonify, request

from codeon.runners import SUPPORTED_LANGUAGES, run_code

bp = Blueprint("execute", __name__, url_prefix="/api")


@bp.post("/run")
def run():
    payload = request.get_json(silent=True) or {}
    language = str(payload.get("language") or "").strip().lower()
    code = payload.get("code") or ""
    stdin = payload.get("input") or ""

    if not str(code).strip():
        return jsonify({"error": "No code provided"}), 400

    if language not in SUPPORTED_LANGUAGES:
        supported = ", ".join(SUPPORTED_LANGUAGES)
        return jsonify({"error": f"Unsupported language. Use: {supported}"}), 400

    result = run_code(language, str(code), str(stdin))
    return jsonify(result.to_response())
