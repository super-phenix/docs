# Installing management plane

Superphenix is installed through an operator running on the management cluster. The operator installs each Superphenix cluster from the configuration in its `Cluster` resource, and it owns installation, upgrades, and lifecycle for those clusters.

On the management cluster itself, the operator installs ArgoCD and a `Cluster` of type `Management`. That cluster pulls the management applications from the [superphenix-system](https://github.com/super-phenix/superphenix/tree/main/components/system/superphenix-system) chart:

- The Superphenix web console, API, Kratos, and Permify
- PostgreSQL, shared by the API, Kratos, and Permify
- The Talos operator and the iDRAC exporter, both optional and disabled by default

Storage for the database and ingress for HTTP are not part of that management set. They have to exist on the management cluster. When management runs inside an AZ, they arrive with the local AZ. See [Configuring the management stack](full-configuration.md).

## Next steps

- [Installing inside an AZ](management-inside-az.md) or [Installing outside an AZ](management-outside-az.md): install the operator for your placement.
- [Configuring the management stack](full-configuration.md): fill in the operator values before or with that install.
