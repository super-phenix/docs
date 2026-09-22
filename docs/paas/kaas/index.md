# Kubernetes as a service on Superphenix

Superphenix is designed to offer **Kubernetes as a Service (KaaS)** so tenants can run **managed Kubernetes clusters** on the same **virtualization**, **storage**, and **network** stack as your IaaS workloads.

## Main features

### VM pools (worker nodes)

Tenant clusters are backed by **pools of VMs** where you define:

- **VM sizing**: CPU, memory, and disk for control-plane and worker machines.
- **Networking**: Node pools are attached to your **[VPCs and subnets](../../features/network/index.md)**; pods and services use the integrated **CNI** on top of that underlay.

### Platform integration

| Capability | Behavior |
|------------|-----------|
| **CNI** | **Integrated CNI**: cluster networking is provided by the platform stack (same SDN as VMs where applicable). |
| **CSI** | **Integrated CSI**: persistent volumes map to the platform **[storage](../../features/storage/index.md)** layer. |
| **Live migration** | Worker **VMs** can be **live-migrated** like any other instance when policy allows, for node maintenance without hard downtime for stateless workloads. |
| **Disaster recovery** | Controlplane data and worker nodes can be backed up and replicated allowing for quick recovery in case of outages or catastrophic failure. |

### Operations

- Create, scale, upgrade, and delete clusters via GitOps and console.
- Use the same **organization / project** RBAC as the rest of the platform; see [Organizations and projects](../../architecture/index.md#organizations-and-projects).

## Foundation used

| Foundation    | How Kubernetes uses it |
|---------------|-------------------------|
| Virtualization | **VM pools** for nodes ([Compute](../../features/compute/index.md)) |
| Network        | VPCs, subnets, NAT, LB, firewall ([Network](../../features/network/index.md)) |
| Storage        | CSI-backed volumes ([Storage](../../features/storage/index.md)) |

## Version support

Each version of Superphenix will support 3 minor Kubernetes versions at a time. You may encounter different supported versions for a single Superphenix deployment as some AZs might be more up to date than others.
