# PaaS (Platform as a Service)

Superphenix offers **Kubernetes as a Service (KaaS)** as a core PaaS capability: you provision **tenant Kubernetes clusters** that run on the platform and consume its virtualization, storage, and networking.

## What you get

- **Tenant clusters** — Each tenant (or project) gets one or more dedicated Kubernetes clusters with their own control plane and node pools. Full isolation and self-service.
- **Nodes as VMs** — Cluster nodes are virtual machines provisioned by the platform. They use the same [virtualization](virtualization.md) layer: live migration, snapshots, and placement controls.
- **Storage for workloads** — Tenant clusters use the platform’s [storage](storage.md): block and file volumes (PVCs) with replication, snapshots, and cross-AZ mirroring where configured.
- **Networking** — Tenant clusters attach to the platform’s [network](network.md): VPCs, subnets, NAT, and firewalling so workloads get the same CSP-style networking as bare VMs.
- **Lifecycle** — Create, scale, upgrade, and delete clusters via the same [tooling](tooling.md) (GitOps and web console) you use for the rest of the platform.

## Who it’s for

PaaS is for tenants who want to run containerized workloads without managing the underlying infrastructure. They get a standard Kubernetes API and can deploy Helm charts, operators, and custom apps, while the platform handles nodes, storage, and network.

## Foundation used

| Foundation    | How PaaS uses it |
|---------------|------------------|
| Virtualization | VM nodes for each tenant cluster |
| Network        | VPCs and subnets for cluster and workload traffic |
| Storage        | Block and file volumes for PVCs |
| Tooling       | GitOps and console to provision and manage clusters |

See the [Features overview](index.md) for the split between foundation and managed services.
