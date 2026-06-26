# Network

Superphenix provides **VPC-style** networking for VMs: **VPCs**, **subnets**, optional **NAT gateways**, **load balancers**, **Elastic IPs (EIPs)**, and **firewalls**. All are scoped to an **availability zone (AZ)** and to your **organization** and **project** (see [Tenancy and console](tenancy-and-console.md)).

## VPCs (Virtual Private Cloud)

A **VPC** is an **L3 routing domain** that **contains subnets**. Subnets inside the **same** VPC can reach each other according to routing and firewall rules, similar to placing multiple VLANs behind one router that interconnects them.

- **L3 routing**: The VPC owns **route tables** and can host **custom static routes** to steer traffic between subnets, toward NAT, or to other next hops as you define.
- **Isolation**: Two subnets in **different** VPCs **cannot** talk privately; communication would go via the **Internet** (unless you add future **VPC peering** when available).

## Subnets

A **subnet** is an **L2 segment** with an IP range (**CIDR**) where you place instances. Think of it like a VLAN behind a router in a traditional design.

- A subnet **belongs to one VPC**. The **VPC** routes traffic to other subnets in the same VPC and toward the **Internet** when configured.
- **Custom gateway**: You can define how the subnet’s **default gateway** relates to the VPC router (advanced layouts).
- **Custom CIDR**: The subnet’s **CIDR block** is fully under your control within platform limits.
- **Exclude IPs from IPAM**: Reserve addresses (for gateways, load balancers, or static services) so **DHCP/IPAM** never hands them out.

### Create a subnet

1. Choose **IP family**: **IPv4**, **IPv6**, or **Dual stack** (both).
2. Set the **CIDR**: defines which IPs IPAM may assign to VMs.
3. Prefer **reasonably sized** prefixes (for example **`/24`** for IPv4) to avoid overlap and keep address plans manageable. Use **private** ranges appropriate to your environment (for example `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).

### IPAM

If you **do not** set a static IP on a VM, **IPAM** picks a free address **inside the subnet CIDR** (DHCP-style allocation). **Static** assignments bypass IPAM for that address.

### NAT gateway and “fully private” subnets

When creating a subnet you can:

- **Enable NAT gateway**: Instantiates a **NAT gateway** in the subnet so **outbound** traffic can reach the **Internet**. The subnet’s **routing table** is updated so traffic flows:

  `VM → default gateway → NAT gateway → Internet`

- **Fully private / isolated**: A stricter mode that **isolates** the subnet so it is **not reachable** even from other subnets in the same VPC. Use **firewall** rules for finer control when you only need to restrict access, not full isolation.

Subnets **host NAT gateways** when you enable them: the gateway is a resource in that subnet that provides **SNAT**, **DNAT**, and **1:1 NAT** (floating IP / **FIP**) patterns toward the Internet or peer networks.

After creation, the subnet detail shows **CIDR**, **gateway**, **VPC**, and (if enabled) the **NAT gateway** IP.

## Load balancers

A Superphenix load balancer is an **L3/L4** balancer. It exposes a **custom VIP** (virtual IP) that forwards to backends using **TCP**, **UDP**, or **SCTP** (protocol availability may vary by release). Listeners can reference **named ports** for clarity in larger configs.

### Virtual IP range

- The front **virtual IP** is chosen by you from **`198.18.0.0/16`** (IPv4 only at the time of writing).
- **Do not** reuse the same virtual IP on two load balancers.

A load balancer is tied to a **subnet**; routing inside the **VPC** lets **any VM in that VPC** reach the VIP when the VPC routes to the subnet that owns it. The **subnet** is inferred from **load balancer mapping** (see below).

### Mapping (backends)

**Mapping** defines where traffic is sent:

| Mode | Behavior |
|------|-----------|
| **IP backends** | Target backends by **raw IP** (static list). |
| **Label backends** | Target VMs matching a **label selector**; backends update **dynamically** when new VMs match. |

You then define **ports** (for example **80** / **443**) for forwarding.

**Health checks** probe backends; failing members are removed. Health check **source** addresses come from the **subnet** attached to the load balancer.

!!! warning "Same subnet for all backends"

    Selector or endpoint configuration must resolve to backends on a **single subnet**. Only the **first network interface** of each VM participates in load balancing: **secondary NICs** are not used. **All VMs behind one load balancer should sit in the same subnet.**

## Elastic IPs (EIPs)

**Elastic IPs** map **public** addresses to **private** addresses in your subnet (NAT / DNAT patterns).

**Prerequisites**

- Enable a **NAT gateway** on the **subnet** where you expose workloads. That NAT gateway handles traffic toward your private instances.

### Create and attach an EIP

1. Open the **subnet** where you need Internet access or inbound publishing.
2. Use **Attach EIP** (or equivalent in **Options**).
3. Name the EIP.

Then choose how NAT behaves:

| Mode | Use case |
|------|-----------|
| **Internal IP** | **1:1 NAT** between one **private** VM IP and the EIP. Inbound to the EIP hits that VM; outbound from that VM uses the EIP on the Internet. |
| **Internal CIDR** | **SNAT** a whole **CIDR** inside the subnet (often the **full subnet CIDR**) so outbound connections use the EIP as source. |

**DNAT (port forwarding)**: Map **external** ports on the EIP to an **internal** IP and **port** on a VM inside the CIDR (open a service to the Internet).

!!! note "One NAT gateway per subnet (today)"

    A subnet’s **VPC NAT gateway** currently serves **that subnet’s** outbound path. If a subnet needs Internet access or inbound reachability, it needs **its own** NAT gateway and **its own** EIPs. **Sharing** one NAT gateway across multiple subnets may come in a future release to save public IPs.

Created EIPs appear under **Network → EIPs** (or equivalent).

## Firewalls (network policies)

Firewall rules are expressed as **network policies** (Kubernetes-style semantics):

- **Default deny**: Traffic that is **not explicitly allowed** is **dropped** (allow-only model).
- **Match criteria**: Rules can target **CIDRs** and/or **label selectors** (for VMs or workloads).
- **Protocols**: **TCP**, **UDP**, and **SCTP** where supported.

The console UX may still evolve; power users can mirror the same rules in **GitOps** for review and audit.

## Configuration examples (illustrative)

These snippets illustrate the **ideas** behind console fields. **Field names and APIs** may differ in your release; use them as a checklist when translating to your GitOps manifests or API calls.

### Subnet with NAT

```yaml
# Illustrative: align with your Superphenix API / CRDs
apiVersion: networking.superphenix.example/v1alpha1
kind: Subnet
metadata:
  name: app-net-a
spec:
  vpcRef:
    name: tenant-vpc
  availabilityZone: fr01-als01
  ipFamily: IPv4
  cidr: 10.10.10.0/24
  natGateway:
    enabled: true
```

### Load balancer with static backends

```yaml
# Illustrative
apiVersion: loadbalancer.superphenix.example/v1alpha1
kind: LoadBalancer
metadata:
  name: web-frontend
spec:
  subnetRef:
    name: app-net-a
  vip: 198.18.10.50
  listeners:
    - port: 443
      protocol: TCP
      backends:
        staticIPs:
          - 10.10.10.20
          - 10.10.10.21
  healthCheck:
    tcp:
      port: 443
```

### Elastic IP with DNAT

```yaml
# Illustrative
apiVersion: network.superphenix.example/v1alpha1
kind: ElasticIP
metadata:
  name: public-web
spec:
  subnetRef:
    name: app-net-a
  snat:
    internalCidr: 10.10.10.0/24
  dnat:
    - externalPort: 443
      internalIp: 10.10.10.20
      internalPort: 443
```

See [Virtualization](virtualization.md) for attaching VMs to subnets and [Architecture overview](../architecture.md) for AZ scope.
