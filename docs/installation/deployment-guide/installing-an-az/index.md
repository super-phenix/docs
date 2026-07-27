# Installing an AZ

Once the [management plane is installed](../installing-management/index.md), you install each AZ by creating `Cluster` resources in the namespace of the operator. These resources tell the operator where and how to deploy the Superphenix stack on each target.

## In this section

- **[Installing hyperconverged](installing-hyperconverged.md)**: storage and virtualization on the same cluster.
- **[Installing decoupled](installing-decoupled.md)**: dedicated storage and workload clusters.
- **[Configure a cluster](configuring-a-cluster.md)**: geography, connection mode, and system configuration for a `Cluster` resource.
- **[Adding a storage class](../../../operations/storage/adding-a-storage-class.md)**: attach storage to hyperconverged or decoupled clusters.
