# SaaS (Software as a Service)

Superphenix aims to host **managed applications** (databases, registries, Git, file sync, and similar services) so operators can offer turnkey software to their customers on the same platform as IaaS.

## Current status

In the SPX console, the **SaaS** dimension is still a **placeholder** in some releases: the full **application catalog** may not be exposed yet. When your deployment enables it, services will appear alongside **Compute**, **Storage**, and **Network** in the product sidebar.

Until then, use **[Virtualization](virtualization.md)** and **[PaaS](paas.md)** (when available) to run the workloads you need, and manage applications with your own GitOps pipelines.

## Target direction

When the catalog is available, typical examples include:

- **Databases**: Managed relational or NoSQL engines with backups and replication.
- **Container registry**: Harbor or equivalent for images and policies.
- **Git hosting**: GitLab or similar for source control and CI/CD.
- **File sync**: Nextcloud or similar for files and collaboration.

Those services will consume the same **[storage](storage.md)**, **[network](network.md)**, and **[tooling](tooling.md)** primitives as the rest of the platform, with **multi-tenancy** enforced via organizations, projects, and quotas.

## Foundation used

| Foundation    | How SaaS uses it |
|---------------|-------------------|
| Virtualization | Dedicated VMs per tenant or shared node pools |
| Network        | VPCs, subnets, EIPs, and load balancers for traffic |
| Storage        | Block, file, or object storage for application data |
| Tooling        | GitOps, console, and observability |

See the [Features overview](index.md).
