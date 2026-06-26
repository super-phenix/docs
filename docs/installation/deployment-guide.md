# Deployment guide

This guide covers the end-to-end installation of Superphenix, from provisioning Kubernetes on bare metal to management deployment and cluster configuration. Whether you are deploying a single hyperconverged cluster or a large-scale decoupled infrastructure across multiple availability zones, start here for requirements and the recommended installation paths.

## Requirements

Before you begin, ensure your environment meets the necessary specifications and follows our recommended patterns.

- **Kubernetes**: A Kubernetes cluster (v1.28+) is required to host the Superphenix operator and management cluster.
- **Helm**: Helm is required for the initial operator installation.
- **Hardware & network**: Review the dedicated [Hardware](../architecture/deployment-requirements.md) and [Network](../architecture/network-requirements.md) requirements pages.
- **Best practices**: Follow our [Production recommendations](production-recommendations.md) for sizing and high availability.

## Installing the Management Plane

The first step to installing Superphenix is to install the management plane. The management plane will handle installing the rest of Superphenix and handles the lifecycle of the clusters and user/admin access to the entire infrastructure.

Superphenix supports two placement modes, with the management plane being either entirely separate from the AZs or directly ontop of one. Your choice affects connectivity requirements and failure domains.

Check the [deployment topology documentation](../architecture/deployment-topology.md) for a detailed comparison.

<div class="grid cards" markdown>

-   :lucide-server:{ .lg .middle } __Installing inside an AZ__

    ---

    The management plane runs on one of the workload clusters. Easier to bootstrap, best for single-AZ or isolated deployments. Requires a pre-existing Talos cluster on that AZ.

    [:octicons-arrow-right-24: Installing inside an AZ](management-inside-az.md)

-   :lucide-cloud:{ .lg .middle } __Installing outside an AZ__

    ---

    The control plane runs on a dedicated, neutral cluster. Recommended for multi-AZ orchestration and maximum redundancy. Requires API connectivity to every Superphenix cluster you manage.

    [:octicons-arrow-right-24: Installing outside an AZ](management-outside-az.md)

</div>

## Installing the Operating System

Every Superphenix cluster runs on a **Talos Linux** Kubernetes cluster. Choose how you provision it:

<div class="grid cards" markdown>

-   :lucide-terminal:{ .lg .middle } __Manual OS installation__

    ---

    Install Talos and bootstrap Kubernetes yourself with **`talosctl`**. Best for labs, your first cluster, or when management runs on an AZ and you need a pre-existing Talos cluster before installing the operator.

    [:octicons-arrow-right-24: Manual OS installation](manual-os-installation.md)

-   :lucide-bot:{ .lg .middle } __Automated OS installation__

    ---

    Let the **`superphenix-operator`** and **talos-operator** provision servers over BMC/IPMI and manage node lifecycle declaratively. Best for greenfield datacenters and multi-AZ deployments with management outside the workload AZs.

    [:octicons-arrow-right-24: Automated OS installation](automated-os-installation.md)

</div>

## What comes next

1. **[Installing management](installing-management.md)**: install the operator and configure the management stack.
2. **[Installing clusters](installing-clusters.md)**: define `Cluster` resources and connect workload AZs.
