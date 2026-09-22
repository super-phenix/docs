# Network

These guides cover the **Network** entry of the sidenav: the address space your VMs live in, the way they reach the Internet, and the rules that filter their traffic.

| Guide | You end up with |
|-------|-----------------|
| [Create a subnet with a NAT gateway](create-a-subnet.md) | A private range of your own, with outbound Internet access and an attachment point for public IPs |
| [Expose a VM with an Elastic IP](../virtual-machines/expose-with-eip.md) | A public IPv4 address that forwards traffic to one VM |
| [Create a security group](create-a-security-group.md) | Ingress and egress rules applied to the VMs that carry a label |

## What the console offers

The **Network** section holds five products. Each one lives in a single AZ.

**VPC** is the routing domain that holds subnets. The wizard asks for a **Name** and an **AZ Selection**, nothing else. The details page has a **Route Table** tab where you add static routes, and a **Subnets** tab. The console refuses to delete a VPC while it still holds subnets. Each AZ ships with a `default` VPC, so most projects never create one.

**Subnet** is the segment that hands VMs their addresses. You pick the VPC, the address family (`IPv4`, `IPv6` or `Dual`), the CIDR, optional DNS servers, and two switches: **Enable NAT gateway** for outbound access, and **Make the network private** to cut the subnet off from the rest of the VPC. [Create a subnet with a NAT gateway](create-a-subnet.md) walks through it.

**EIP** maps a public IPv4 address onto a subnet that has a NAT gateway. **Internal IP** mode is a one-to-one NAT with one VM. **Internal CIDR** mode gives a whole range outbound access through the address and publishes single ports with DNAT rules. [Expose a VM with an Elastic IP](../virtual-machines/expose-with-eip.md) walks through it.

**Load Balancer** exposes a **Virtual IP** from `198.18.0.0/16` and forwards TCP or UDP ports to backends. Backends come from a label **Selector** or from a list of **Endpoint** addresses, and each rule maps a **Port** to a **Target Port**. No guide covers it yet.

**Security Group** filters the traffic of the VMs it selects by label. Ingress and egress rules each allow everything, deny everything, or allow listed ports from listed sources. [Create a security group](create-a-security-group.md) walks through it and explains what an empty rule list does.

## Before you start

- Select your organization and project in the top bar. Every resource you create belongs to that pair.
- Every AZ ships with a `default` VPC and a `default` subnet at `10.10.0.0/16`, without a NAT gateway. Create your own subnet when you need a NAT gateway, a private segment, or a range of your choice.
- A network resource stays in the AZ you pick at creation. To use the same layout in another AZ, create it again there.

For the concepts behind these pages, read [Network](../../features/network/index.md).
