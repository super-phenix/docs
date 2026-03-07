# Network

Superphenix provides **software-defined networking (SDN)** so that VMs and workloads get CSP-style networking: private and public IPs, tenant isolation, and firewalling—all managed from the same control plane as the rest of the platform.

## What you get

- **VPCs (Virtual Private Clouds)** — Isolated L3 domains per tenant or project. Each VPC contains subnets and has its own routing. Different VPCs can use overlapping private IP ranges.
- **Subnets** — L2 networks inside a VPC. VMs and pods get IPs from the subnet (via DHCP/DHCPv6 or static). IPs are stable across restarts and live migration. A VM can be attached to multiple subnets.
- **NAT gateways** — Private subnets reach the Internet through NAT. Optional floating IPs to map a public IP to a VM or service. Gateways can be highly available and load-balanced.
- **BGP** — Advertise public IPs to your upstream network for direct exposure (e.g. load balancers, DNS). Modes for local (single node) or resilient (multiple nodes) announcement.
- **Firewalling** — Ingress and egress rules per tenant or subnet. Port security to limit spoofing. Rules are managed declaratively and applied across the SDN.
- **Self-service** — Tenants create VPCs and subnets, attach VMs, and get addressing without manual VLAN or firewall configuration.
- **Dual stack** — IPv4 and IPv6 where supported.

## Scope

- **Per-AZ** — VPCs, subnets, and gateways are scoped to an Availability Zone. You manage multiple AZs from the same console and GitOps.

See [Architecture](../architecture.md) for how AZs and regions relate.
