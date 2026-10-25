# User guides

These guides are console walkthroughs. Each one starts from the sidenav and ends with something you can use: a subnet, a virtual machine, a public address, a security group, or an audit trail.

Open the console as described in [Accessing Superphenix](../operations/accessing-superphenix.md). Select your organization and project in the top bar. Every resource you create belongs to that pair. Organizations, projects, and roles are described in [Architecture overview](../architecture/index.md#organizations-and-projects).

## Where to start

A first virtual machine you can reach from the Internet follows this order:

1. [Create a subnet with a NAT gateway](network/create-a-subnet.md) when you need your own address range or outbound Internet access. Each AZ already ships with a `default` subnet, and that subnet has no NAT gateway.
2. [Create a virtual machine](virtual-machines/create-a-vm.md) on that subnet.
3. [Expose a VM with an Elastic IP](virtual-machines/expose-with-eip.md) so the VM has a public address.
4. [Create a security group](network/create-a-security-group.md) to filter the VM's traffic.
5. [Read the audit log](organization/audit-log.md) to see who changed a resource in the organization, and when.

## Guides

<div class="grid cards" markdown>

-   :lucide-network:{ .lg .middle } **Network**

    ---

    Subnets, NAT gateways, Elastic IPs, and security groups.

    [:octicons-arrow-right-24: Network](network/index.md)

-   :lucide-server:{ .lg .middle } **Virtual machines**

    ---

    Create an Ubuntu VM and give it a public address.

    [:octicons-arrow-right-24: Virtual machines](virtual-machines/index.md)

-   :lucide-users:{ .lg .middle } **Organization**

    ---

    Records that span every project, starting with the audit log.

    [:octicons-arrow-right-24: Organization](organization/index.md)

</div>
