# superphenix-api

Values and chart documentation for `components/system/superphenix-api` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

Helm chart to deploy the Superphenix API

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| autoscaling.enabled | bool | `false` |  |
| autoscaling.maxReplicas | int | `100` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| autoscaling.targetMemoryUtilizationPercentage | int | `80` |  |
| config | object | `{}` |  |
| containerPorts.adminHttp | int | `7000` |  |
| containerPorts.http | int | `8080` |  |
| containerPorts.metrics | int | `9090` |  |
| domain | string | `"api.superphenix.net"` | Domain on which the API is exposed |
| fullnameOverride | string | `""` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/super-phenix/superphenix-api"` |  |
| image.tag | string | `""` |  |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations."cert-manager.io/cluster-issuer" | string | `"letsencrypt"` |  |
| ingress.className | string | `""` |  |
| ingress.enabled | bool | `true` |  |
| ingress.hosts[0].host | string | `"api.superphenix.net"` |  |
| ingress.hosts[0].paths[0].path | string | `"/"` |  |
| ingress.tls[0].hosts[0] | string | `"api.superphenix.net"` |  |
| ingress.tls[0].secretName | string | `"superphenix-api-tls"` |  |
| nameOverride | string | `""` |  |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| revisionHistoryLimit | int | `3` |  |
| securityContext | object | `{}` |  |
| service.port | int | `80` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
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
| tolerations | list | `[]` |  |
