# Configuring KaaS versions

The Kubernetes versions offered by KaaS, and the `sfs-kaas` chart used to deploy each cluster, depend on the **Superphenix version of the AZ** hosting the cluster. AZs of a single deployment can run different Superphenix versions, for example while they are upgraded one at a time, so each AZ gets a configuration compatible with its own version.

This page describes how the management plane selects that configuration and how to maintain it.

## How a configuration is selected

The KaaS configuration is a set of **profiles**, each keyed by the **minimum Superphenix version** it applies to. For every request on an AZ, the API:

1. Reads the Superphenix version of the AZ from its `Cluster` resource (`status.superphenixVersion`) on the management cluster.
2. Selects the profile with the **highest key lower than or equal to** that version. Pre-release tags are ignored (`0.8.0-rc.1` selects the `0.8.0` profile).
3. Uses that profile for the Kubernetes versions offered in the console, the chart of new clusters, the upgrade detection and the kubeconfig endpoint.

With profiles `0.0.0`, `0.7.0` and `0.8.0`:

| AZ version | Selected profile |
| :--- | :--- |
| `0.6.3` | `0.0.0` |
| `0.7.5` | `0.7.0` |
| `0.8.7` | `0.8.0` |
| `0.9.3` | `0.8.0` |

!!! tip "Catch-all profile"
    A `0.0.0` profile applies to every AZ that no other profile covers. Without it, an AZ older than the lowest key gets no configuration.

## Configuring the profiles

Profiles are set in the `superphenix-api` values of the management cluster, under `config.productsConfig.argoApp.kubernetes.versions`. The `versions` map is **required**: the API does not start without at least one valid profile.

```yaml
systemsSettings:
  apps:
    superphenix-api:
      values:
        config:
          productsConfig:
            argoApp:
              kubernetes:
                versions:
                  "0.8.0":
                    repo:
                      repoURL: "ghcr.io/super-phenix/charts"
                      chart: "sfs-kaas"
                      targetRevision: "0.8.0"
                    kubeVersions:
                      - version: "v1.37.0"
                      - version: "v1.36.3"
                  "0.0.0":
                    repo:
                      repoURL: "ghcr.io/super-phenix/charts"
                      chart: "sfs-kaas"
                      targetRevision: "0.6.3"
                    kubeVersions:
                      - version: "v1.36.3"
                      - version: "v1.35.5"
```

| Field | Description |
| :--- | :--- |
| `versions.<key>` | Minimum Superphenix version of the profile, as a semantic version. Quote it in YAML. |
| `repo` | Default `sfs-kaas` chart of the profile (`repoURL`, `chart`, `targetRevision`). |
| `kubeVersions[].version` | Kubernetes version offered for clusters of the profile. At least one is required. |
| `kubeVersions[].repo` | Optional chart replacing `repo` for this Kubernetes version only. |
| `kubeVersions[].fqdn` | Optional, default `true`. Set `false` for versions whose kubeconfig must not be rewritten to the AZ control plane URL. |

### Control plane domains

`sfs-kaas` 0.6.1 and later require an entry per AZ under `azDomains`. Without it, new clusters of that AZ fail to render in Argo CD with `Missing value for this AZ under .azDomains`.

```yaml
config:
  productsConfig:
    argoApp:
      kubernetes:
        azDomains:
          az-paris-1:
            # Host the kube-API proxy uses to reach the control planes, across AZs during disaster recovery
            internal: "azs.paris.example.org"
            # Control plane URL template, %s is replaced by the cluster ID
            external: "%s.kaas.az-paris-1.example.org"
```

## Reading the AZ versions

The API lists the `Cluster` resources (`operator.superphenix.net/v1alpha1`) of the operator namespace and caches them for 30 seconds.

```yaml
config:
  operator:
    namespace: superphenix-system   # required, namespace of the Cluster resources
    kubeconfig: ""                  # empty: in-cluster connection
  azs:
    az-paris-1:
      destination: "az-paris-1"
      clusterName: "az-paris-1"     # optional, name of the AZ Cluster resource
```

The `Cluster` resource of an AZ is, in order:

1. `azs.<az>.clusterName` when set.
2. `azs.<az>.destination` when it is not `in-cluster`.
3. For `in-cluster`, the resource whose `spec.availabilityZone` is the AZ code.

The `superphenix-api` chart grants its ServiceAccount `get`, `list` and `watch` on `clusters` in the operator namespace. When `operator.kubeconfig` points to another account, grant it the same permissions.

## When the configuration cannot be resolved

| Situation | Create, edit, upgrade, kubeconfig, version list | Cluster list and details |
| :--- | :--- | :--- |
| `Cluster` resource missing, without `status.superphenixVersion`, or unreachable | `503`, the reason is in `context.reason` | Shown, without the upgrade status |
| AZ version lower than every profile | `409`, the AZ version is in `context.spxVersion` | Shown, without the upgrade status |

## Upgrading an AZ

Before upgrading an AZ to a Superphenix version that needs a new `sfs-kaas` chart:

1. Add a profile keyed by the new Superphenix version, with its chart and Kubernetes versions. AZs still on older versions keep their current profile.
2. Upgrade the AZ. Once its `Cluster` resource reports the new version, the console offers the new Kubernetes versions for that AZ.
3. Existing clusters keep their chart. Editing a cluster without changing its Kubernetes version never changes its chart. Users move a cluster to the chart of its profile with the **Upgrade** action, or by picking another Kubernetes version.

!!! warning "Version reported during an upgrade"
    `status.superphenixVersion` reflects the version targeted by the AZ. It changes as soon as the upgrade starts, so the new profile applies before the upgrade completes.
