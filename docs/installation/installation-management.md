# Installation management

This page covers the **management cluster**: how the Superphenix operator is installed, what it provides, and how you configure the management stack.

Part of the [installation guide](full-installations.md). Once the operator is running, continue with [Installing clusters](installing-clusters.md) to define your AZs.

## How the installation process works

Superphenix is installed through an operator running on the management cluster.
The operator handles installation of the Superphenix clusters based on the configuration provided in the `Cluster` resource.

The management stack is installed on the management cluster by the operator, providing:

- The Superphenix web console
- The ArgoCD instance used to synchronize the Superphenix system
- The talos-operator used to manage physical nodes (optional)

The operator handles the installations, upgrades, and lifecycle management of Superphenix clusters entirely.

## How to install the operator

If you're choosing to install the management cluster outside the AZ, you can install the operator on any Kubernetes cluster, as long as it can reach the control plane of the destination clusters.

If you're installing the management cluster on an AZ, the cluster needs to be a pre-existing Talos Linux cluster — see [Manual OS installation](talos-manual-installation.md).

Installation of the operator is typically done via Helm on your chosen management cluster.

```bash
helm upgrade --install superphenix-operator \
  ghcr.io/super-phenix/charts/superphenix-operator \
  --namespace superphenix-system \
  --create-namespace
```

## How to configure the management

The management cluster itself requires configuration to host the web console and ArgoCD components. This is managed via the `Management` resource (or via the system chart values).

*Coming soon: detailed management stack configuration.*

## Next steps

- [Installing clusters](installing-clusters.md) — define `Cluster` resources and connect workload AZs.
- [Automated OS installation](operator-physical-installation.md) — provision physical servers through the operator.
