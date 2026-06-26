# Features

Superphenix is organized in two layers: the **foundation** provides the infrastructure platform (IaaS and operations), and **managed services** consume it to deliver higher-level offerings. The **web console** exposes these capabilities as **products** (compute, storage, network, SSH keys, and more), scoped by **organization**, **project**, and **availability zone (AZ)**.

Read **[Tenancy and console](tenancy-and-console.md)** first for organizations, projects, IAM, and how to navigate resources.

## Foundation

The foundation provides the core capabilities that the rest of the platform relies on.

<div class="grid cards" markdown>

-   :lucide-server:{ .lg .middle } __Virtualization__

    ---

    **Instances (VMs)**, **live migration**, **snapshots** (VM and scheduled volume), **restores**, **cloud-init**, SSH, serial, and VNC.

    [:octicons-arrow-right-24: Virtualization](virtualization.md)

-   :lucide-network:{ .lg .middle } __Network__

    ---

    **VPCs**, **subnets**, **NAT gateways**, **load balancers**, **Elastic IPs (EIPs)**, and **firewalls**: CSP-style networking with IPAM and optional Internet exposure.

    [:octicons-arrow-right-24: Network](network.md)

-   :lucide-hard-drive:{ .lg .middle } __Storage__

    ---

    **Disks** and **disk snapshots**: block volumes (and classes such as high-speed), create from **blank**, **HTTP image**, **snapshot**, or **clone**; online resize.

    [:octicons-arrow-right-24: Storage](storage.md)

-   :lucide-settings:{ .lg .middle } __Tooling__

    ---

    **GitOps**, **web console**, **SSH key store**, observability, and quotas: deploy and operate the platform and tenant resources from one place.

    [:octicons-arrow-right-24: Tooling](tooling.md)

</div>

## Managed services

These services run on the foundation. Availability depends on your Superphenix version and configuration.

<div class="grid cards" markdown>

-   :lucide-layers:{ .lg .middle } __PaaS__

    ---

    **Kubernetes (KaaS)**: VM node pools, **integrated CNI/CSI**, upgrades, and the same VPCs and storage as IaaS. *Console availability varies by release.*

    [:octicons-arrow-right-24: PaaS](paas.md)

-   :lucide-package:{ .lg .middle } __SaaS__

    ---

    **Managed applications** (databases, registries, Git, file sync, …): the service catalog is evolving; see the SaaS page.

    [:octicons-arrow-right-24: SaaS](saas.md)

</div>

## How they fit together

- **Tenancy**: Organizations and projects isolate resources and access; see [Tenancy and console](tenancy-and-console.md).
- **Foundation**: Virtualization runs VMs; the network layer provides VPCs and subnets; storage backs disks; tooling drives GitOps and the console.
- **Managed services**: When enabled, PaaS and SaaS consume the same virtualization, storage, and network primitives.

See [Architecture overview](../architecture.md) for AZs, regions, and central administration.
