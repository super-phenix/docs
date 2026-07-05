# Architecture overview

This page describes how Superphenix is organized: **Superphenix clusters**, how they are grouped into **availability zones (AZs)** and **regions**, tenant **organizations** and **projects**, where resources live, and how disaster recovery fits in. For deployment layouts and management placement, see [Deployment topology](architecture/deployment-topology.md). For infrastructure planning, see [Hardware requirements](architecture/deployment-requirements.md) and [Network requirements](architecture/network-requirements.md).

## Superphenix clusters

A **Superphenix cluster** is a **Kubernetes cluster** (typically Talos Linux) on which the Superphenix stack runs. The management plane discovers and operates each cluster through a **`Cluster` custom resource** that declares its **topology**, **geography**, and **connection** details.

Each cluster uses one of two **deployment topologies**:

- **Hyperconverged**: storage and virtualization on the **same** cluster—the simplest layout, usually one cluster per AZ.
- **Decoupled**: clusters are dedicated to **storage** or **virtualization**; an AZ can therefore comprise **several** Superphenix clusters (for example, one storage cluster and one or more workload clusters).

Set `deploymentTopology` and, when decoupled, `type: Storage` or `type: Virtualization` on the `Cluster` resource. See [Deployment topology](architecture/deployment-topology.md) and [Configure a cluster](installation/configuring-a-cluster.md).

## Availability zones

An **availability zone (AZ)** is a **logical grouping** of Superphenix clusters. Clusters in an AZ are treated as one unit of capacity and failure domain for placing tenant resources (VMs, networks, volumes).

In a **hyperconverged** AZ, a single cluster usually runs virtualization, software-defined networking, and storage together. In a **decoupled** AZ, storage and workload tiers are separate Kubernetes clusters registered under the same `availabilityZone`; workload clusters connect to the storage backends defined for that zone.

An AZ may **span multiple nearby datacenters** (a stretched AZ) only when inter-site latency stays very low—aim for about **2 ms round-trip** or less between sites (same campus or metro). Higher latency undermines storage replication, control-plane stability, and VM networking; use **separate AZs** in the same **region** instead. Assign every cluster in the AZ the same `region` and `availabilityZone` values. See [Stretched AZ latency guidance](architecture/network-requirements.md#stretched-az-latency-guidance).

## Regions

An AZ can **span multiple datacenters** as long as latency between them is low (e.g. same campus or metro). The important constraint is **network latency (ping)**: if the sites are too far apart, the cluster’s consistency and performance requirements may not be met. So an AZ is a logical unit of availability that can stretch across nearby datacenters, but not across distant regions.

## Organizations and projects

Superphenix uses a two-level hierarchy for tenant isolation and resource grouping:

- **Organizations**: Top-level container. Users are assigned to organizations and receive roles that apply to the projects within that organization.
- **Projects**: Live inside an organization. Projects are where **resources** (VMs, networks, volumes, etc.) are created and stored. All resources are scoped to a project.

Users are assigned to **organizations** and have **roles on projects** (e.g. viewer, editor, admin). Access control and quotas are applied at the project level, so teams can share an organization while keeping project boundaries clear.

## Resources and availability zones

- **Resources** (VMs, disks, networks, and so on) are **located in availability zones (AZs)**. When you create a resource, it is placed in an AZ.
- **One project can contain resources from multiple AZs.** A project is not tied to a single AZ; you can have VMs in AZ A and AZ B, and storage in both, all under the same project. That makes it easy to spread workloads or to use different AZs for different purposes within the same project.

So: **organizations** contain **projects**; **projects** contain **resources**; **resources** live in **AZs**, and a project can span many AZs.

## Disaster recovery

Disaster recovery is configured **between AZs**. You can set up synchronization or backup so that the data and resources of an **entire project** are replicated or backed up from one AZ to another. That allows failover or restore at the project level: if one AZ is unavailable, you can bring the project’s resources up in another AZ that has been receiving the sync or backups.
