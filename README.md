# CODEON

Browser-based compiler for Python, Java, C++, and C.

## Setup

```bash
pip install -r requirements.txt
python run.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

C and C++ need `gcc` / `g++` on PATH. Java needs a JDK (`javac` and `java`).

## Layout

```
run.py                      # start the app
app.py                      # Flask factory
config.py
requirements.txt
routes/
  pages.py                  # GET /
  execute.py                # POST /api/run
runners/
  python_runner.py
  java_runner.py
  cpp_runner.py
  c_runner.py
  native_runner.py          # shared gcc/g++ flow
  process.py                # subprocess helpers
templates/index.html
static/
  css/main.css
  js/app.js
  img/mark.jpg
```

## API

`POST /api/run`

```json
{ "language": "python", "code": "print(1)", "input": "" }
```

`language` is one of `python`, `java`, `cpp`, `c`.
