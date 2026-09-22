# Subnet

A **Subnet** is a Layer 2/Layer 3 IP network segment with an IP range (**CIDR**), defined within a parent VPC. It handles IP address allocation (IPAM), DHCP services, default gateway routing, optional outbound NAT gateways, and VM interface attachments via Multus CNI. Think of it like a VLAN behind a router in a traditional design.

- A subnet **belongs to one VPC**. The **VPC** routes traffic to other subnets in the same VPC and toward the **Internet** when configured.
- **Custom gateway**: You can define how the subnet’s **default gateway** relates to the VPC router (advanced layouts).
- **Custom CIDR**: The subnet’s **CIDR block** is fully under your control within platform limits.
- **Exclude IPs from IPAM**: Reserve addresses (for gateways, load balancers, or static services) so **DHCP/IPAM** never hands them out.

---

## Core Behavior

### IPAM and DHCP
- Each subnet manages an IP address pool based on its `cidr` and `gateway`.
- Dynamic IP allocation is handled via internal DHCP. When an `Instance` VM connects to a subnet via Multus CNI, the guest OS obtains its IP configuration automatically.

### Outbound Egress via NAT Gateway
- Setting `natGw: true` enables outbound internet access for private workloads that do not have dedicated Elastic IPs.
- Outbound traffic is routed through a dedicated NAT gateway dataplane (`natGwDp`) that performs Source NAT (SNAT) before traffic leaves the platform.

### Route Tables
- By default, all subnets within the same VPC route to each other through the VPC gateway fabric.
- Custom static routes can be added to direct specific destination CIDRs toward dedicated appliances (such as VPN gateways or security proxies).

---

## Integration with Other Products

- **Instances**: Virtual machines attach network interfaces to subnets via Multus CNI. An instance can have multiple interfaces connected to different subnets.
- **Security Groups**: Up to 10 subnets can be bound directly to a single Security Group, applying its ingress and egress firewall rules to all workloads on those subnets.
- **Elastic IPs**: EIPs bind to instances or subnets to provide 1:1 Floating IPs, DNAT port forwarding, or custom SNAT gateways.

---

## Operational Constraints

- **Attachment Lock**: A subnet cannot be deleted while active compute instances or network interfaces are attached to it. All workloads must be detached or terminated first.
- **VPC Association**: A subnet must belong to exactly one parent VPC in the same Availability Zone.
- **GitOps Management**: Subnets managed through GitOps display live reconciliation status and provide direct navigation to ArgoCD applications.

---

## Create a subnet

1. Choose **IP family**: **IPv4**, **IPv6**, or **Dual stack** (both).
2. Set the **CIDR**: defines which IPs IPAM may assign to VMs.
3. Prefer **reasonably sized** prefixes (for example **`/24`** for IPv4) to avoid overlap and keep address plans manageable. Use **private** ranges appropriate to your environment (for example `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).

## IPAM

If you **do not** set a static IP on a VM, **IPAM** picks a free address **inside the subnet CIDR** (DHCP-style allocation). **Static** assignments bypass IPAM for that address.

## NAT gateway and “fully private” subnets

When creating a subnet you can:

- **Enable NAT gateway**: Instantiates a **NAT gateway** in the subnet so **outbound** traffic can reach the **Internet**. The subnet’s **routing table** is updated so traffic flows:

  `VM → default gateway → NAT gateway → Internet`

- **Fully private / isolated**: A stricter mode that **isolates** the subnet so it is **not reachable** even from other subnets in the same VPC. Use **firewall** rules for finer control when you only need to restrict access, not full isolation.

Subnets **host NAT gateways** when you enable them: the gateway is a resource in that subnet that provides **SNAT**, **DNAT**, and **1:1 NAT** (floating IP / **FIP**) patterns toward the Internet or peer networks.

After creation, the subnet detail shows **CIDR**, **gateway**, **VPC**, and (if enabled) the **NAT gateway** IP.

For a detailed walkthrough, read the [User Guide on how to create a Subnet](../../user-guides/network/create-a-subnet.md).