# Virtualization

Superphenix provides **virtual machines** as a core feature: you run VMs on the same platform that runs the control plane, with the same declarative model and automation as the rest of the stack.

## What you get

- **VMs as first-class workloads** — Create, start, stop, and manage VMs via the same APIs and GitOps workflows you use for the rest of the platform. No separate hypervisor management layer.
- **Live migration** — Move VMs between nodes with minimal downtime for maintenance or load balancing.
- **Snapshots and clones** — Snapshot running VMs and clone them for backups, templates, or duplicate environments.
- **Templates and images** — Boot VMs from templates or images (e.g. from a registry). Inject users, SSH keys, and network config at first boot.
- **Persistent and ephemeral disks** — Attach persistent block storage to VMs, or use ephemeral disks for stateless or test workloads.
- **VM pools** — Run replica sets of VMs (e.g. for Kubernetes-as-a-Service node pools) with the same ease as scaling other workloads.
- **Node drain and placement** — Draining a node migrates VMs off it. Use affinities and taints to control where VMs run.

## Access to VMs

- **SSH** — VMs can be configured with SSH keys at boot and accessed over the network.
- **Serial console** — Direct serial console access when SSH is not available.
- **VNC** — Graphical console access (e.g. for Windows VMs), with access control and auditing via the web console.

## Integration with the rest of the platform

- **Networking** — Each VM can be attached to one or more networks (VPCs and subnets). IPs are stable across restarts and live migration.
- **Storage** — VM disks are backed by the platform’s block storage, with snapshot and clone support and optional replication across AZs.

See [Network](network.md) and [Storage](storage.md) for those capabilities.
