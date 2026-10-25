# Production recommendation

This section gives recommendations on how to configure Superphenix clusters for a **production** setup: topology and sizing choices, network and storage design, and day-2 practices that go beyond a first lab install.

If you are still on your first cluster, start with [Getting started](getting-started.md). Use the architecture guides for detailed requirements:

- [Deployment topology](../architecture/deployment-topology.md)
- [Hardware requirements](../architecture/hardware-requirements.md)
- [Network requirements](../architecture/network-requirements.md)

For all installation modes and runbooks, see the [deployment guide](deployment-guide/index.md).

## Production best practices

Production workloads need predictable latency and headroom for failure and recovery, not just enough capacity at steady state.

**Topology and deployment model**

- Prefer a **non-hyperconverged (decoupled)** layout for **high-demand** environments and when you need stronger **security** boundaries between storage and compute. Dedicated storage and hypervisor tiers avoid resource contention and simplify isolation (see [Deployment topology](../architecture/deployment-topology.md)).
- For **multi-AZ** deployments, **decoupled management** (control plane outside workload AZs) is advised so a single management cluster can orchestrate many AZs with better redundancy (see [Deployment topology](../architecture/deployment-topology.md)).
- A single AZ may **span multiple datacenters** only when sites stay close in **latency**, not in geography for its own sake. Aim for about **2 ms round-trip ping** (or less) between sites. At that level you are usually still in the **same metro**: two halls on one campus, or PoPs **tens of kilometers** apart over low-latency links (roughly same city / metropolitan area, not another region). Fiber and routing overhead mean 2 ms is not “hundreds of kilometers”; treat **~2 ms as a practical ceiling** for one stretched AZ. If ping is higher, use **separate AZs** instead (see [Architecture overview](../architecture/index.md) and [Network requirements](../architecture/network-requirements.md)).
- Size nodes using at least the **Recommended** hardware profile; treat **Minimal** as validation only (see [Hardware requirements](../architecture/hardware-requirements.md)).
- Use servers with **IPMI** (for example iDRAC or other BMCs) and a dedicated **out-of-band (OOB)** management network for remote power, console, and recovery without relying on the production data plane.

**Networking**

- Use at least **two VLANs** per AZ: one **cluster VLAN** (Talos, Ceph replication, VPC overlay, and other east-west traffic) and one **public VLAN** (north-south connectivity to the Internet and systems outside Superphenix). Keeping cluster and public traffic on separate L2 domains improves security boundaries and makes performance more predictable under load (see [Network requirements](../architecture/network-requirements.md)).
- Set **MTU 9000** (jumbo frames) end to end where the fabric supports it, on both **storage** interfaces and **general connectivity** interfaces, for maximum throughput and lower CPU overhead per gigabyte moved.
- Use **dual NICs in LACP** (active/active bonding). **2×10 Gb/s** is a practical minimum; **2×25 Gb/s** is preferred, especially so **Ceph** replication and client traffic are not limited by a single link or undersized uplinks.
- Prefer **BGP** to connect Superphenix to the rest of the network. It simplifies integration, advertises workload routes cleanly, and improves resilience through **ECMP** and **BFD** during upstream failures (see [Network requirements](../architecture/network-requirements.md)).
- Separate management, workload, and storage traffic where possible; use dedicated storage VLANs or fabrics when you cannot use physically separate links.
- Keep inter-node latency low within an AZ; plan bandwidth so Ceph replication and client I/O do not saturate shared links during recovery.

**Storage (Ceph)**

- Use **datacenter or enterprise-grade** SSDs and NVMe for Ceph OSDs. **Consumer SSDs** are a poor fit: Ceph is sensitive to write latency and endurance, and performance can **degrade sharply** under sustained or mixed workloads (see [Hardware requirements](../architecture/hardware-requirements.md)).
- Follow [Ceph hardware recommendations](https://docs.ceph.com/en/latest/start/hardware-recommendations/) for CPU per OSD, RAM, and network separation of public vs cluster traffic.
- Leave capacity margin for rebuilds, backups, and cross-AZ replication so recovery does not degrade production I/O.

**Operations**

- **GitOps everything**: keep cluster, platform, and tenant configuration in Git so installs, upgrades, and changes are **reproducible** and reviewable (declarative manifests, Helm values, and sync from a single source of truth).
- Plan multi-AZ and DR capacity so a zone can absorb failover load without becoming overloaded (see hardware guidance on multi-AZ headroom).
- Validate upgrades and failure scenarios in a staging cluster that matches production topology before changing production.

## Kernel optimization

Kernel tuning is often where you get the largest gains in responsiveness. The main levers are setting the CPU governor to **`performance`** (instead of `schedutil` or `powersave`) and reducing **C-states** to their minimum.

When servers are lightly loaded and the governor favors power saving, nodes can feel **sluggish** and slow to react to small bursts of traffic. CPUs must wake from deep sleep before they can service work. Raising the governor to `performance` and limiting C-states improves that behavior at the cost of **higher power consumption**.

Apply these settings in one of two ways:

- **[Manual tuning](../operations/kernel-optimization/manual-tuning.md)** through Talos (static, reboot required).
- **[Automated tuning](../operations/kernel-optimization/automated-tuning.md)** through the Superphenix TuneD agent (runtime, no reboot for profile changes).
