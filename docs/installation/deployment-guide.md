# Deployment guide

This guide covers the end-to-end installation of Superphenix, from provisioning Kubernetes on bare metal to operator deployment and cluster configuration. Whether you are deploying a single hyperconverged cluster or a large-scale decoupled infrastructure across multiple availability zones, start here for requirements and the recommended installation paths.

Superphenix supports two installation modes:

- **Hyperconverged**: Storage and virtualization run on the same cluster. Compute and storage share the same nodes.
- **Decoupled**: Storage and virtualization run on separate clusters. Dedicated storage clusters serve one or more virtualization clusters.

## Requirements

Before you begin, ensure your environment meets the necessary specifications and follows our recommended patterns.

- **Kubernetes**: A Kubernetes cluster (v1.28+) is required to host the Superphenix operator.
- **Helm**: Helm is required for the initial operator installation.
- **Hardware & network**: Review the dedicated [Hardware](../architecture/deployment-requirements.md) and [Network](../architecture/network-requirements.md) requirements pages.
- **Best practices**: Follow our [Production recommendations](production-recommendations.md) for sizing and high availability.

### Management "in" vs "out" requirements

The first step to installing Superphenix is to decide where your management cluster will be located.
Superphenix supports two placement modes for the management cluster. Your choice affects connectivity requirements and failure domains.

Check the [deployment topology documentation](../architecture/deployment-topology.md) to learn more about the choices you have. 

<div class="grid cards" markdown>

-   **Management on an AZ**

    ![Management on an AZ](../sketch/mgmt-inside-az.svg)

-   **Management outside the AZ**

    ![Management outside the AZ](../sketch/mgmt-outside-az.svg)

</div>

- **Management on an AZ (Inside)**: The operator and console run on one of the workload clusters. This is easier to bootstrap but creates a dependency on the hosting AZ.
- **Management outside the AZ (Outside)**: The control plane runs on a dedicated, neutral cluster. This is recommended for multi-AZ orchestrations and maximum redundancy.

!!! important
    If you're choosing to deploy the management outside of an AZ, the cluster needs connectivity to the Kubernetes control plane of every Superphenix cluster it will manage.

## Provisioning Kubernetes on bare metal

Every Superphenix AZ runs on a **Talos Linux** Kubernetes cluster. Choose how you provision it:

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

1. **[Installing management](installing-management.md)**: install the operator and configure the management cluster.
2. **[Installing clusters](installing-clusters.md)**: define `Cluster` resources and connect workload AZs.
