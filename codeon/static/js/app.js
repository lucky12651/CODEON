const LANGS = {
    python: {
        id: "python",
        label: "Python",
        file: "main.py",
        ext: "py",
        mode: "ace/mode/python",
        color: "#5eead4",
        command: "python main.py",
        sample: 'print("Hello, CODEON")\nprint("Python is ready.")\n',
    },
    java: {
        id: "java",
        label: "Java",
        file: "Main.java",
        ext: "java",
        mode: "ace/mode/java",
        color: "#fbbf24",
        command: "javac Main.java && java Main",
        sample:
            "public class Main {\n" +
            "    public static void main(String[] args) {\n" +
            '        System.out.println("Hello, CODEON");\n' +
            "    }\n" +
            "}\n",
    },
    cpp: {
        id: "cpp",
        label: "C++",
        file: "main.cpp",
        ext: "cpp",
        mode: "ace/mode/c_cpp",
        color: "#7dd3fc",
        command: "g++ main.cpp -o main && ./main",
        sample:
            "#include <iostream>\n" +
            "using namespace std;\n\n" +
            "int main() {\n" +
            '    cout << "Hello, CODEON" << endl;\n' +
            "    return 0;\n" +
            "}\n",
    },
    c: {
        id: "c",
        label: "C",
        file: "main.c",
        ext: "c",
        mode: "ace/mode/c_cpp",
        color: "#a5b4fc",
        command: "gcc main.c -o main && ./main",
        sample:
            "#include <stdio.h>\n\n" +
            "int main() {\n" +
            '    printf("Hello, CODEON\\n");\n' +
            "    return 0;\n" +
            "}\n",
    },
};

const EXT_TO_LANG = {
    py: "python",
    java: "java",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    c: "c",
};

const buffers = {};
let currentLanguage = "python";
let editor;

const $ = (sel) => document.querySelector(sel);

function storageKey(name) {
    return `codeon:${name}`;
}

function toast(message) {
    const host = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.remove(), 2200);
}

function setStatus(text) {
    $("#status-state").textContent = text;
}

function updateCursor() {
    const pos = editor.getCursorPosition();
    $("#status-cursor").textContent = `Ln ${pos.row + 1}, Col ${pos.column + 1}`;
}

function applyLanguageChrome(lang) {
    const meta = LANGS[lang];
    document.documentElement.style.setProperty("--lang", meta.color);
    $("#file-name").textContent = meta.file;
    $("#status-lang").textContent = meta.label;
    document.querySelectorAll(".lang-card").forEach((card) => {
        const on = card.dataset.lang === lang;
        card.classList.toggle("is-active", on);
        card.setAttribute("aria-selected", on ? "true" : "false");
    });
}

function saveBuffer() {
    if (!editor) return;
    buffers[currentLanguage] = editor.getValue();
    try {
        localStorage.setItem(storageKey(`code:${currentLanguage}`), editor.getValue());
        localStorage.setItem(storageKey("lang"), currentLanguage);
    } catch (_) {
        /* ignore quota */
    }
}

function loadBuffer(lang) {
    if (buffers[lang] != null) return buffers[lang];
    try {
        const saved = localStorage.getItem(storageKey(`code:${lang}`));
        if (saved != null) {
            buffers[lang] = saved;
            return saved;
        }
    } catch (_) {
        /* ignore */
    }
    return LANGS[lang].sample;
}

function setLanguage(lang, { code, persist = true } = {}) {
    if (!LANGS[lang]) return;
    if (persist && editor) saveBuffer();
    currentLanguage = lang;
    const meta = LANGS[lang];
    const next = code != null ? code : loadBuffer(lang);
    buffers[lang] = next;
    editor.session.setMode(meta.mode);
    editor.setValue(next, -1);
    editor.clearSelection();
    applyLanguageChrome(lang);
    if (persist) {
        try {
            localStorage.setItem(storageKey("lang"), lang);
        } catch (_) {
            /* ignore */
        }
    }
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (editor) {
        editor.setTheme(theme === "light" ? "ace/theme/chrome" : "ace/theme/one_dark");
    }
    try {
        localStorage.setItem(storageKey("theme"), theme);
    } catch (_) {
        /* ignore */
    }
}

function initEditor() {
    ace.require("ace/ext/language_tools");
    editor = ace.edit("editor");
    editor.setOptions({
        fontSize: "14px",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        showPrintMargin: false,
        tabSize: 4,
        useSoftTabs: true,
        wrap: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        highlightActiveLine: true,
        showFoldWidgets: false,
        scrollPastEnd: 0.3,
    });
    editor.session.setUseWorker(false);
    editor.on("change", saveBuffer);
    editor.selection.on("changeCursor", updateCursor);
    editor.commands.addCommand({
        name: "runCode",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: runCode,
    });
}

function initTheme() {
    let theme = "dark";
    try {
        theme = localStorage.getItem(storageKey("theme")) || "dark";
    } catch (_) {
        /* ignore */
    }
    setTheme(theme);
    $("#theme-toggle").addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        setTheme(next);
    });
}

function initLanguage() {
    let lang = "python";
    try {
        lang = localStorage.getItem(storageKey("lang")) || "python";
    } catch (_) {
        /* ignore */
    }
    if (!LANGS[lang]) lang = "python";
    setLanguage(lang, { persist: false });
    document.querySelectorAll(".lang-card").forEach((card) => {
        card.addEventListener("click", () => setLanguage(card.dataset.lang));
    });
}

function initActions() {
    $("#btn-copy").addEventListener("click", async () => {
        const text = editor.getValue();
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                throw new Error("clipboard unavailable");
            }
            toast("Copied to clipboard");
        } catch (_) {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            ta.remove();
            toast(ok ? "Copied to clipboard" : "Could not copy");
        }
    });

    $("#btn-save").addEventListener("click", () => {
        const meta = LANGS[currentLanguage];
        const blob = new Blob([editor.getValue()], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = meta.file;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
        toast(`Saved ${meta.file}`);
    });

    $("#btn-import").addEventListener("click", () => $("#file-input").click());
    $("#file-input").addEventListener("change", (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const ext = file.name.split(".").pop().toLowerCase();
            const lang = EXT_TO_LANG[ext] || currentLanguage;
            setLanguage(lang, { code: String(reader.result ?? "") });
            toast(`Opened ${file.name}`);
        };
        reader.readAsText(file);
        event.target.value = "";
    });

    $("#btn-clear").addEventListener("click", () => {
        const output = $("#output");
        output.className = "output is-empty";
        output.textContent = "Console cleared.\nHit Run or press Ctrl+Enter.";
        setStatus("Ready");
    });

    $("#run-btn").addEventListener("click", runCode);
}

function initSplit() {
    const gutter = $("#gutter");
    const workspace = document.querySelector(".workspace");
    let dragging = false;

    const onMove = (event) => {
        if (!dragging) return;
        if (window.innerWidth <= 860) return;
        const rect = workspace.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const pct = Math.min(78, Math.max(38, (x / rect.width) * 100));
        workspace.style.gridTemplateColumns = `minmax(0, ${pct}%) 10px minmax(240px, 1fr)`;
        editor.resize();
    };

    const stop = () => {
        dragging = false;
        gutter.classList.remove("is-dragging");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    };

    gutter.addEventListener("pointerdown", (event) => {
        dragging = true;
        gutter.classList.add("is-dragging");
        gutter.setPointerCapture(event.pointerId);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    });
    gutter.addEventListener("pointermove", onMove);
    gutter.addEventListener("pointerup", stop);
    gutter.addEventListener("pointercancel", stop);
    window.addEventListener("resize", () => editor && editor.resize());
}

function looksLikeError(text) {
    return /error|traceback|exception|failed/i.test(text);
}

function formatOutput(raw, meta, elapsedMs) {
    const header = `❯ ${meta.command}\n`;
    const body = raw.trimEnd();
    const footer = `\n\n── finished in ${elapsedMs}ms`;
    return header + (body ? `${body}` : "(no output)") + footer;
}

async function runCode() {
    const btn = $("#run-btn");
    if (btn.disabled) return;
    const meta = LANGS[currentLanguage];
    const code = editor.getValue();
    const input = $("#stdin").value;
    const output = $("#output");

    btn.disabled = true;
    btn.classList.add("is-running");
    $(".run-label").textContent = "Running";
    setStatus("Running…");
    output.className = "output";
    output.textContent = `❯ ${meta.command}\nCompiling & executing…`;

    const started = performance.now();
    try {
        const response = await fetch("/api/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, input, language: currentLanguage }),
        });
        const data = await response.json();
        const elapsed = Math.max(1, Math.round(performance.now() - started));
        if (data.error && !data.output) {
            output.className = "output is-error";
            output.textContent = formatOutput(data.error, meta, elapsed);
            setStatus("Failed");
            return;
        }
        let text = data.output ?? "";
        if (typeof text !== "string") text = JSON.stringify(text, null, 2);
        const failed = looksLikeError(text) || Boolean(data.error);
        output.className = failed ? "output is-error" : "output is-ok";
        output.textContent = formatOutput(text, meta, elapsed);
        setStatus(failed ? "Finished with errors" : "Finished");
    } catch (err) {
        output.className = "output is-error";
        output.textContent = `Could not reach the compiler.\n${err.message || err}`;
        setStatus("Offline");
    } finally {
        btn.disabled = false;
        btn.classList.remove("is-running");
        $(".run-label").textContent = "Run";
        editor.resize();
    }
}

function initHotkeyLabel() {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
    $("#status-hint").textContent = isMac ? "⌘ + Enter to run" : "Ctrl + Enter to run";
}

document.addEventListener("DOMContentLoaded", () => {
    initEditor();
    initTheme();
    initLanguage();
    initActions();
    initSplit();
    initHotkeyLabel();
    updateCursor();
    requestAnimationFrame(() => editor.resize());
});
