# Installing hyperconverged

In a **hyperconverged** AZ, **storage** and **virtualization** run on the same Kubernetes cluster. Compute and storage share the same nodes. This is the simplest model and fits single-AZ deployments, labs, and proofs of concept.

Part of the [deployment guide](deployment-guide.md). For separate storage and compute tiers, see [Installing decoupled](installing-decoupled.md).

## When to choose hyperconverged

- **Single AZ** or **first deployment**: minimal footprint and operational complexity.
- **Horizontal growth**: add servers to grow both storage and compute together.
- **Cost**: hardware is mutualized across storage and virtualization roles.

See [Deployment topology](../architecture/deployment-topology.md) for trade-offs versus decoupled layouts.

## Prerequisites

- A Talos Linux cluster bootstrapped on your nodes ([Manual OS installation](manual-os-installation.md) or [Automated OS installation](automated-os-installation.md)).
- The [management plane installed](installing-management.md) and able to reach the cluster API.
- Hardware sized for **combined** Ceph and hypervisor needs. See [Hardware requirements](../architecture/deployment-requirements.md).

## Installation overview

1. Provision Kubernetes on your AZ nodes (Talos).
2. Register the AZ with a `Cluster` resource using `deploymentTopology: Hyperconverged`.
3. Let the operator sync the Superphenix stack on that cluster.

## Example `Cluster` resource

```yaml
apiVersion: superphenix.net/v1alpha1
kind: Cluster
metadata:
  name: az-local
  namespace: superphenix-system
spec:
  deploymentTopology: Hyperconverged
  region: europe-west
  availabilityZone: paris-1
  connection:
    mode: Remote
    url: https://api.paris-1.superphenix.net:6443
    secretRef:
      name: cluster-paris-1-credentials
      namespace: superphenix-system
  version: v0.1.0
  repoURL: https://charts.superphenix.net
  chartName: superphenix-stack
```

Set `connection.mode: Local` when the operator runs on the same cluster as the AZ.

See [Configure a cluster](configuring-a-cluster.md) for the full field reference.

## Related

- [Installing an AZ](installing-an-az.md): overview of AZ installation paths.
- [Deployment topology](../architecture/deployment-topology.md): fully integrated vs other deployment types.
