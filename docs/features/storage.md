# Storage

Superphenix provides **software-defined storage** for VM disks, shared volumes, and object storage. Data is replicated and can be mirrored across availability zones for disaster recovery.

## What you get

- **Block storage** — Primary storage for VM disks. Attach persistent volumes to VMs with support for live migration, snapshots, and clones. Thin provisioning to use capacity efficiently.
- **File storage (shared volumes)** — Read-write-many volumes for shared data (e.g. between pods or VMs in the same subnet).
- **Object storage** — S3-compatible object storage for backups, artifacts, or application data.
- **Replication and resilience** — Data is spread across many disks and nodes within an AZ. Replication and erasure coding help withstand failures.
- **Cross-AZ mirroring** — Replicate or mirror data between AZs for disaster recovery. Fail over to another AZ when needed.
- **Multi-tenancy and quotas** — Pools and quotas per tenant. Usage metrics for billing and capacity planning.
- **Snapshots and clones** — Snapshot VM disks and volumes; clone them for new VMs or environments. Integrates with the platform’s VM snapshot and clone features.
- **GitOps and automation** — Storage pools and policies are defined declaratively and deployed via the same GitOps workflow as the rest of the platform.

## Integration

- **Virtualization** — VM disks are backed by block storage. Live migration, snapshots, and clones work with the storage layer.
- **Observability** — Metrics and dashboards for capacity, health, and per-tenant usage.

See [Virtualization](virtualization.md) and [Tooling](tooling.md) for how storage fits with VMs and operations.
