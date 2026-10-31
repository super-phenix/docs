# spx-rook-connection

Values and chart documentation for `components/dependencies/spx-rook-connection` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

A Helm chart to connect a Superphenix K8s cluster to a Superphenix storage cluster

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| clusters | list | `[]` |  |
| mapping | string | `""` |  |
| rookOperatorNamespace | string | `"rook-system"` |  |
