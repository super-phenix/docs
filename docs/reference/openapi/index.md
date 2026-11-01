# OpenAPI

HTTP APIs for the Superphenix management plane. Each page loads the Swagger 2.0 document generated for that service.

| Service | Spec source | Role |
|---------|-------------|------|
| [superphenix-api](superphenix-api.md) | `internal/superphenix-api/api/docs.go` | Public and admin API used by the console and API clients. Base path `/api`. |
| [superphenix-controller](superphenix-controller.md) | `internal/superphenix-controller/api/docs.go` | Per-AZ controller API. Base path `/`. |

The documents in this site are copied from the [Superphenix repository](https://github.com/super-phenix/superphenix). Refresh them from a local checkout with:

```bash
python3 scripts/sync-openapi.py
```

The script reads `../superphenix` by default. Set `SUPERPHENIX_ROOT` when the product checkout lives somewhere else.
