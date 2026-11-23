# superphenix-console

Values and chart documentation for `deployment/superphenix-console` in the [Console-UI repository](https://github.com/super-phenix/console-ui). Defaults are the chart defaults.

Helm chart to deploy the Superphenix console.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| announcement | object | `{}` | Announcement banner configuration. |
| apiUrl | string | `""` | The API domain (without protocol), e.g. "api.superphenix.net" |
| authUrl | string | `"https://login.console.example.org"` | Auth UI base URL |
| config.nginxConf | string | `""` |  |
| config.production | bool | `true` |  |
| config.appName | string | `"Superphenix Console"` |  |
| fullnameOverride | string | `""` |  |
| helpLinks.documentation.icon | string | `"docs"` |  |
| helpLinks.documentation.text | string | `"Documentation"` |  |
| helpLinks.documentation.url | string | `"https://docs.superphenix.net"` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/super-phenix/superphenix-console"` |  |
| image.tag | string | `""` |  |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations | object | `{}` |  |
| ingress.enabled | bool | `false` |  |
| ingress.tls | list | `[]` |  |
| livenessProbe.httpGet.path | string | `"/health"` |  |
| livenessProbe.httpGet.port | string | `"http"` |  |
| nameOverride | string | `""` |  |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` |  |
| podLabels | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| readinessProbe.httpGet.path | string | `"/health"` |  |
| readinessProbe.httpGet.port | string | `"http"` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| securityContext | object | `{}` |  |
| service.port | int | `80` |  |
| service.type | string | `"ClusterIP"` |  |
| sessionAutoRenew | int | `10` |  |
| ssl | bool | `true` |  |
| supportEmail | bool | `"support@example.org"` |  |
| themeOverride | string | `""` |  |
| tolerations | list | `[]` |  |
