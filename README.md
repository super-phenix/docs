# Superphenix documentation

Documentation and user guides for [Superphenix](https://docs.superphenix.net), built with [Zensical](https://zensical.org/).

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install zensical
zensical build -f zensical.toml
zensical serve -f zensical.toml   # serve at http://localhost:8000
```

## Configuration

- **Zensical** (primary): `zensical.toml` — theme variant `classic` for Material for MkDocs–compatible look.
- **MkDocs** (legacy): `mkdocs.yml` is still present; Zensical can read it, but the project uses `zensical.toml` for build and CI.
