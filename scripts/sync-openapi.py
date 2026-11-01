#!/usr/bin/env python3
"""Copy Swagger specs from the Superphenix repository into this site.

The product repo stores the specs as swaggo templates in:

- internal/superphenix-api/api/docs.go
- internal/superphenix-controller/api/docs.go

This script renders those templates the same way swag.Spec.ReadDoc does and
writes JSON the docs site can load. Point SUPERPHENIX_ROOT at a checkout when
the product repo is not the sibling directory ../superphenix.
"""

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(os.environ.get("SUPERPHENIX_ROOT", ROOT.parent / "superphenix"))
OUTPUT = ROOT / "docs" / "assets" / "openapi"

SPECS = {
    "superphenix-api": SOURCE / "internal" / "superphenix-api" / "api" / "docs.go",
    "superphenix-controller": SOURCE
    / "internal"
    / "superphenix-controller"
    / "api"
    / "docs.go",
}


def render(path: Path) -> dict:
    text = path.read_text()
    start = text.find("const docTemplate = `")
    end = text.find("`\n\n// SwaggerInfo")
    info_match = re.search(r"var SwaggerInfo = &swag\.Spec\{([\s\S]*?)\n\}", text)
    if start < 0 or end < 0 or not info_match:
        raise SystemExit(f"{path} is not a swaggo docs.go file")
    # swag splits the raw string wherever the spec contains a backtick.
    template = text[start + len("const docTemplate = `") : end]
    template = template.replace('` + "`" + `', "`")

    info = {}
    for field in ("Version", "Host", "BasePath", "Title", "Description"):
        found = re.search(rf'{field}:\s+"([^"]*)"', info_match.group(1))
        if not found:
            raise SystemExit(f"{path} is missing SwaggerInfo.{field}")
        info[field] = found.group(1)

    schemes_match = re.search(
        r"Schemes:\s+\[\]string\{([^}]*)\}", info_match.group(1)
    )
    schemes = []
    if schemes_match and schemes_match.group(1).strip():
        schemes = re.findall(r'"([^"]*)"', schemes_match.group(1))

    description = info["Description"].replace("\n", "\\n").replace("\t", "\\t")
    description = description.replace('"', '\\"').replace('\\\\"', '\\\\\\"')

    document = template
    document = document.replace("{{ marshal .Schemes }}", json.dumps(schemes))
    document = document.replace("{{escape .Description}}", description)
    document = document.replace("{{.Title}}", info["Title"])
    document = document.replace("{{.Version}}", info["Version"])
    document = document.replace("{{.Host}}", info["Host"])
    document = document.replace("{{.BasePath}}", info["BasePath"])
    leftovers = [
        marker
        for marker in (
            "{{ marshal .Schemes }}",
            "{{escape .Description}}",
            "{{.Title}}",
            "{{.Version}}",
            "{{.Host}}",
            "{{.BasePath}}",
        )
        if marker in document
    ]
    if leftovers:
        raise SystemExit(f"{path} still contains {', '.join(leftovers)}")
    return json.loads(document)


def main() -> None:
    if not SOURCE.is_dir():
        raise SystemExit(
            f"Superphenix checkout not found at {SOURCE}. "
            "Set SUPERPHENIX_ROOT to the product repository."
        )
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, path in SPECS.items():
        if not path.is_file():
            raise SystemExit(f"Missing swagger source {path}")
        spec = render(path)
        # The docs site does not publish the support contact from the spec.
        spec.get("info", {}).pop("contact", None)
        destination = OUTPUT / f"{name}.json"
        destination.write_text(json.dumps(spec, indent=2) + "\n")
        paths = len(spec.get("paths", {}))
        print(f"{destination.relative_to(ROOT)}: {spec['info']['title']} ({paths} paths)")


if __name__ == "__main__":
    try:
        main()
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Rendered swagger is not valid JSON: {exc}") from exc
