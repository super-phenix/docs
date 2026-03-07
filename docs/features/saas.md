# SaaS (Software as a Service)

Superphenix can host **ready-to-run applications** (SaaS) that your customers use directly: databases, container registries, Git hosting, file sync, and more. These services run on the platform and consume its storage, networking, and optionally [PaaS](paas.md) or [virtualization](virtualization.md).

## What you get

- **Managed applications** — Deploy and operate common applications so tenants don’t have to install or maintain them. Examples include:
  - **Databases** — Managed PostgreSQL, MySQL, or other DBs with backups and replication.
  - **Container registry** — Harbor (or similar) for container images, with replication and access control.
  - **Git hosting** — GitLab (or similar) for source code, CI/CD, and collaboration.
  - **File sync and sharing** — Nextcloud (or similar) for files, calendars, and contacts.
- **Platform consumption** — SaaS workloads use the same [storage](storage.md) (block, file, object), [network](network.md) (VPCs, subnets, NAT), and [tooling](tooling.md) (GitOps, console, observability) as the rest of the platform.
- **Deployment models** — Run SaaS on tenant [PaaS](paas.md) clusters (one app per cluster or shared) or on dedicated [VMs](virtualization.md), depending on isolation and operational preferences.
- **Multi-tenancy** — Offer the same application to multiple tenants with isolated data and quotas, using the platform’s RBAC, quotas, and networking.

## Who it’s for

SaaS is for operators who want to provide turnkey applications (DB, registry, Git, files) to their customers without each customer deploying and operating the stack themselves. Tenants consume the service; you operate it on top of the foundation.

## Foundation used

| Foundation    | How SaaS uses it |
|---------------|-------------------|
| Virtualization | Optional: dedicated VMs per tenant or per app |
| Network        | VPCs, subnets, and firewalling for app traffic |
| Storage        | Block, file, and object storage for app data |
| Tooling        | GitOps, console, and observability to deploy and run apps |

See the [Features overview](index.md) for the split between foundation and managed services.
