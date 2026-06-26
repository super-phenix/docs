# Installing management

This section covers the **management cluster**: where to place it, how the Superphenix operator is installed, and how you configure the management stack.

Part of the [deployment guide](deployment-guide.md). Choose your placement model first:

- **[Installing inside an AZ](management-inside-az.md)**: management runs on a workload cluster.
- **[Installing outside an AZ](management-outside-az.md)**: management runs on a dedicated cluster.

Once placement is decided and the management cluster exists, continue on this page for operator installation.

## How the installation process works

Superphenix is installed through an operator running on the management cluster.
The operator handles installation of the Superphenix clusters based on the configuration provided in the `Cluster` resource.

The management stack is installed on the management cluster by the operator, providing:

- The Superphenix web console
- The ArgoCD instance used to synchronize the Superphenix system
- The talos-operator used to manage physical nodes (optional)

The operator handles the installations, upgrades, and lifecycle management of Superphenix clusters entirely.

## How to install the operator

Installation of the operator is typically done via Helm on your chosen management cluster:

```bash
helm upgrade --install superphenix-operator \
  ghcr.io/super-phenix/charts/superphenix-operator \
  --namespace superphenix-system \
  --create-namespace
```

Placement-specific prerequisites:

- **Inside an AZ**: the cluster must already be a Talos Linux cluster. See [Installing inside an AZ](management-inside-az.md) and [Manual OS installation](manual-os-installation.md).
- **Outside an AZ**: any reachable Kubernetes cluster works. See [Installing outside an AZ](management-outside-az.md).

## How to configure the management

The management cluster itself requires configuration to host the web console and ArgoCD components. This is managed via the `Management` resource (or via the system chart values).

*Coming soon: detailed management stack configuration.*

## Next steps

- [Installing clusters](installing-clusters.md): define `Cluster` resources and connect workload AZs.
- [Automated OS installation](automated-os-installation.md): provision physical servers through the operator.
