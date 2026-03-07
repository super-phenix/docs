# Features

Superphenix is organized in two layers: the **foundation** provides the infrastructure platform (IaaS and operations), and **managed services** consume it to deliver higher-level offerings such as Kubernetes-as-a-Service and ready-to-run applications.

## Foundation

The foundation provides the core capabilities that the rest of the platform relies on. Everything else is built on these four pillars.

<div class="grid cards" markdown>

-   :lucide-server:{ .lg .middle } __Virtualization__

    ---

    Run virtual machines with live migration, snapshots, and templates. VMs are managed like any other workload and can use multiple networks and persistent or ephemeral disks.

    [:octicons-arrow-right-24: Virtualization](virtualization.md)

-   :lucide-network:{ .lg .middle } __Network__

    ---

    Software-defined networking: VPCs, subnets, NAT gateways, BGP, and firewalling. Tenant isolation, overlapping private IPs, and stable IPs across VM migration.

    [:octicons-arrow-right-24: Network](network.md)

-   :lucide-hard-drive:{ .lg .middle } __Storage__

    ---

    Block, file, and object storage with replication and disaster recovery. VM disks, shared volumes, thin provisioning, and cross-AZ mirroring.

    [:octicons-arrow-right-24: Storage](storage.md)

-   :lucide-settings:{ .lg .middle } __Tooling__

    ---

    GitOps-driven deployment, observability, and a multi-tenant web console. Deploy and manage the whole platform and all AZs from a single place.

    [:octicons-arrow-right-24: Tooling](tooling.md)

</div>

## Managed services

These services run on the foundation. They consume virtualization, network, and storage to deliver platform and application offerings to your customers.

<div class="grid cards" markdown>

-   :lucide-layers:{ .lg .middle } __PaaS__

    ---

    Kubernetes as a Service (KaaS): provision tenant Kubernetes clusters that use the platform’s VMs, storage, and networking. Each cluster gets its own control plane and nodes, with isolation and self-service.

    [:octicons-arrow-right-24: PaaS](paas.md)

-   :lucide-package:{ .lg .middle } __SaaS__

    ---

    Ready-to-run applications on the platform: databases, container registries (Harbor), Git hosting (GitLab), file sync (Nextcloud), and more. They consume storage, networking, and optionally PaaS or VMs.

    [:octicons-arrow-right-24: SaaS](saas.md)

</div>

## How they fit together

- **Foundation** — Virtualization runs VMs; the network layer gives them VPCs and subnets; storage provides disks and shared volumes; tooling deploys and operates everything via GitOps and the web console.
- **Managed services** — PaaS provisions tenant Kubernetes clusters whose nodes are VMs and whose workloads use the same storage and network. SaaS offerings run on those clusters or on VMs, using the same storage and networking.

The **foundation** is your IaaS and operations layer; **managed services** are what you offer on top of it (KaaS, databases, registries, etc.). Both are managed from the same console and GitOps workflow.

See [Architecture overview](../architecture.md) for AZs, regions, and central administration.
