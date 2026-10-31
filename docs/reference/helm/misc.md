# misc

Values for `components/dependencies/misc` in the [Superphenix repository](https://github.com/super-phenix/superphenix). The chart deploys arbitrary YAML objects. superphenix-system passes `effectiveMode` so each object can be limited to a cluster mode.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `effectiveMode` | string | `""` | Effective mode of the cluster. Used to filter objects. |
| `modes` | object | `{}` | Map of object names to a list of modes. An object listed here is deployed only when `effectiveMode` is in its list. |
| `objects` | object | `{}` | YAML objects to deploy, keyed by name. The chart templates each object before applying it. |

```yaml
objects:
  my-configmap:
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: my-configmap
    data:
      key: "{{ .Release.Name }}"
```
