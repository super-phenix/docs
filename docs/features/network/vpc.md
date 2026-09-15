# VPC (Virtual Private Cloud)

A **Virtual Private Cloud (VPC)** is a Layer 3 routing domain within an Availability Zone (AZ). It contains **subnets**, defines shared DNS resolvers, and isolates tenant traffic across the SDN overlay. Subnets inside the **same** VPC can reach each other according to routing and firewall rules, similar to placing multiple VLANs behind one router that interconnects them.

---

## Core Behavior

- **L3 routing**: The VPC owns **route tables** and can host **custom static routes** to steer traffic between subnets, toward NAT, or to other next hops as you define.
- **Isolation**: Two subnets in **different** VPCs **cannot** talk privately; communication would go via the **Internet** (unless you add future **VPC peering** when available).

### DNS Inheritance
DNS servers configured in `dnsList` are propagated down to every subnet created inside the VPC. When compute instances or pods boot and request DHCP leases on these subnets, they receive these DNS servers by default.

### Subnet Containment & IPAM
- Every subnet must be attached to a parent VPC.
- Subnets within the same VPC cannot have overlapping CIDR blocks.
- Inter-subnet routing within a single VPC occurs across the underlying OVN logical router without requiring external gateways or NAT.

### Shared VPC
When `sharedVpc` is set to `true`, project administrators can expose specific subnets to other projects or teams while maintaining administrative ownership of the root network boundary and DNS settings.

---

## Operational Constraints

- **Deletion Blocker**: A VPC cannot be deleted if it contains active child subnets. All subnets must be deleted or migrated before the VPC can be removed.
- **AZ Immutability**: The Availability Zone of a VPC is assigned during creation and cannot be modified afterwards.
- **GitOps Tracking**: VPCs provisioned via GitOps manifests expose their synchronization state in the console UI and link directly to the corresponding ArgoCD application.
- **Resource Labeling**: Supports custom user metadata labels (`spx.io/user-*`) for cost center tagging and inventory management, as well as disaster recovery labels (`spx.io/dr-*`).
