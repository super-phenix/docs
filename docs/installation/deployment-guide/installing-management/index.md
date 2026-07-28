# Installing management plane

This section covers the **management cluster**: where to place it, how the Superphenix operator is installed, and how you configure the management stack.

Part of the [deployment guide](../index.md). Choose your placement model first:

- **[Installing inside an AZ](management-inside-az.md)**: management runs on one of your AZ clusters.
- **[Installing outside an AZ](management-outside-az.md)**: management runs on a dedicated cluster.

## How the installation process works

Superphenix is installed through an operator running on the management cluster.
The operator handles installation of the Superphenix clusters based on the configuration provided in the `Cluster` resource.

The management stack is installed on the management cluster by the operator, providing:

- The Superphenix web console
- The ArgoCD instance used to synchronize the Superphenix system
- The talos-operator used to manage physical nodes (optional)

The operator handles the installations, upgrades, and lifecycle management of Superphenix clusters entirely.

## Next steps

- [Installing inside an AZ](management-inside-az.md) or [Installing outside an AZ](management-outside-az.md): install the operator for your chosen placement.
- [Installing an AZ](../installing-an-az/index.md): define `Cluster` resources and deploy your availability zones.
- [Automated OS installation](../installing-the-os/automated-os-installation.md): provision physical servers through the operator.
