# Features

Superphenix is organized in two layers: the **foundation** provides the infrastructure platform (IaaS and operations), and **managed services** consume it to deliver higher-level offerings. The **web console** exposes these capabilities as **products** (compute, storage, network, SSH keys, and more), scoped by **organization**, **project**, and **availability zone (AZ)**.

Read [Architecture overview](../architecture/index.md#organizations-and-projects) and the [Web console](../operations/console.md) first for organizations, projects, IAM, and how to navigate resources.

## Foundation

The foundation provides the core capabilities that the rest of the platform relies on.

<div class="grid cards" markdown>

-   :lucide-server:{ .lg .middle } **Compute**

    ---

    **Instances (VMs)**, serial, and VNC, **Instances Snapshots**.

    [:octicons-arrow-right-24: Compute](compute/index.md)

-   :lucide-hard-drive:{ .lg .middle } **Storage**

    ---

    **Disk**, **Snapshot**, **Backup**, **Object Storage**.

    [:octicons-arrow-right-24: Storage](storage/index.md)

-   :lucide-network:{ .lg .middle } **Network**

    ---

    **VPC**, **Subnet**, **EIP**, **Load Balancer**, **Security Group**.

    [:octicons-arrow-right-24: Network](network/index.md)

-   :lucide-scroll-text:{ .lg .middle } **Audit log**

    ---

    Who changed what, from where, with what outcome. **Per-organization retention**.

    [:octicons-arrow-right-24: Audit log](audit-log.md)

</div>

## Managed services

These services run on the foundation. Availability depends on your Superphenix version and configuration.

<div class="grid cards" markdown>

-   :lucide-layers:{ .lg .middle } **PaaS**

    ---

    **Kubernetes (KaaS)**: VM node pools, **integrated CNI/CSI**, upgrades, and the same VPCs and storage as IaaS. _Console availability varies by release._

    [:octicons-arrow-right-24: PaaS](paas/index.md)

</div>

## How they fit together

- **Tenancy**: Organizations and projects isolate resources and access; see [Architecture overview](../architecture/index.md#organizations-and-projects).
- **Foundation**: Virtualization runs VMs; the network layer provides VPCs and subnets; storage backs disks; tooling drives GitOps and the console.
- **Managed services**: When enabled, PaaS and SaaS consume the same virtualization, storage, and network primitives.

See [Architecture overview](../architecture/index.md) for AZs, regions, and central administration.

## User guides

Looking for step-by-step console tutorials? See the **User guides**:

- **[Create a virtual machine](../user-guides/virtual-machines/create-a-vm.md)**: Walk through provisioning a VM, setting up boot disks, and connecting with SSH.
- **[Create a subnet with a NAT gateway](../user-guides/network/create-a-subnet.md)**: Configure a custom subnet CIDR with outbound Internet routing.
- **[Expose a VM with an Elastic IP](../user-guides/virtual-machines/expose-with-eip.md)**: Associate a public Elastic IP with your instance.
- **[Read the audit log](../user-guides/organization/audit-log.md)**: Find who changed a resource, filter the events and set the retention.
