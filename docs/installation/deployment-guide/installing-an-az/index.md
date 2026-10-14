# Installing an AZ

Install an availability zone only after both of these are done:

- The [management plane is installed](../installing-management/index.md).
- The [operating system is installed](../installing-the-os/manual-os-installation.md) on every node that will join the AZ ([automated installation](../installing-the-os/automated-os-installation.md) when the management cluster provisions the machines).

You then describe the AZ in the `superphenix-operator` Helm values, under `clusters`. The chart turns each entry into the stack installed on that cluster.

## In this section

- **[Installing hyperconverged](installing-hyperconverged.md)**: storage and virtualization on the same cluster.
- **[Installing decoupled](installing-decoupled.md)**: dedicated storage and workload clusters.
- **[Configure a cluster](configuring-a-cluster.md)**: geography, connection mode, and system configuration for a `Cluster` resource.
- **[Adding a storage class](../../../operations/storage/adding-a-storage-class.md)**: attach storage to hyperconverged or decoupled clusters.
