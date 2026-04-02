# Network requirements

<div class="justify" markdown>

Network design for Superphenix should be planned alongside hardware sizing and AZ topology. This page defines baseline expectations for link speed, VLAN segmentation, external connectivity, and IP announcement models. For server sizing and NIC assumptions, see [Hardware requirements](deployment-requirements.md). For AZ design constraints, see [Architecture overview](../architecture.md).

---

## Baseline and interface sizing

Use the NIC sizing from the [Hardware requirements](deployment-requirements.md) as the baseline for network planning:

- **Minimum**: **10 Gb/s** per port
- **Recommended**: **25 Gb/s** per port (or faster), typically with redundant uplinks

!!! important "Align network and hardware recommendations"

    If nodes are sized at recommended or optimal hardware tiers, the network should follow the same tier to avoid bottlenecks during VM traffic peaks, storage replication/recovery, and maintenance operations such as live migration.

---

## VLAN segmentation guidance

VLAN layout depends on whether you run hyperconverged or decoupled clusters. The goal is to keep external north-south traffic separated from cluster east-west traffic whenever practical.

!!! note "Single VLAN is possible"

    It is entirely possible to run all traffic on a single VLAN, especially in small environments or labs. However, this is generally not recommended for production when you need stronger security boundaries and more predictable performance under load.

### Hyperconverged AZ

For hyperconverged deployments, a common baseline is:

- **Public VLAN**: external connectivity (internet traffic and connectivity to systems outside Superphenix)
- **Cluster VLAN**: Talos node communication, Ceph internal traffic, and network overlay traffic used by VPCs and virtual subnets

### Decoupled storage tier

For storage clusters, follow Ceph network guidance referenced in [Hardware requirements](deployment-requirements.md), and separate traffic classes when possible:

- One network/VLAN for storage client consumption (public/client side)
- One network/VLAN for storage replication and recovery (cluster side)

This separation helps reduce contention between client I/O and replication/rebuild traffic.

### Decoupled virtualization tier

For virtualization clusters, a practical model is:

- **Public VLAN**: external connectivity and storage consumption paths
- **Cluster VLAN**: VPCs, virtual subnets, Kubernetes/CNI networking, and inter-node internal traffic
- Optional **dedicated storage VLAN**: for explicit separation of storage access from other cluster traffic in performance-sensitive environments

If the **management cluster** is decoupled (outside workload AZs), it must be able to reach the **cluster network** of each AZ it manages so control-plane operations, lifecycle actions, and reconciliation can function reliably.

---

## Topology

The recommended physical topology is a **spine/leaf** fabric because it provides predictable east-west bandwidth and clearer scale-out behavior.
Expect significant east-west traffic from Ceph (replication and recovery) and from workloads (container and VM traffic).

A **traditional network topology** can also work well in most environments, especially for smaller footprints or incremental deployments.

---

## External connectivity: BGP vs VLAN

External connectivity is about how Superphenix workloads reach systems outside the platform: either the **internet** or the rest of your existing network (for example, services and workloads that do not run on Superphenix). This section explains the two common integration models used to expose and route workload IPs beyond the Superphenix AZ.

### Recommended: BGP

Use **BGP** as the preferred integration model so Superphenix can announce workload addresses (VMs, containers, and other resources) to the rest of the network.

BGP is generally more flexible than static L2-only approaches:

- Better support for controlled route advertisement patterns
- Easier integration with larger routed fabrics
- Ability to leverage **ECMP** in suitable designs

### Alternative: Dedicated VLAN IP pool

A dedicated **VLAN IP pool** from which Superphenix allocates workload IPs can also be used and is valid for many environments.

Compared to BGP, this approach is usually less flexible for route control and growth, but remains a practical option when routing integration needs are limited.

---

## Stretched AZ latency guidance

Stretched AZ deployments across datacenters (or PoPs) should stay within very low latency boundaries. In practice, avoid stretching beyond a **few milliseconds RTT** between PoPs.

Higher latency can lead to operational and performance issues, including:

- Control-plane sensitivity (for example, **etcd** behavior under slower links)
- Increased storage latency (for example, **Ceph** replication and recovery paths)
- Slower virtual network paths between workloads in different sites

This aligns with the [Architecture overview](../architecture.md), which positions an AZ as a close geographic zone (typically same campus/metro, often on the order of a few dozen kilometers at most in best cases).

---

## IPAM behavior across AZs

Superphenix IPAM is scoped **per availability zone (AZ)**. Superphenix receives one or more IP ranges (pools) and allocates addresses from those ranges to **VMs**, **NAT gateways**, **containers**, and other workloads/services in that AZ. If you configure overlapping ranges in different AZs, Superphenix does **not** provide global deduplication across AZs for those allocations and does not guarantee non-overlap between AZs.

For **disaster recovery** between AZs, Superphenix expects public workload IPs to remain consistent during failover. In practice, each AZ network should be designed so it can carry the same public ranges, while only the **local** IPAM allocates addresses to workloads running in that AZ.

The most practical approach is usually **BGP**:

- Keep one primary public range associated with each AZ for local provisioning
- Allow route advertisement of that range toward peer/remote AZs
- During failover, keep announcing the relevant public IPs from the remote AZ where workloads are restarted
- Avoid using the same range for active local provisioning in multiple AZs at the same time; this helps prevent IP conflicts

This model preserves workload addressing during recovery while keeping day-to-day allocation boundaries clear.

---

## Cross-AZ replication bandwidth

For cross-AZ traffic (storage replication, backups, and failovers), plan at least **10 Gb/s** between AZs as a practical minimum baseline.

Lower bandwidth can significantly increase recovery windows and replication lag under load.

---

## Advanced use: public IP ranges

For advanced networking designs, you can provide **public IP ranges** to Superphenix so public addresses can be assigned directly to:

- **Virtual machines**
- **NAT gateways**

This can reduce translation layers for internet-facing workloads and simplify some ingress patterns when public addressing is part of the target architecture.

</div>
