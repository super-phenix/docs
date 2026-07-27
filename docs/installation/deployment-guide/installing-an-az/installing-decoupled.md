# Installing decoupled

In a **decoupled** AZ layout, **storage** and **workload** run on **separate** Superphenix clusters. Dedicated storage clusters can serve one or more workload clusters. This model fits performance-sensitive workloads, shared storage across AZs, and production multi-tier designs.

## When to choose decoupled

- **Performance**: dedicated hardware for Ceph and hypervisor tiers without resource contention.
- **Shared storage**: multiple workload AZs consume the same storage backend.
- **Multi-AZ at scale**: pairs with a [management plane on a dedicated management cluster](../installing-management/management-outside-az.md).

See [Deployment topology](../../../architecture/deployment-topology.md) for the fully decoupled deployment type and support status.

## Prerequisites

- Talos clusters for **storage** and **workload** tiers ([Manual OS installation](../installing-the-os/manual-os-installation.md) or [Automated OS installation](../installing-the-os/automated-os-installation.md)).
- The [management plane installed](../installing-management/index.md) with Kubernetes API access to every cluster.
- Hardware sized **per role**. See [Hardware requirements](../../../architecture/deployment-requirements.md).

## Installation overview

1. Provision a **storage** cluster and one or more **workload** clusters.
2. Register each with a `Cluster` resource (`deploymentTopology: Decoupled`, with `type: Storage` or `type: Virtualization`).
3. [Add a storage class to the workload cluster](../../../operations/add-a-storage-class.md#adding-a-block-storage-class).
4. Let the operator sync the Superphenix stack on each cluster.

## Installing a workload and storage cluster

To install the storage and workload cluster, upgrade the release with the chart `clusters:` values. The example below adds two new decoupled clusters in the same availability zone: one `Storage` cluster and one `Virtualization` (workload) cluster.

```yaml
clusters:
  spx-us-west01-storage:
    deploymentTopology: Decoupled
    type: Storage
    region: us-west-1
    availabilityZone: west01
    version: v0.1.0
    connection:
      mode: Remote
      url: https://[STORAGE CLUSTER API ENDPOINT]:6443
      # Any of the following option is valid to connect to the cluster
      credentials:
        bearerToken: ""
        caData: ""
        certData: ""
        keyData: ""
        username: ""
        password: ""
        insecure: false
        serverName: ""
    pauseSync: false
    manual: false

  spx-us-west01-workload:
    deploymentTopology: Decoupled
    type: Virtualization
    region: us-west-1
    availabilityZone: west01
    version: v0.1.0
    connection:
      mode: Remote
      url: https://[WORKLOAD CLUSTER API ENDPOINT]:6443
      # Any of the following option is valid to connect to the cluster
      credentials:
        bearerToken: ""
        caData: ""
        certData: ""
        keyData: ""
        username: ""
        password: ""
        insecure: false
        serverName: ""
    pauseSync: false
    manual: false
```


```bash
helm upgrade superphenix-operator \
  ghcr.io/super-phenix/charts/superphenix-operator \
  --namespace superphenix-system \
  -f spx-clusters-values.yaml
```

You can monitor the status of the `Cluster` CR to check how far along the installion is.

You'll then need to [add a storage class to the workload cluster](../../../operations/add-a-storage-class.md#adding-a-block-storage-class).