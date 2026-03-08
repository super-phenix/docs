# Architecture overview

This page describes how Superphenix is organized: organizations and projects, where resources live, how availability zones (AZs) work, and how disaster recovery fits in. For how AZs and the management cluster can be deployed, see [Deployment modes](architecture/deployment-modes.md).

## Availability zones

An **availability zone** is a **Kubernetes cluster** on which the full Superphenix stack is deployed: virtualization, software-defined network, storage (if not decoupled), and tooling. It is the unit of capacity and failure domain: everything running in that AZ runs on that cluster.

### Geography

An AZ can **span multiple datacenters** as long as latency between them is low (e.g. same campus or metro). The important constraint is **network latency (ping)**: if the sites are too far apart, the cluster’s consistency and performance requirements may not be met. So an AZ is a logical unit of availability that can stretch across nearby datacenters, but not across distant regions.

## Organizations and projects

Superphenix uses a two-level hierarchy for tenant isolation and resource grouping:

- **Organizations** — Top-level container. Users are assigned to organizations and receive roles that apply to the projects within that organization.
- **Projects** — Live inside an organization. Projects are where **resources** (VMs, networks, volumes, etc.) are created and stored. All resources are scoped to a project.

Users are assigned to **organizations** and have **roles on projects** (e.g. viewer, editor, admin). Access control and quotas are applied at the project level, so teams can share an organization while keeping project boundaries clear.

## Resources and availability zones

- **Resources** (VMs, disks, networks, and so on) are **located in availability zones (AZs)**. When you create a resource, it is placed in an AZ.
- **One project can contain resources from multiple AZs.** A project is not tied to a single AZ; you can have VMs in AZ A and AZ B, and storage in both, all under the same project. That makes it easy to spread workloads or to use different AZs for different purposes within the same project.

So: **organizations** contain **projects**; **projects** contain **resources**; **resources** live in **AZs**, and a project can span many AZs.

## Disaster recovery

Disaster recovery is configured **between AZs**. You can set up synchronization or backup so that the data and resources of an **entire project** are replicated or backed up from one AZ to another. That allows failover or restore at the project level: if one AZ is unavailable, you can bring the project’s resources up in another AZ that has been receiving the sync or backups.
