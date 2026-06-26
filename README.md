# Superphenix documentation

Documentation and user guides for [Superphenix](https://docs.superphenix.net), built with [Zensical](https://zensical.org/).

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate # or .venv\Scripts\activate on Windows
pip install zensical
zensical build -f zensical.toml
zensical serve -f zensical.toml # serve at http://localhost:8000
```

## Configuration

The website is configured using the `zensical.toml` configuration file.
