import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "codeon-dev")
    JSON_SORT_KEYS = False
    MAX_CONTENT_LENGTH = 1 * 1024 * 1024
    COMPILE_TIMEOUT = int(os.environ.get("CODEON_COMPILE_TIMEOUT", "10"))
    RUN_TIMEOUT = int(os.environ.get("CODEON_RUN_TIMEOUT", "5"))
