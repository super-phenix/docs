# Cluster

A **Cluster** is one Superphenix Kubernetes cluster. The operator uses it to connect to that cluster and to install the Superphenix stack on it.

| | |
|--|--|
| **Group** | `operator.superphenix.net` |
| **Version** | `v1alpha1` |
| **Kind** | `Cluster` |
| **Plural** | `clusters` |
| **Scope** | Namespaced |

An install example is in [Configure a cluster](../../installation/deployment-guide/installing-an-az/configuring-a-cluster.md). Talos provisioning values passed through `spec.talosManagerConfiguration` are documented on the [talos-manager chart](../helm/talos-manager.md). Values passed through `spec.systemConfiguration` are the [superphenix-system chart](../helm/superphenix-system.md).

## Spec

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `deploymentTopology` | string | No | | `Hyperconverged` or `Decoupled`. Leave it empty only for a management cluster. |
| `type` | string | Conditional | | `Storage`, `Workload`, or `Management`. See the rules below. |
| `talosManagementMode` | string | No | `Unmanaged` | How Talos is managed. `Unmanaged`, `Import`, or `Full`. |
| `talosManagerConfiguration` | object | No | | Arbitrary YAML passed to the talos-manager chart. |
| `region` | string | Yes | | Geographic region. At least one character. |
| `availabilityZone` | string | Yes | | Availability zone identifier within the region. At least one character. |
| `systemConfiguration` | object | No | | Arbitrary YAML passed to the superphenix-system chart. |
| `systemLocation` | object | No | | Override for where the system chart is loaded. See below. |
| `version` | string | No | Controller default | Superphenix version for this cluster. Must be a semantic version, with an optional `v` prefix. |
| `connection` | object | Yes | | How the operator reaches the cluster. See below. |
| `lifecycle` | object | No | | Pause, manual sync, and deletion behavior. See below. |

### Topology rules

- When `deploymentTopology` is empty, `type` must be `Management`.
- When `deploymentTopology` is `Decoupled`, `type` must be `Storage` or `Workload`.
- `Hyperconverged` runs storage and workload on the same cluster. `Decoupled` splits them. `Management` is the cluster that runs the operator, and it has no deployment topology.

### `talosManagementMode`

| Value | Meaning |
|-------|---------|
| `Unmanaged` | Talos is installed and configured outside the operator. |
| `Import` | The operator imports a Talos cluster that is already installed and then manages its configuration. |
| `Full` | The operator installs and configures Talos. |

### `systemLocation`

| Field | Type | Description |
|-------|------|-------------|
| `repoURL` | string | Repository that hosts the superphenix-system chart. Empty uses the controller default. |
| `chartName` | string | Chart name. Empty uses the controller default. |

### `connection`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `mode` | string | Yes | `Local` | `Remote` or `Local`. |
| `url` | string | When `mode` is `Remote` | | API server address of the remote cluster. Ignored when `mode` is `Local`. |
| `secretRef.name` | string | When `secretRef` is set | | Name of the Secret that holds the connection credentials. |
| `secretRef.namespace` | string | No | Cluster namespace | Namespace of that Secret. |

`Local` means the cluster is the one where the operator is running. `Remote` connects with `url` and `secretRef`.

### `lifecycle`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `pause` | boolean | `false` | Pause synchronization. The operator adds an Argo CD sync window so automated and manual sync both stop. |
| `manual` | boolean | `false` | Disable autosync of every application on this cluster by passing `forceManual` to the system chart. |
| `cleanupOnDeletion` | boolean | `false` | On delete, cascade-delete applications on the target cluster. Turn this on only when a deletion is planned. |

## Status

| Field | Type | Description |
|-------|------|-------------|
| `phase` | string | `Deployed`, `Deploying`, `OutOfSync`, `Error`, `Paused`, or `Unknown`. |
| `superphenixVersion` | string | Superphenix version currently running on the cluster. |
| `kubernetesVersion` | string | Kubernetes version of the cluster. |
| `nodeCount` | integer | Number of nodes. |
| `apps` | map | Applications deployed by the cluster's root app-of-apps, keyed by application name. |
| `apps.<name>.name` | string | Application name. |
| `apps.<name>.status` | string | Health, such as `Healthy`, `Degraded`, or `Progressing`. |
| `apps.<name>.lastRefresh` | time | Last time Argo CD reconciled the application against its source. |
| `apps.<name>.lastSync` | time | Last time a sync of that application completed. |
| `apps.<name>.version` | string | Target revision of the application source. |
| `cephClusters` | map | Ceph clusters running on this cluster, keyed by FSID. The value is an unstructured object. |
| `conditions` | list | Standard Kubernetes conditions. Types are listed below. |
| `observedGeneration` | integer | Generation most recently observed. |
| `lastSync` | time | Last time a sync was performed on the cluster. |
| `pxeSetupDone` | list of strings | Hostnames already set up for PXE when `talosManagementMode` is `Full`. |

`kubectl get clusters` prints topology, type, region, AZ, Superphenix version, Kubernetes version, node count, phase, and age.

### Conditions

| Type | Reasons |
|------|---------|
| `Reachable` | `ConnectionSuccess`, `ConnectionFailed`, `SecretNotFound`, `InvalidSecret`, `ConnectionConfigError` |
| `CompatibleVersion` | `CompatibleVersion`, `IncompatibleVersion`. `InvalidVersion` is used when a requested version change is invalid. |
| `ArgoCDSynced` | `ArgoCDSynced`, `ArgoCDOutOfSync`, `ArgoCDSyncFailed`, `ArgoCDUnknown`, `ArgoCDSyncing` |
| `Ready` | `ReconcileSuccess`, `HealthCheckFailed`, `ApplicationReconcileFailed`, `AppProjectReconcileFailed`, `ConfigMapReconcileFailed`, `ConfigMapCleanupFailed`, `Deleting` |
| `Paused` | `Paused`, `Resumed` |

## Example

```yaml
apiVersion: operator.superphenix.net/v1alpha1
kind: Cluster
metadata:
  name: az-paris-1
  namespace: superphenix-system
spec:
  deploymentTopology: Decoupled
  type: Workload
  region: europe-west
  availabilityZone: paris-1
  connection:
    mode: Remote
    url: https://api.paris-1.example.net:6443
    secretRef:
      name: cluster-paris-1-credentials
  version: v0.1.0
  lifecycle:
    pause: false
    manual: false
    cleanupOnDeletion: false
  talosManagementMode: Unmanaged
```
