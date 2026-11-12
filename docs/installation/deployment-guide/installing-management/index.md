# Installing management plane

Superphenix is installed through an operator running on the management cluster. The operator installs each Superphenix cluster remotely or locally, and it owns installation, upgrades, and lifecycle for those clusters.

On the management cluster itself, the operator installs ArgoCD and a `Cluster` of type `Management`. That cluster pulls the management applications from the [superphenix-system](https://github.com/super-phenix/superphenix/tree/main/components/system/superphenix-system) chart:

- The Superphenix web console, API, Kratos, and Permify
- PostgreSQL, shared by the API, Kratos, and Permify
- The Talos operator and the iDRAC exporter, both optional and disabled by default

## Next steps

- [Installing inside an AZ](management-inside-az.md) or [Installing outside an AZ](management-outside-az.md): install the operator for your placement.
- [Configuring the management stack](full-configuration.md): fill in the operator values before or with that install.
