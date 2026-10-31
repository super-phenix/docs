# superphenix-controller

Values and chart documentation for `components/system/superphenix-controller` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

Helm chart to deploy the Superphenix AZ controller

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| fullnameOverride | string | `""` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/super-phenix/superphenix-controller"` |  |
| image.tag | string | `""` |  |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations | object | `{}` |  |
| ingress.enabled | bool | `false` |  |
| ingress.tls | list | `[]` |  |
| livenessProbe.httpGet.path | string | `"/health"` |  |
| livenessProbe.httpGet.port | string | `"http"` |  |
| nameOverride | string | `""` |  |
| networkPolicy.allowedFrom | list | `[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"superphenix-api"}}}]` | Peers allowed to call the controller API port. Add the ingress controller namespace when remote AZs use `ingress`. |
| networkPolicy.enabled | bool | `false` | Restrict ingress to the controller. Disabled by default: validate it on your CNI first (kubelet probes, remote AZs reaching the controller through the Ingress). |
| networkPolicy.metricsFrom | list | `[]` | Peers allowed to scrape metrics. Empty means any source. |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` |  |
| podLabels | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| readinessProbe.httpGet.path | string | `"/health"` |  |
| readinessProbe.httpGet.port | string | `"http"` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| revisionHistoryLimit | int | `3` |  |
| securityContext | object | `{}` |  |
| service.port | int | `8080` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.automount | bool | `true` |  |
| serviceAccount.create | bool | `true` |  |
| serviceAccount.name | string | `""` |  |
| serviceMonitor.bearerTokenFile | string | `""` |  |
| serviceMonitor.enabled | bool | `true` |  |
| serviceMonitor.interval | string | `"15s"` |  |
| serviceMonitor.metricRelabelings | list | `[]` |  |
| serviceMonitor.portName | string | `"metrics"` |  |
| serviceMonitor.relabelings | list | `[]` |  |
| serviceMonitor.scheme | string | `""` |  |
| serviceMonitor.tlsConfig | object | `{}` |  |
| config | object | `{}` |  |
| tolerations | list | `[]` |  |
