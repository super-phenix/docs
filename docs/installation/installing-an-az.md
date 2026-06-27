# Installing an AZ

Once the [management plane is installed](installing-management.md), you define each availability zone by creating `Cluster` resources in the `superphenix-system` namespace. These resources tell the operator where and how to deploy the Superphenix stack.

Choose your AZ topology first:

- **[Installing hyperconverged](installing-hyperconverged.md)**: storage and virtualization on the same cluster.
- **[Installing decoupled](installing-decoupled.md)**: dedicated storage and workload clusters.

## In this section

- **[Configure a cluster](configuring-a-cluster.md)**: geography, connection mode, and system configuration for a `Cluster` resource.
- **[Connecting clusters](connecting-clusters.md)**: link workload clusters to storage backends in decoupled deployments.

## Next steps

- [Installing management plane](installing-management.md): operator install and management stack configuration.
- [Production recommendations](production-recommendations.md): sizing and high-availability guidance.
