# Deployment guide

This guide walks through installing Superphenix end to end: provisioning Kubernetes on bare metal, deploying the management plane, and configuring your availability zones. Whether you are starting with a single hyperconverged cluster or a large decoupled deployment across multiple AZs, use this page for prerequisites and to choose the right installation path.

## Requirements

Before you begin, confirm that your environment meets these specifications and follows our recommended patterns:

- **Kubernetes**: A Kubernetes cluster (v1.28+) to host the Superphenix operator and management plane.
- **Helm**: Required for the initial operator installation.
- **Hardware & network**: See [Hardware requirements](../architecture/deployment-requirements.md) and [Network requirements](../architecture/network-requirements.md).
- **Best practices**: See [Production recommendations](production-recommendations.md) for sizing and high availability.

## Installing the Management Plane

Start by deciding where the **management plane** runs. It installs and operates the rest of Superphenix, manages cluster lifecycle, and provides operator and tenant access across your infrastructure.

Superphenix supports two placement models: the management plane can run **inside an AZ** or on a **dedicated management cluster** separate from your workload AZs. Your choice affects connectivity requirements and failure domains.

See [Deployment topology](../architecture/deployment-topology.md) for a full comparison.

<div class="grid cards" markdown>

-   :lucide-server:{ .lg .middle } __Installing inside an AZ__

    ---

    The management plane runs on one of the workload clusters. Easier to bootstrap, best for single-AZ or isolated deployments. Requires a pre-existing Talos cluster on that AZ.

    [:octicons-arrow-right-24: Installing inside an AZ](management-inside-az.md)

-   :lucide-cloud:{ .lg .middle } __Installing outside an AZ__

    ---

    The management plane runs on a dedicated management cluster, separate from workload AZs. Recommended for multi-AZ orchestration and maximum redundancy. Requires API connectivity to every Superphenix cluster you manage.

    [:octicons-arrow-right-24: Installing outside an AZ](management-outside-az.md)

</div>

## Installing the Operating System

Every Superphenix cluster runs on **Talos Linux**. Choose how you provision it:

<div class="grid cards" markdown>

-   :lucide-terminal:{ .lg .middle } __Manual OS installation__

    ---

    Install Talos and bootstrap Kubernetes with **`talosctl`**. Best for labs, first clusters, or when the management plane runs inside an AZ and you need Talos in place before installing the operator.

    [:octicons-arrow-right-24: Manual OS installation](manual-os-installation.md)

-   :lucide-bot:{ .lg .middle } __Automated OS installation__

    ---

    Let the **`superphenix-operator`** and **talos-operator** provision servers over BMC/IPMI and manage node lifecycle declaratively. Best for greenfield datacenters and multi-AZ deployments with the management plane outside workload AZs.

    [:octicons-arrow-right-24: Automated OS installation](automated-os-installation.md)

</div>

## Installing an Availability Zone

Each **availability zone** runs the full Superphenix stack on Talos Kubernetes clusters. Choose how storage and workloads are deployed within the AZ:

<div class="grid cards" markdown>

-   :lucide-layers:{ .lg .middle } __Installing hyperconverged__

    ---

    Storage and workloads run on the **same cluster**. The simplest model for single-AZ deployments, labs, and environments that need rapid horizontal scaling.

    [:octicons-arrow-right-24: Installing hyperconverged](installing-hyperconverged.md)

-   :lucide-split:{ .lg .middle } __Installing decoupled__

    ---

    **Dedicated storage** and **workload** clusters operate separately. Better performance isolation and support for shared storage across multiple workload AZs.

    [:octicons-arrow-right-24: Installing decoupled](installing-decoupled.md)

</div>

See [Deployment topology](../architecture/deployment-topology.md) before you commit to a layout.
