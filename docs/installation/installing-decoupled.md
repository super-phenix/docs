# Installing decoupled

In a **decoupled** AZ layout, **storage** and **workload** run on **separate** Kubernetes clusters. Dedicated storage clusters can serve one or more workload clusters. This model fits performance-sensitive workloads, shared storage across AZs, and production multi-tier designs.

Part of the [deployment guide](deployment-guide.md). For storage and compute on the same nodes, see [Installing hyperconverged](installing-hyperconverged.md).

## When to choose decoupled

- **Performance**: dedicated hardware for Ceph and hypervisor tiers without resource contention.
- **Shared storage**: multiple workload AZs consume the same storage backend.
- **Multi-AZ at scale**: pairs with a [management plane on a dedicated management cluster](management-outside-az.md).

See [Deployment topology](../architecture/deployment-topology.md) for the fully decoupled deployment type and support status.

## Prerequisites

- Talos clusters for **storage** and **workload** tiers ([Manual OS installation](manual-os-installation.md) or [Automated OS installation](automated-os-installation.md)).
- The [management plane installed](installing-management.md) with API access to every cluster.
- Hardware sized **per role**. See [Hardware requirements](../architecture/deployment-requirements.md).

!!! warning "Supported deployment types"
    Currently, the only **supported and tested** installation method is **fully decoupled** (decoupled AZs with the management plane on a dedicated management cluster outside the AZ). See [Deployment topology](../architecture/deployment-topology.md).

## Installation overview

1. Provision a **storage** cluster and one or more **workload** clusters.
2. Register each with a `Cluster` resource (`deploymentTopology: Decoupled`, with `type: Storage` or `type: Virtualization`).
3. [Connect workload clusters to storage backends](connecting-clusters.md).
4. Let the operator sync the Superphenix stack on each cluster.

## Example workload `Cluster` resource

```yaml
apiVersion: superphenix.net/v1alpha1
kind: Cluster
metadata:
  name: az-paris-virt-1
  namespace: superphenix-system
spec:
  deploymentTopology: Decoupled
  type: Virtualization
  region: europe-west
  availabilityZone: paris-1
  connection:
    mode: Remote
    url: https://api.paris-virt-1.superphenix.net:6443
    secretRef:
      name: cluster-paris-virt-1-credentials
      namespace: superphenix-system
  version: v0.1.0
  repoURL: https://charts.superphenix.net
  chartName: superphenix-stack
```

Create a matching `Cluster` for the storage tier with `type: Storage`. See [Configure a cluster](configuring-a-cluster.md) for the full field reference.

## Related

- [Installing an AZ](installing-an-az.md): overview of AZ installation paths.
- [Connecting clusters](connecting-clusters.md): storage and workload integration.
