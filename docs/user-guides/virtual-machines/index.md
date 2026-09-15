# Virtual machines

These guides walk you through the console, from an empty project to a virtual machine you can reach from the Internet.

| Guide                                                | You end up with                                              |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| [Create a virtual machine](create-a-vm.md)           | A running Ubuntu VM with a private IP on one of your subnets |
| [Expose a VM with an Elastic IP](expose-with-eip.md) | A public IP that forwards traffic to that VM                 |

## What a VM needs

A virtual machine in Superphenix is built from three things you pick in the creation wizard:

- **An availability zone (AZ).** The VM, its disks and its network interfaces all live in the AZ you select. You cannot move a VM to another AZ afterwards.
- **A subnet.** The wizard requires at least one subnet. The subnet's IPAM hands the VM a private IPv4 and IPv6 address, or you set them by hand.
- **A boot disk.** Disks are optional in the wizard, but a VM without an OS disk has nothing to boot. The guide uses an Ubuntu cloud image imported over HTTP.

## Before you start

- Select your organization and project in the top bar. Every resource you create belongs to that pair.
- Have a VPC and a subnet in the target AZ. Each AZ ships with a `default` VPC and a `default` subnet. To get your own range or a NAT gateway, follow [Create a subnet with a NAT gateway](../network/create-a-subnet.md) first.
- Optional: upload an SSH public key under **SSH Keys** in the sidenav. The wizard injects it into the VM through cloud-init.

## What you get by default

- A user named `spx` with passwordless `sudo`, created by the default cloud-init configuration.
- A generated password for `spx`, visible on the instance's **Storage** tab under **Cloud Init**. The password expires at first login, so the VM asks you to change it.
- SSH password authentication enabled, plus any SSH keys you selected.
- DNS pointed at `1.1.1.1` and `1.0.0.1`.

You can replace all of this by switching on **Customize configuration** in the wizard's **Storage & SSH** step and providing your own cloud-init user data.

For the concepts behind these pages, read [Compute](../../features/compute/index.md) and [Network](../../features/network/index.md).
