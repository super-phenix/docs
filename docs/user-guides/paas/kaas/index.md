# Kubernetes as a service

This section walks you through the steps to manage a cluster's lifecycle and explains the available configuration options.

## What a cluster needs

A Kubernetes cluster in Superphenix is built from three things you pick in the creation wizard:

- **An availability zone (AZ).** The controlplane, worker VMs and all other building blocks of a cluster live in the AZ you select. You cannot move a cluster to another AZ afterwards.
- **A subnet.** At least one subnet is required for the worker nodes. The subnet's IPAM hands the VMs private IPv4 and IPv6 addresses.
- **An EIP with SNAT.** Worker nodes need internet access, which is provided by attaching an EIP to your subnet and configuring the SNAT functionnality.

## Before you start

- Select your organization and project in the top bar. Every resource you create belongs to that pair.
- Have a VPC and a subnet in the target AZ. Each AZ ships with a `default` VPC and a `default` subnet. To get your own range or a NAT gateway, follow [Create a subnet with a NAT gateway](../../network/create-a-subnet.md) first.
- Have an elastic IP (EIP) ready in the target AZ, with SNAT enabled. <!--To create one, follow [Attach an EIP to a subnet](../../network/attach-eip.md).-->
