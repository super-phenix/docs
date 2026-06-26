# PaaS (Platform as a Service)

Superphenix is designed to offer **Kubernetes as a Service (KaaS)** so tenants can run **managed Kubernetes clusters** on the same **virtualization**, **storage**, and **network** stack as your IaaS workloads.

## Current status

In some console releases the **SaaS / PaaS** area is still a **placeholder**: **KaaS may not yet appear** as a selectable product. When enabled in your environment, you create and manage tenant clusters from the console and/or GitOps like other resources.

The sections below describe the **intended** Kubernetes feature set on Superphenix.

## Kubernetes on Superphenix

### VM pools (worker and control nodes)

Tenant clusters are backed by **pools of VMs** you define:

- **Custom VM sizing**: CPU, memory, and disk for control-plane and worker **machine types**.
- **Networking**: Node pools are attached to your **[VPCs and subnets](network.md)**; pods and services use the integrated **CNI** on top of that underlay.

### Platform integration

| Capability | Behavior |
|------------|-----------|
| **CNI** | **Integrated CNI**: cluster networking is provided by the platform stack (same SDN as VMs where applicable). |
| **CSI** | **Integrated CSI**: persistent volumes map to the platform **[storage](storage.md)** layer. |
| **Live migration** | Worker **VMs** can be **live-migrated** like any other instance when policy allows, for node maintenance without hard downtime for stateless workloads. |
| **Upgrades** | **Automatic upgrades** of cluster components (Kubernetes patch/minor versions per policy) reduce manual toil—exact knobs depend on your release. |

### Operations

- Create, scale, upgrade, and delete clusters via **[Tooling](tooling.md)** (GitOps and console).
- Use the same **organization / project** RBAC as the rest of the platform—see [Tenancy and console](tenancy-and-console.md).

## Foundation used

| Foundation    | How Kubernetes uses it |
|---------------|-------------------------|
| Virtualization | **VM pools** for nodes ([Virtualization](virtualization.md)) |
| Network        | VPCs, subnets, NAT, LB, firewall ([Network](network.md)) |
| Storage        | CSI-backed volumes ([Storage](storage.md)) |
| Tooling        | GitOps and console ([Tooling](tooling.md)) |

See the [Features overview](index.md).
