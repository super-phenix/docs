# Add an availability zone

The console lists an availability zone only after the management API knows which controller to call. That registration is separate from installing the AZ stack, and it is the same whether the AZ runs on the management cluster or somewhere else.

Install the [management plane](../installation/deployment-guide/installing-management/index.md) and the [AZ](../installation/deployment-guide/installing-an-az/index.md) first. Then connect them with the settings below.

## AZ on the management cluster

A hyperconverged AZ on the management cluster is already registered. The system chart defines it under the code **`local`**, with destination `in-cluster`. Install that AZ as `clusters.local`. Do not add a second code for the same cluster.

See [The default local AZ](../installation/deployment-guide/installing-management/index.md#the-default-local-az). Set `local` to `null` there when the management cluster should not host an AZ.

## Add any other AZ

Pick a code, for example `paris-1`. Use that same code as the key under `clusters` when you install the AZ.

### 1. Controller

On the AZ cluster, set the controller name and the secret the API will send. The secret must match the API entry in the next step.

When the API is not running on this cluster, expose the controller so the management cluster can reach it:

```yaml
clusters:
  paris-1:
    systemConfiguration:
      apps:
        superphenix-controller:
          values:
            config:
              azName: "Paris 1"
              http:
                authSecret: "replace-with-a-shared-secret"
            ingress:
              enabled: true
              hosts:
                - host: controller.paris-1.example
                  paths:
                    - path: /
```

Apply this with the same Helm upgrade you use to install the AZ. The controller chart leaves ingress disabled; the in-cluster Service is enough only when the API runs in this cluster.

### 2. API

On the management cluster, add the AZ to the API configuration and upgrade the operator release.

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            azs:
              paris-1:
                name: "Paris 1"
                # URL the API can call. Use the controller Service URL when both
                # run in one cluster; otherwise use the ingress hostname.
                controllerUrl: "https://controller.paris-1.example"
                authSecret: "replace-with-a-shared-secret"
                # Cluster name, from `.clusters` in the superphenix-operator chart.
                destination: "paris-1"
            productsConfig:
              argoApp:
                kubernetes:
                  azDomains:
                    paris-1:
                      # Host the in-cluster API proxy uses to reach control planes.
                      internal: console.example.org
                      # "%s" is replaced by the Kubernetes cluster ID.
                      external: "%s.console.example.org"
```

| Field | Role |
|-------|------|
| `name` | Name shown in the console. |
| `controllerUrl` | Base URL of that AZ's Superphenix controller. |
| `authSecret` | Shared with `apps.superphenix-controller.values.config.http.authSecret` on that AZ. |
| `destination` | Argo CD cluster that receives this AZ's applications. |
| `logoUrl` | Optional logo for the console. |
| `whitelist` | Optional list of organization IDs allowed to see this AZ. Empty means every organization. [Private availability zones](management/private-azs.md) details how to add whitelisted organizations. |
| `azDomains.<code>.internal` | Host used inside the cluster to reach Kubernetes control planes for this AZ. |
| `azDomains.<code>.external` | Public control-plane hostname template. `%s` is the cluster ID. |

Upgrade the operator release as described in [Applying configuration changes](applying-configuration-changes.md#apply-a-change).

The AZ appears in the console once the API can reach the controller. Open it from [Accessing Superphenix](accessing-superphenix.md).
