# Production recommendation

This section gives recommendations on how to configure Superphenix clusters for a **production** setup: topology and sizing choices, network and storage design, and day-2 practices that go beyond a first lab install.

If you are still on your first cluster, start with [Getting started](getting-started.md). Use the architecture guides for detailed requirements:

- [Deployment topology](../architecture/deployment-topology.md)
- [Hardware requirements](../architecture/deployment-requirements.md)
- [Network requirements](../architecture/network-requirements.md)

For all installation modes and runbooks, see the [deployment guide](deployment-guide.md).

## Production best practices

Production workloads need predictable latency and headroom for failure and recovery, not just enough capacity at steady state.

**Topology and deployment model**

- Prefer a **non-hyperconverged (decoupled)** layout for **high-demand** environments and when you need stronger **security** boundaries between storage and compute. Dedicated storage and hypervisor tiers avoid resource contention and simplify isolation (see [Deployment topology](../architecture/deployment-topology.md)).
- For **multi-AZ** deployments, **decoupled management** (control plane outside workload AZs) is advised so a single management cluster can orchestrate many AZs with better redundancy (see [Deployment topology](../architecture/deployment-topology.md)).
- A single AZ may **span multiple datacenters** only when sites stay close in **latency**, not in geography for its own sake. Aim for about **2 ms round-trip ping** (or less) between sites. At that level you are usually still in the **same metro**: two halls on one campus, or PoPs **tens of kilometers** apart over low-latency links (roughly same city / metropolitan area, not another region). Fiber and routing overhead mean 2 ms is not “hundreds of kilometers”; treat **~2 ms as a practical ceiling** for one stretched AZ. If ping is higher, use **separate AZs** instead (see [Architecture overview](../architecture.md) and [Network requirements](../architecture/network-requirements.md)).
- Size nodes using at least the **Recommended** hardware profile; treat **Minimal** as validation only (see [Hardware requirements](../architecture/deployment-requirements.md)).
- Use servers with **IPMI** (for example iDRAC or other BMCs) and a dedicated **out-of-band (OOB)** management network for remote power, console, and recovery without relying on the production data plane.

**Networking**

- Use at least **two VLANs** per AZ: one **cluster VLAN** (Talos, Ceph replication, VPC overlay, and other east-west traffic) and one **public VLAN** (north-south connectivity to the Internet and systems outside Superphenix). Keeping cluster and public traffic on separate L2 domains improves security boundaries and makes performance more predictable under load (see [Network requirements](../architecture/network-requirements.md)).
- Set **MTU 9000** (jumbo frames) end to end where the fabric supports it, on both **storage** interfaces and **general connectivity** interfaces, for maximum throughput and lower CPU overhead per gigabyte moved.
- Use **dual NICs in LACP** (active/active bonding). **2×10 Gb/s** is a practical minimum; **2×25 Gb/s** is preferred, especially so **Ceph** replication and client traffic are not limited by a single link or undersized uplinks.
- Prefer **BGP** to connect Superphenix to the rest of the network. It simplifies integration, advertises workload routes cleanly, and improves resilience through **ECMP** and **BFD** during upstream failures (see [Network requirements](../architecture/network-requirements.md)).
- Separate management, workload, and storage traffic where possible; use dedicated storage VLANs or fabrics when you cannot use physically separate links.
- Keep inter-node latency low within an AZ; plan bandwidth so Ceph replication and client I/O do not saturate shared links during recovery.

**Storage (Ceph)**

- Use **datacenter- or enterprise-grade** SSDs and NVMe for Ceph OSDs. **Consumer SSDs** are a poor fit: Ceph is sensitive to write latency and endurance, and performance can **degrade sharply** under sustained or mixed workloads (see [Hardware requirements](../architecture/deployment-requirements.md)).
- Follow [Ceph hardware recommendations](https://docs.ceph.com/en/latest/start/hardware-recommendations/) for CPU per OSD, RAM, and network separation of public vs cluster traffic.
- Leave capacity margin for rebuilds, backups, and cross-AZ replication so recovery does not degrade production I/O.

**Operations**

- **GitOps everything**: keep cluster, platform, and tenant configuration in Git so installs, upgrades, and changes are **reproducible** and reviewable (declarative manifests, Helm values, and sync from a single source of truth).
- Plan multi-AZ and DR capacity so a zone can absorb failover load without becoming overloaded (see hardware guidance on multi-AZ headroom).
- Validate upgrades and failure scenarios in a staging cluster that matches production topology before changing production.

## Kernel optimization

Kernel tuning is often where you get the largest gains in responsiveness. The main levers are setting the CPU governor to **`performance`** (instead of `schedutil` or `powersave`) and reducing **C-states** to their minimum.

When servers are lightly loaded and the governor favors power saving, nodes can feel **sluggish** and slow to react to small bursts of traffic. CPUs must wake from deep sleep before they can service work. Raising the governor to `performance` and limiting C-states improves that behavior at the cost of **higher power consumption**.

You can apply these settings in two ways: **manually through Talos** (static, reboot required) or **through the Superphenix TuneD agent** (runtime, no reboot for profile changes).

### Manual tuning

Optimizations at this layer are configured where [Talos Linux](https://talos.dev/) runs your nodes. The Talos guide [Performance tuning](https://docs.siderolabs.com/talos/v1.13/configure-your-talos-cluster/system-configuration/performance-tuning) is a good starting point for CPU scaling governors, processor sleep states, and related kernel command-line parameters.

Typical changes include `cpufreq.default_governor=performance` and limits on C-states (for example `intel_idle.max_cstate=0` on Intel, or `amd_pstate=active` on AMD. See the Talos guide for your hardware).

!!! warning "Reboot required"
    Kernel parameters applied through Talos machine configuration (for example `.machine.install.extraKernelArgs`) take effect after a node **reboot** or a no-op upgrade to the same Talos version. Plan a maintenance window when tuning production nodes this way.

### Automated tuning

Superphenix ships a [TuneD](https://tuned-project.org/)-based daemon that applies performance-oriented settings at **runtime**. Enable it from the **`superphenix-system`** chart values, or from the `Cluster` CRD:

```yaml
apiVersion: operator.superphenix.net/v1alpha1
kind: Cluster
metadata:
  name: cluster-local
  namespace: spx
spec:
  deploymentTopology: Hyperconverged
  region: us
  availabilityZone: west
  version: 0.0.0-latest
  connection:
    mode: Local
  systemConfiguration:
    apps:
      tuned:
        enabled: true
```

A privileged DaemonSet runs on every node (including control-plane nodes). At startup, each pod reads a **per-node label** to choose the active profile, runs `tuned`, and reloads if the default profile changes. If the node has no label, it uses the default profile which optimizes for **throughput**, **compute latency**, and **network latency**.

**Per-node profile selection**

Assign a profile with the node label (default key: `performance.superphenix.net/profile`):

```bash
kubectl label node <node-name> performance.superphenix.net/profile=latency-performance
```

Remove the label to revert to the default:

```bash
kubectl label node <node-name> performance.superphenix.net/profile-
```

The label value must match a profile name defined in chart values (or already present on the node image).

!!! note "Restart required after label changes"
    Updating the profile label on a node does **not** cause the running tuned pod to pick up the new value. **Restart the tuned DaemonSet pod on that node manually** so it reads the label again at startup.

**Custom profiles**

Declare additional or replacement profiles under the `profiles` key in the tuned chart values. Each key is a profile name; the value is the raw `tuned.conf` content:

```yaml
profiles:
  my-custom-profile: |
    [main]
    summary=My custom tuning profile

    [cpu]
    governor=performance

    [sysctl]
    vm.swappiness=10
```

Profile names must be unique, start with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores. Use custom profiles when you need workload-specific sysctl, CPU, or network tuning beyond the defaults.
