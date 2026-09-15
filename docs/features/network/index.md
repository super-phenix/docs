# Network

Superphenix provides software-defined networking (SDN) for its workloads by using **VPCs**, **subnets**, optional **NAT gateways**, **load balancers**, **Elastic IPs (EIPs)**, and **security groups**. All are scoped to an **availability zone (AZ)** and to your **organization** and **project** (see [Tenancy and console](../tenancy-and-console.md)).

These features rely on CRDs from cloud-native networking projects including **Kube-ovn**, **Multus CNI**, and **Cilium**.

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

## Elastic IPs (EIPs)

**Elastic IPs** map **public** addresses to **private** addresses in your subnet (NAT / DNAT patterns).

**Prerequisites**

- Enable a **NAT gateway** on the **subnet** where you expose workloads. That NAT gateway handles traffic toward your private instances.

There are 3 ways this NAT gateway can behave:

| Mode                       | Use case                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Internal IP**            | **1:1 NAT** between one **private** VM IP and the EIP. Inbound to the EIP hits that VM; outbound from that VM uses the EIP on the Internet. |
| **Internal CIDR**          | **SNAT** a whole **CIDR** inside the subnet (often the **full subnet CIDR**) so outbound connections use the EIP as source.                 |
| **DNAT (port forwarding)** | Map **external** ports on the EIP to an **internal** IP and **port** on a VM inside the CIDR (open a service to the Internet).              |

!!! note "One NAT gateway per subnet (today)"

    A subnet’s **VPC NAT gateway** currently serves **that subnet’s** outbound path. If a subnet needs Internet access or inbound reachability, it needs **its own** NAT gateway and **its own** EIPs. **Sharing** one NAT gateway across multiple subnets may come in a future release to save public IPs.

## Load balancers

A Superphenix load balancer is an **L3/L4** balancer. It exposes a **custom VIP** (virtual IP) that forwards to backends using **TCP**, **UDP**, or **SCTP** (protocol availability may vary by release). Listeners can reference **named ports** for clarity in larger configs.

### Virtual IP range

- The front **virtual IP** is chosen by you from **`198.18.0.0/16`** (IPv4 only at the time of writing).
- **Do not** reuse the same virtual IP on two load balancers.

A load balancer is tied to a **subnet**; routing inside the **VPC** lets **any VM in that VPC** reach the VIP when the VPC routes to the subnet that owns it. The **subnet** is inferred from **load balancer mapping** (see below).

### Mapping (backends)

**Mapping** defines where traffic is sent:

| Mode               | Behavior                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **IP backends**    | Target backends by **raw IP** (static list).                                                  |
| **Label backends** | Target VMs matching a **label selector**; backends update **dynamically** when new VMs match. |

You then define **ports** (for example **80** / **443**) for forwarding.

**Health checks** probe backends; failing members are removed. Health check **source** addresses come from the **subnet** attached to the load balancer.

!!! warning "Same subnet for all backends"

    Selector or endpoint configuration must resolve to backends on a **single subnet**. Only the **first network interface** of each VM participates in load balancing: **secondary NICs** are not used. **All VMs behind one load balancer should sit in the same subnet.**


## Security Groups

A Security Group is a distributed, stateful Layer 3/Layer 4 virtual firewall applied at the network interface and pod level. It filters **inbound (ingress)** and **outbound (egress)** traffic for compute instances within an Availability Zone (AZ).

Its key capabilities are:

- Governing **east-west** and **north-south** traffic between workloads and the Internet.
- Predefined rule **templates** (`AllowAll`, `DenyAll`, `AllowSpecific`) for ingress and egress.
- Granular Layer 4 filtering by enforcing protocols (TCP/UDP) across **specific ports** orcontinuous **port ranges**.
- **Dynamic Peer Matching**: Peers defined via CIDR IP blocks (with exclusion masks) or dynamicworkload pod selectors.
- Protecting up to **10 subnets** per security group.

## Network architecture

Using these five main features, you can build your own SDN within Superphenix. The diagram below is an example of how these features can interact in your architecture:

```
+-----------------------------------------------------------------------------------+
|                            Availability Zone (AZ)                                  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                   Virtual Private Cloud (VPC)                               |  |
|  |  - Centralized DNS Resolvers (dnsList)                                      |  |
|  |  - Boundary Isolation & Shared VPC Capabilities                             |  |
|  |                                                                             |  |
|  |   +------------------------------------+  +------------------------------+  |  |
|  |   |           Subnet A                 |  |          Subnet B            |  |  |
|  |   | - CIDR: 10.0.1.0/24                |  | - CIDR: 10.0.2.0/24          |  |  |
|  |   | - Gateway: 10.0.1.1                |  | - Gateway: 10.0.2.1          |  |  |
|  |   | - NAT Gateway (SNAT / natGwDp)     |  | - Custom Route Tables        |  |  |
|  |   | - Dual-Stack (IPv4 / IPv6)         |  | - Multus CNI VM Interfaces   |  |  |
|  |   +-----------------+------------------+  +--------------+---------------+  |  |
|  |                     |                                    |                  |  |
|  +---------------------|------------------------------------|------------------+  |
|                        |                                    |                     |
|  +---------------------v------------------------------------v------------------+  |
|  |                         Security Groups (Firewalls)                         |  |
|  |  - Ingress / Egress Stateful Filtering (TCP, UDP, Port Ranges)              |  |
|  |  - Rules: AllowAll, DenyAll, AllowSpecific (CIDR IP Blocks & Pod Selectors) |  |
|  |  - Bound to Subnets (up to 10) or Targeted via Pod/VM Workload Selectors    |  |
|  +---------------------+------------------------------------+------------------+  |
|                        |                                    |                     |
|  +---------------------v------------------+  +--------------v---------------+  |  |
|  |         Elastic IP (EIP)               |  |       Load Balancer (LB)     |  |  |
|  | - Public IPv4 / IPv6 Allocation        |  | - Virtual IP (VIP)           |  |  |
|  | - 1:1 Floating IP (FIP) Ingress        |  | - Layer 4 TCP / UDP Ports    |  |  |
|  | - Many:1 Outbound SNAT Masquerade      |  | - Selector vs Endpoint Pools |  |  |
|  | - Port Forwarding (DNAT)               |  | - Session Affinity Stickiness|  |  |
|  | - QoS Bandwidth Rate-Limiting          |  |                              |  |  |
|  +----------------------------------------+  +------------------------------+  |  |
+-----------------------------------------------------------------------------------+
```

## Traffic flow examples

### Inbound (Internet -> internal workloads)

```
[Internet Client]
       |
       v
 [Elastic IP / VIP]  --> Layer 4 DNAT / FIP / Load Balancer distribution
       |
       v
[Security Group]     --> Evaluates ingress rules (protocol, port, source IP/CIDR)
       |
       v
    [Subnet]         --> Routed to the instance's private IP on the OVN overlay
       |
       v
  [Instance VM]      --> Delivered to guest interface (via Multus CNI)
```

1. External traffic hits an allocated **Elastic IP (EIP)** or a **Load Balancer (VIP)**.
2. The packet undergoes translation (1:1 Floating IP or DNAT port forwarding) or load-balanced distribution to an internal target IP in a **Subnet**.
3. Before reaching the destination compute instance interface, the traffic is evaluated by attached **Security Groups**.
4. If ingress rules match (`AllowSpecific` on target port, or `AllowAll`), packets are delivered to the guest interface; otherwise, packets are dropped statefully.

### East-West Internal (Workload -> workload)
1. An instance in `Subnet A` initiates a connection to an instance in `Subnet B` within the same **VPC**.
2. Layer 3 routing resolves the route table via the VPC/Subnet gateway fabric.
3. Source egress rules on the sender's **Security Group** are evaluated.
4. Destination ingress rules on the receiver's **Security Group** are evaluated (e.g., verifying allowed source CIDR or source `podSelector` labels).
5. Packets flow across the virtual overlay network without traversing external public networks.

### Outbound (Internal workload -> Internet)

```
  [Instance VM]
       |
       v
[Security Group]     --> Evaluates egress rules (protocol, port, destination CIDR)
       |
       v
    [Subnet]         --> Routes to subnet gateway
       |
       v
 [NAT Gateway / EIP] --> SNAT translates private IP to public egress IP
       |
       v
   [Internet]
```

1. The instance initiates an outbound connection to an external IP.
2. The instance's **Security Group** checks egress rules (e.g., default `AllowAll` or specific outbound destination CIDRs).
3. The **Subnet** routes packets through either:
   - Its integrated **NAT Gateway** (`natGw: true` with a dedicated dataplane instance).
   - An **Elastic IP** configured with an SNAT rule covering the subnet's CIDR.
4. The public gateway masquerades the private source IP with the public IP and forwards traffic to the upstream provider network.


See [Virtualization](../virtualization.md) for attaching VMs to subnets and [Architecture overview](../../architecture/index.md) for AZ scope.
