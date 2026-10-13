# Installing management plane

This section covers where the management plane runs, how the Superphenix operator is installed, and how the management stack is configured.

Part of the [deployment guide](../index.md). Placement (inside an AZ or on a dedicated cluster), failure domains, and how that choice combines with hyperconverged and decoupled AZs are in [Deployment topology](../../../architecture/deployment-topology.md#management-plane). Cluster, AZ, and region concepts are in the [Architecture overview](../../../architecture/index.md).

- **[Installing inside an AZ](management-inside-az.md)**: install management on an AZ cluster after its operating system is in place.
- **[Installing outside an AZ](management-outside-az.md)**: install management on a dedicated cluster.
- **[Configuring the management stack](full-configuration.md)**: console domain, identity, database, Argo CD, and the management components. Both placements use this page.

## How the installation process works

Superphenix is installed through an operator running on the management cluster. The operator installs each Superphenix cluster from the configuration in its `Cluster` resource, and it owns installation, upgrades, and lifecycle for those clusters.

On the management cluster itself, the operator installs Argo CD and a `Cluster` of type `Management`. That cluster pulls the management applications from the [superphenix-system](https://github.com/super-phenix/superphenix/tree/main/components/system/superphenix-system) chart:

- The Superphenix web console, API, Kratos, and Permify
- PostgreSQL, shared by the API, Kratos, and Permify
- The Talos operator and the iDRAC exporter, both optional and disabled by default

Storage for the database and ingress for HTTP are not part of that management set. They have to exist on the management cluster. When management runs inside an AZ, they arrive with the local AZ. See [Configuring the management stack](full-configuration.md).

## Next steps

- [Installing inside an AZ](management-inside-az.md) or [Installing outside an AZ](management-outside-az.md): install the operator for your placement.
- [Configuring the management stack](full-configuration.md): fill in the operator values before or with that install.
- [Installing an AZ](../installing-an-az/index.md): define `Cluster` resources and deploy your availability zones.
- [Automated OS installation](../installing-the-os/automated-os-installation.md): provision physical servers through the operator.
